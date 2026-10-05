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
  try {
    const customerId = getCustomerIdFromReq(req);
    if (!customerId) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Please log in to view your orders' }, { status: 401 });
    }

    const customer = relationalDb.getCustomerById(customerId);
    if (!customer) {
      return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
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
