import { NextRequest, NextResponse } from 'next/server';
import { relationalDb } from '@/../database/db';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rateLimiter';
import { signCustomerSession, setCustomerCookie } from '@/lib/auth';
import { sanitizeString, validateEmail, validateAndFormatPhone } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // 1. Rate limiting check
    const rateLimit = checkRateLimit(req, RATE_LIMITS.AUTH);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many authentication attempts. Please try again in ${rateLimit.resetInSeconds} seconds.`,
        },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { googleId, email, name, profileImage, phone, credential } = body;

    let resolvedGoogleId = typeof googleId === 'string' ? sanitizeString(googleId, 100) : '';
    let resolvedEmail = typeof email === 'string' ? sanitizeString(email, 120) : '';
    let resolvedName = typeof name === 'string' ? sanitizeString(name, 100) : '';
    let resolvedImage = typeof profileImage === 'string' ? profileImage.trim() : '';

    // Decode and parse JWT payload if Google Identity Services credential token is passed
    if (credential && typeof credential === 'string') {
      try {
        const parts = credential.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
          if (payload.sub) resolvedGoogleId = sanitizeString(payload.sub, 100);
          if (payload.email) resolvedEmail = sanitizeString(payload.email, 120);
          if (payload.name) resolvedName = sanitizeString(payload.name, 100);
          if (payload.picture) resolvedImage = payload.picture;
        }
      } catch (err) {
        console.error('Error decoding Google credential token:', err);
      }
    }

    if (!resolvedEmail || !validateEmail(resolvedEmail)) {
      return NextResponse.json(
        { success: false, error: 'Valid Google email is required for customer authentication' },
        { status: 400 }
      );
    }

    if (!resolvedGoogleId) {
      resolvedGoogleId = `goog_${resolvedEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;
    }

    if (!resolvedName) {
      resolvedName = resolvedEmail.split('@')[0];
    }

    let sanitizedPhone: string | undefined = undefined;
    if (phone) {
      const phoneValidation = validateAndFormatPhone(phone);
      if (phoneValidation.valid) {
        sanitizedPhone = phoneValidation.formatted;
      }
    }

    // Find or create customer record in database
    const customer = relationalDb.findOrCreateCustomerByGoogle({
      googleId: resolvedGoogleId,
      email: resolvedEmail,
      name: resolvedName,
      profileImage: resolvedImage,
      phone: sanitizedPhone,
    });

    if (customer.status === 'BLOCKED') {
      return NextResponse.json(
        { success: false, error: 'Your account is suspended. Please contact customer support.' },
        { status: 403 }
      );
    }

    // Sign a tamper-proof session token
    const token = signCustomerSession(customer);

    const response = NextResponse.json({
      success: true,
      data: {
        customer: {
          id: customer.id,
          googleId: customer.google_id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          profileImage: customer.profile_image,
          status: customer.status,
          addresses: customer.addresses || [],
          favorites: customer.favorites || [],
          notificationsEnabled: customer.notifications_enabled !== false,
          marketingEnabled: customer.marketing_enabled !== false,
          createdAt: customer.created_at,
          updatedAt: customer.updated_at,
          lastLoginAt: customer.last_login_at,
        },
        token,
      },
    });

    // Set secure HTTP-only cookie
    setCustomerCookie(response, token);

    return response;
  } catch (error: any) {
    console.error('Customer Google Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Authentication failed. Please try again.' },
      { status: 500 }
    );
  }
}
