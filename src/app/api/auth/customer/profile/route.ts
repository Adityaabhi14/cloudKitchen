import { NextRequest, NextResponse } from 'next/server';
import { relationalDb } from '@/../database/db';

export const dynamic = 'force-dynamic';

function getCustomerIdFromReq(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization');
  const cookieToken = req.cookies.get('vindu_customer_session')?.value;
  const token = (authHeader ? authHeader.replace('Bearer ', '') : '') || cookieToken;
  if (!token) return null;
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
    return decoded.id || null;
  } catch {
    return token;
  }
}

export async function GET(req: NextRequest) {
  const customerId = getCustomerIdFromReq(req);
  if (!customerId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const customer = relationalDb.getCustomerById(customerId);
  if (!customer) {
    return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
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
    const customerId = getCustomerIdFromReq(req);
    if (!customerId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, phone, notificationsEnabled, marketingEnabled, profileImage } = body;

    const updated = relationalDb.updateCustomerProfile(customerId, {
      name,
      phone,
      notifications_enabled: notificationsEnabled,
      marketing_enabled: marketingEnabled,
      profile_image: profileImage,
    });

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
