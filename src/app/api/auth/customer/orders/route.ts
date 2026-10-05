import { NextRequest, NextResponse } from 'next/server';
import { relationalDb } from '@/../database/db';
import { requireCustomerAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = requireCustomerAuth(req);
    if ('errorResponse' in auth) return auth.errorResponse;

    const customer = relationalDb.getCustomerById(auth.session.id);
    if (!customer || customer.status === 'BLOCKED') {
      return NextResponse.json({ success: false, error: 'Customer account suspended or not found' }, { status: 404 });
    }

    const orders = relationalDb.getCustomerOrders(customer.id);

    return NextResponse.json({
      success: true,
      data: orders,
    });
  } catch (error: any) {
    console.error('Error fetching customer orders:', error);
    return NextResponse.json({ success: false, error: 'Failed to retrieve orders' }, { status: 500 });
  }
}
