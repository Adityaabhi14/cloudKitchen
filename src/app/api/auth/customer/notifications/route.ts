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
    const customerId = getCustomerIdFromReq(req) || 'ALL';
    const notifications = relationalDb.getNotifications(customerId);
    return NextResponse.json({
      success: true,
      data: notifications,
    });
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { notificationId } = body;

    if (notificationId) {
      const ok = relationalDb.markNotificationRead(notificationId);
      return NextResponse.json({ success: ok });
    }

    return NextResponse.json({ success: false, error: 'Notification ID required' }, { status: 400 });
  } catch (error: any) {
    console.error('Error updating notification:', error);
    return NextResponse.json({ success: false, error: 'Failed to update notification' }, { status: 500 });
  }
}
