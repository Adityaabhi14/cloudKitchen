import { NextRequest, NextResponse } from 'next/server';
import { relationalDb } from '@/../database/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const cookieToken = req.cookies.get('vindu_customer_session')?.value;
    const token = (authHeader ? authHeader.replace('Bearer ', '') : '') || cookieToken;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'No active customer session' },
        { status: 401 }
      );
    }

    let customerId = '';
    let customerEmail = '';

    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
      if (decoded.id) customerId = decoded.id;
      if (decoded.email) customerEmail = decoded.email;
    } catch {
      customerId = token;
    }

    // Lookup fresh customer details in DB
    let customer = customerId ? relationalDb.getCustomerById(customerId) : null;
    if (!customer && customerEmail) {
      customer = relationalDb.getCustomerByEmail(customerEmail);
    }

    if (!customer || customer.status === 'BLOCKED' || customer.is_deleted === 1) {
      const resp = NextResponse.json(
        { success: false, error: 'Customer session invalid or expired' },
        { status: 401 }
      );
      resp.cookies.delete('vindu_customer_session');
      return resp;
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
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
  } catch (error: any) {
    console.error('Customer session verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Session verification failed' },
      { status: 500 }
    );
  }
}
