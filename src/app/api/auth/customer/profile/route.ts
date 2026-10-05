import { NextRequest, NextResponse } from 'next/server';
import { relationalDb } from '@/../database/db';
import { requireCustomerAuth } from '@/lib/auth';
import { sanitizeString, validateAndFormatPhone } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = requireCustomerAuth(req);
  if ('errorResponse' in auth) return auth.errorResponse;

  const customer = relationalDb.getCustomerById(auth.session.id);
  if (!customer || customer.status === 'BLOCKED') {
    return NextResponse.json({ success: false, error: 'Customer not found or blocked' }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    data: {
      id: customer.id,
      googleId: customer.google_id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      profileImage: customer.profile_image,
      addresses: customer.addresses || [],
      favorites: customer.favorites || [],
      notificationsEnabled: customer.notifications_enabled !== false,
      marketingEnabled: customer.marketing_enabled !== false,
      createdAt: customer.created_at,
      updatedAt: customer.updated_at,
      lastLoginAt: customer.last_login_at,
    },
  });
}

export async function PUT(req: NextRequest) {
  try {
    const auth = requireCustomerAuth(req);
    if ('errorResponse' in auth) return auth.errorResponse;

    const body = await req.json().catch(() => ({}));
    const { name, phone, notificationsEnabled, marketingEnabled, profileImage } = body;

    const updates: {
      name?: string;
      phone?: string;
      notifications_enabled?: boolean;
      marketing_enabled?: boolean;
      profile_image?: string;
    } = {};

    if (typeof name === 'string' && name.trim()) {
      updates.name = sanitizeString(name, 100);
    }

    if (phone !== undefined) {
      if (typeof phone === 'string' && phone.trim()) {
        const phoneVal = validateAndFormatPhone(phone);
        if (phoneVal.valid) {
          updates.phone = phoneVal.formatted;
        }
      } else if (phone === null || phone === '') {
        updates.phone = undefined;
      }
    }

    if (typeof notificationsEnabled === 'boolean') {
      updates.notifications_enabled = notificationsEnabled;
    }

    if (typeof marketingEnabled === 'boolean') {
      updates.marketing_enabled = marketingEnabled;
    }

    if (typeof profileImage === 'string' && profileImage.trim()) {
      updates.profile_image = profileImage.trim();
    }

    const updated = relationalDb.updateCustomerProfile(auth.session.id, updates);

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Failed to update profile' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        googleId: updated.google_id,
        name: updated.name,
        email: updated.email,
        phone: updated.phone,
        profileImage: updated.profile_image,
        addresses: updated.addresses || [],
        favorites: updated.favorites || [],
        notificationsEnabled: updated.notifications_enabled !== false,
        marketingEnabled: updated.marketing_enabled !== false,
        createdAt: updated.created_at,
        updatedAt: updated.updated_at,
        lastLoginAt: updated.last_login_at,
      },
    });
  } catch (error: any) {
    console.error('Profile update error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update profile' }, { status: 500 });
  }
}
