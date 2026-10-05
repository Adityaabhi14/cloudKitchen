import { NextRequest, NextResponse } from 'next/server';
import { relationalDb } from '@/../database/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { googleId, email, name, profileImage, phone, credential } = body;

    // Support both direct Google profile or credential payload
    let resolvedGoogleId = googleId;
    let resolvedEmail = email;
    let resolvedName = name;
    let resolvedImage = profileImage;

    // Decode JWT payload if credential was passed from Google Identity Services
    if (credential && typeof credential === 'string') {
      try {
        const parts = credential.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
          if (payload.sub) resolvedGoogleId = payload.sub;
          if (payload.email) resolvedEmail = payload.email;
          if (payload.name) resolvedName = payload.name;
          if (payload.picture) resolvedImage = payload.picture;
        }
      } catch (err) {
        console.error('Error decoding Google credential token:', err);
      }
    }

    if (!resolvedEmail) {
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

    // Find or create customer record in database
    const customer = relationalDb.findOrCreateCustomerByGoogle({
      googleId: resolvedGoogleId,
      email: resolvedEmail,
      name: resolvedName,
      profileImage: resolvedImage,
      phone,
    });

    if (customer.status === 'BLOCKED') {
      return NextResponse.json(
        { success: false, error: 'Your account is suspended. Please contact customer care.' },
        { status: 403 }
      );
    }

    const sessionPayload = {
      id: customer.id,
      googleId: customer.google_id,
      email: customer.email,
      name: customer.name,
      profileImage: customer.profile_image,
      phone: customer.phone,
      issuedAt: Date.now(),
    };

    const token = Buffer.from(JSON.stringify(sessionPayload)).toString('base64');

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

    // Set HTTP session cookie for seamless Next.js session persistence
    response.cookies.set('vindu_customer_session', token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch (error: any) {
    console.error('Customer Google Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Authentication failed. Please try again.' },
      { status: 500 }
    );
  }
}
