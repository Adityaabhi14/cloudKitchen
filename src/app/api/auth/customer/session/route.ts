import { NextRequest, NextResponse } from 'next/server';
import { relationalDb } from '@/../database/db';
import { verifyCustomerSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = verifyCustomerSession(req);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: No active customer session' },
        { status: 401 }
      );
    }

    const customer = relationalDb.getCustomerById(session.id);
    if (!customer || customer.status === 'BLOCKED') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Customer account is suspended or not found' },
        { status: 401 }
      );
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
        status: customer.status,
        addresses: customer.addresses || [],
        favorites: customer.favorites || [],
        notificationsEnabled: customer.notifications_enabled !== false,
        marketingEnabled: customer.marketing_enabled !== false,
        createdAt: customer.created_at,
        updatedAt: customer.updated_at,
        lastLoginAt: customer.last_login_at,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Session verification failed' },
      { status: 500 }
    );
  }
}
