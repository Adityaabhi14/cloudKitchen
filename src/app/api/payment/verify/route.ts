import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rateLimiter';
import { sanitizeString, timingSafeCompare } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // 1. Rate limiting
    const rateLimit = checkRateLimit(req, RATE_LIMITS.PAYMENT);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: `Too many payment verification requests. Retry in ${rateLimit.resetInSeconds}s.` },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    const safeOrderId = sanitizeString(razorpay_order_id, 80);
    const safePaymentId = sanitizeString(razorpay_payment_id, 80);
    const safeSignature = typeof razorpay_signature === 'string' ? razorpay_signature.trim() : '';

    if (!safeOrderId || !safePaymentId) {
      return NextResponse.json(
        { success: false, error: 'Missing payment details for verification' },
        { status: 400 }
      );
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (keySecret && safeSignature) {
      // Cryptographic HMAC SHA-256 verification using timing-safe comparison
      const expectedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${safeOrderId}|${safePaymentId}`)
        .digest('hex');

      const isAuthentic = timingSafeCompare(expectedSignature, safeSignature);

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
        paymentId: safePaymentId,
      });
    }

    // In production without keys, return warning if signature is absent
    if (process.env.NODE_ENV === 'production' && keySecret && !safeSignature) {
      return NextResponse.json(
        { success: false, error: 'Payment signature is required in production environment' },
        { status: 400 }
      );
    }

    // Sandbox mock verification
    return NextResponse.json({
      success: true,
      verified: true,
      isSandbox: true,
      message: 'Sandbox payment verified',
      paymentId: safePaymentId || `pay_mok_${Date.now()}`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Payment verification failed' },
      { status: 500 }
    );
  }
}
