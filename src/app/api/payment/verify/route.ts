import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id) {
      return NextResponse.json(
        { success: false, error: 'Missing payment details for verification' },
        { status: 400 }
      );
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (keySecret && razorpay_signature) {
      // Cryptographic HMAC SHA-256 verification
      const expectedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      const isAuthentic = expectedSignature === razorpay_signature;

      if (!isAuthentic) {
        return NextResponse.json(
          { success: false, error: 'Payment signature verification failed' },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        verified: true,
        message: 'Payment verified securely',
        paymentId: razorpay_payment_id,
      });
    }

    // Sandbox mock verification
    return NextResponse.json({
      success: true,
      verified: true,
      isSandbox: true,
      message: 'Sandbox payment verified',
      paymentId: razorpay_payment_id || `pay_mok_${Date.now()}`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Payment verification failed' },
      { status: 500 }
    );
  }
}
