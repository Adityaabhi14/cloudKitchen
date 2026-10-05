import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, currency = 'INR', receipt, notes } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ success: false, error: 'Valid amount is required' }, { status: 400 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Amount in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(Number(amount) * 100);

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
          currency,
          receipt: receipt || `rcpt_${Date.now()}`,
          notes: notes || {},
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
    const mockOrderId = `order_mok_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    return NextResponse.json({
      success: true,
      orderId: mockOrderId,
      amount: amountInPaise,
      currency,
      keyId: 'rzp_test_mock_vindu_kitchen',
      isSandbox: true,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Payment initiation failed' },
      { status: 500 }
    );
  }
}
