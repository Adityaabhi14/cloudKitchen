import { NextRequest, NextResponse } from 'next/server';
import { relationalDb } from '@/../database/db';
import { formatOrderRecord } from '@/lib/formatters';
import { verifyAdminSession, verifyCustomerSession } from '@/lib/auth';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rateLimiter';
import { sanitizeString, validateAndFormatPhone, validatePincode, validateEmail, validateDateString } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const adminSession = verifyAdminSession(req);
    const customerSession = verifyCustomerSession(req);

    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get('date');
    const statusParam = searchParams.get('status');
    const phoneParam = searchParams.get('phone');

    const date = (dateParam && validateDateString(dateParam)) ? dateParam : undefined;
    const status = statusParam ? sanitizeString(statusParam, 30) : undefined;

    // Admin gets full access with query filters
    if (adminSession) {
      const rawOrders = relationalDb.getOrders({ date, status, phone: phoneParam || undefined });
      const orders = rawOrders.map(formatOrderRecord);
      return NextResponse.json({ success: true, data: orders });
    }

    // Authenticated Customer gets their own orders
    if (customerSession) {
      const customer = relationalDb.getCustomerById(customerSession.id);
      const customerPhone = customer?.phone || customerSession.phone;
      const rawOrders = relationalDb.getOrders({
        date,
        status,
        phone: customerPhone || undefined,
      });
      const orders = rawOrders.map(formatOrderRecord);
      return NextResponse.json({ success: true, data: orders });
    }

    // Public lookup by validated phone number (e.g. for order tracking)
    if (phoneParam) {
      const phoneVal = validateAndFormatPhone(phoneParam);
      if (phoneVal.valid) {
        const rawOrders = relationalDb.getOrders({ date, status, phone: phoneVal.formatted });
        const orders = rawOrders.map(formatOrderRecord);
        return NextResponse.json({ success: true, data: orders });
      }
    }

    // Reject unauthenticated broad queries
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Authentication required to view full order repository' },
      { status: 401 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve orders' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // 1. Rate limiting for order creation
    const rateLimit = checkRateLimit(req, RATE_LIMITS.ORDER);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: `Order placement rate limit exceeded. Retry in ${rateLimit.resetInSeconds}s.` },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const {
      customer,
      deliveryAddress,
      items,
      appliedPromo,
      menuDate,
      paymentMethod,
      paymentStatus,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = body;

    // 2. Validate customer details
    const cleanCustomerName = sanitizeString(customer?.name, 100);
    const phoneVal = validateAndFormatPhone(customer?.phone || '');
    const cleanEmail = customer?.email && validateEmail(customer.email) ? customer.email.trim() : undefined;

    if (!cleanCustomerName || !phoneVal.valid) {
      return NextResponse.json(
        { success: false, error: 'A valid customer name and 10-digit mobile number are required' },
        { status: 400 }
      );
    }

    // 3. Validate delivery address
    const cleanAddress1 = sanitizeString(deliveryAddress?.addressLine1, 150);
    const cleanAddress2 = sanitizeString(deliveryAddress?.addressLine2, 150);
    const cleanLandmark = sanitizeString(deliveryAddress?.landmark, 100);
    const cleanPincode = (deliveryAddress?.pincode || '').toString().trim();
    const cleanCity = sanitizeString(deliveryAddress?.city || 'Hyderabad', 60);
    const cleanSlot = sanitizeString(deliveryAddress?.deliverySlot || 'Lunch (12:30 PM - 2:00 PM)', 60);
    const cleanInstructions = sanitizeString(deliveryAddress?.cookingInstructions, 300);

    if (!cleanAddress1 || !validatePincode(cleanPincode)) {
      return NextResponse.json(
        { success: false, error: 'Delivery address and valid 6-digit postal pincode are required' },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Cart items cannot be empty' },
        { status: 400 }
      );
    }

    const targetDate = (menuDate && validateDateString(menuDate)) ? menuDate : relationalDb.getTomorrowDate();

    // 4. Fetch database settings
    const settings = relationalDb.getSettings();

    // 5. Server-side price calculation & stock verification from trusted DB data
    let serverSubtotal = 0;
    const validatedItems: { food_item_id: string; quantity: number }[] = [];

    const { items: dayMenuItems } = relationalDb.getMenuByDate(targetDate);

    for (const it of items) {
      const foodId = sanitizeString(it.foodItemId || it.food_item_id, 50);
      const requestedQty = Math.max(1, Math.min(20, parseInt(it.quantity, 10) || 1));
      const food = relationalDb.getFoodItemById(foodId);

      if (!food) {
        return NextResponse.json(
          { success: false, error: `Invalid item selected (ID: ${foodId})` },
          { status: 400 }
        );
      }

      // Check stock on date-based menu
      const dayItem = dayMenuItems.find(d => d.food_item_id === foodId);
      if (dayItem) {
        if (dayItem.status === 'SOLD_OUT' || dayItem.remaining_stock < requestedQty) {
          return NextResponse.json(
            {
              success: false,
              error: `Sorry, '${food.name}' has only ${dayItem.remaining_stock} portions remaining for ${targetDate}.`,
            },
            { status: 400 }
          );
        }
      }

      serverSubtotal += food.base_price * requestedQty;
      validatedItems.push({
        food_item_id: food.id,
        quantity: requestedQty,
      });
    }

    // Calculate packaging fee, delivery fee, and promo discount server-side
    const serverPackagingFee = serverSubtotal > 0 ? (settings.packaging_fee ?? 20) : 0;
    const freeDeliveryThreshold = settings.free_delivery_threshold ?? 600;
    const baseDeliveryFee = settings.delivery_fee ?? 40;
    const serverDeliveryFee = serverSubtotal >= freeDeliveryThreshold ? 0 : baseDeliveryFee;

    let serverDiscount = 0;
    const promoCode = (appliedPromo || body.promoCode || '').toString().toUpperCase().trim();
    if (promoCode === 'VINDU10') {
      serverDiscount = Math.min(100, Math.round(serverSubtotal * 0.10));
    } else if (promoCode === 'FIRSTFEAST') {
      serverDiscount = Math.min(150, Math.round(serverSubtotal * 0.15));
    }

    const serverTotal = Math.max(0, serverSubtotal + serverDeliveryFee + serverPackagingFee - serverDiscount);

    // 6. Create immutable order in database
    const createdOrder = relationalDb.createOrder({
      customer: {
        name: cleanCustomerName,
        phone: phoneVal.formatted,
        email: cleanEmail,
      },
      delivery: {
        address: cleanAddress1 + (cleanAddress2 ? `, ${cleanAddress2}` : ''),
        landmark: cleanLandmark,
        pincode: cleanPincode,
        city: cleanCity,
        slot: cleanSlot,
        instructions: cleanInstructions,
      },
      items: validatedItems,
      menu_date: targetDate,
      subtotal: serverSubtotal,
      delivery_fee: serverDeliveryFee,
      packaging_fee: serverPackagingFee,
      discount: serverDiscount,
      total: serverTotal,
      payment_method: sanitizeString(paymentMethod || 'UPI', 20),
      payment_status: paymentStatus === 'PAID' ? 'PAID' : 'PENDING',
      razorpay_order_id: sanitizeString(razorpayOrderId, 80),
      razorpay_payment_id: sanitizeString(razorpayPaymentId, 80),
      razorpay_signature: typeof razorpaySignature === 'string' ? razorpaySignature.trim() : undefined,
    });

    const formattedOrder = formatOrderRecord(createdOrder);

    return NextResponse.json({
      success: true,
      message: 'Order confirmed successfully',
      data: formattedOrder,
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to place order' },
      { status: 500 }
    );
  }
}
