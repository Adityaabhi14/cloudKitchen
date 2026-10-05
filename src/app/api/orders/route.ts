import { NextRequest, NextResponse } from 'next/server';
import { relationalDb } from '@/../database/db';
import { formatOrderRecord } from '@/lib/formatters';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date') || undefined;
    const status = searchParams.get('status') || undefined;
    const phone = searchParams.get('phone') || undefined;

    const rawOrders = relationalDb.getOrders({ date, status, phone });
    const orders = rawOrders.map(formatOrderRecord);
    return NextResponse.json({ success: true, data: orders });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
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

    // 1. Validate customer and address inputs
    if (!customer?.name?.trim() || !customer?.phone?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Customer name and phone number are required' },
        { status: 400 }
      );
    }

    if (!deliveryAddress?.addressLine1?.trim() || !deliveryAddress?.pincode?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Delivery address and pincode are required' },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Cart items cannot be empty' },
        { status: 400 }
      );
    }

    // 2. Fetch database settings
    const settings = relationalDb.getSettings();

    // 3. Server-side price calculation & stock verification from trusted DB data
    let serverSubtotal = 0;
    const validatedItems: { food_item_id: string; quantity: number }[] = [];

    // Check menu for requested target date
    const { items: dayMenuItems } = relationalDb.getMenuByDate(menuDate);

    for (const it of items) {
      const foodId = it.foodItemId || it.food_item_id;
      const requestedQty = Math.max(1, parseInt(it.quantity, 10) || 1);
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
              error: `Sorry, '${food.name}' has only ${dayItem.remaining_stock} portions remaining for ${menuDate}.`,
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

    // 4. Create immutable order in database
    const createdOrder = relationalDb.createOrder({
      customer: {
        name: customer.name.trim(),
        phone: customer.phone.trim(),
        email: customer.email?.trim(),
      },
      delivery: {
        address: deliveryAddress.addressLine1.trim() + (deliveryAddress.addressLine2 ? `, ${deliveryAddress.addressLine2.trim()}` : ''),
        landmark: deliveryAddress.landmark?.trim(),
        pincode: deliveryAddress.pincode.trim(),
        city: deliveryAddress.city?.trim() || 'Hyderabad',
        slot: deliveryAddress.deliverySlot || 'Lunch (12:30 PM - 2:00 PM)',
        instructions: deliveryAddress.cookingInstructions?.trim(),
      },
      items: validatedItems,
      menu_date: menuDate,
      subtotal: serverSubtotal,
      delivery_fee: serverDeliveryFee,
      packaging_fee: serverPackagingFee,
      discount: serverDiscount,
      total: serverTotal,
      payment_method: paymentMethod || 'UPI',
      payment_status: paymentStatus || 'PAID',
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature,
    });

    const formattedOrder = formatOrderRecord(createdOrder);

    return NextResponse.json({
      success: true,
      message: 'Order confirmed successfully',
      data: formattedOrder,
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to place order' },
      { status: 500 }
    );
  }
}
