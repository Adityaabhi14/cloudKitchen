import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rateLimiter';
import { sanitizeString } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // 1. Rate limiting
    const rateLimit = checkRateLimit(req, RATE_LIMITS.PAYMENT);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: `Payment rate limit exceeded. Retry in ${rateLimit.resetInSeconds}s.` },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { amount, currency = 'INR', receipt, notes } = body;

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount < 1 || numAmount > 100000) {
      return NextResponse.json(
        { success: false, error: 'Valid amount between ₹1 and ₹100,000 is required' },
        { status: 400 }
      );
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Amount in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(numAmount * 100);
    const safeReceipt = sanitizeString(receipt || `rcpt_${Date.now()}`, 50);

    if (keyId && keySecret) {
      // Live Razorpay API Call
      const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
      const res = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${auth}`,
        },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: 'INR',
          receipt: safeReceipt,
          notes: typeof notes === 'object' && notes !== null ? notes : {},
        }),
      });

      const orderData = await res.json();
      if (!res.ok) {
        throw new Error(orderData.error?.description || 'Razorpay order creation failed');
      }

      return NextResponse.json({
        success: true,
        orderId: orderData.id,
        amount: orderData.amount,
        currency: orderData.currency,
        keyId: keyId,
        isSandbox: false,
      });
    }

    // Seamless Sandbox Simulator order (for instant testing without needing external keys)
    const mockOrderId = `order_mok_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;

    return NextResponse.json({
      success: true,
      orderId: mockOrderId,
      amount: amountInPaise,
      currency: 'INR',
      keyId: 'rzp_test_mock_vindu_kitchen',
      isSandbox: true,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Payment initiation failed' },
      { status: 500 }
    );
  }
}
