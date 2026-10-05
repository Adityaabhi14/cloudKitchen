import { NextRequest, NextResponse } from 'next/server';
import { relationalDb } from '@/../database/db';
import { requireCustomerAuth } from '@/lib/auth';
import { sanitizeString } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = requireCustomerAuth(req);
    if ('errorResponse' in auth) return auth.errorResponse;

    const notifications = relationalDb.getNotifications(auth.session.id);
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
    const auth = requireCustomerAuth(req);
    if ('errorResponse' in auth) return auth.errorResponse;

    const body = await req.json().catch(() => ({}));
    const notificationId = sanitizeString(body.notificationId, 50);

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
