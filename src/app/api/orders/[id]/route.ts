import { NextRequest, NextResponse } from 'next/server';
import { relationalDb } from '@/../database/db';
import { formatOrderRecord } from '@/lib/formatters';
import { requireAdminAuth } from '@/lib/auth';
import { sanitizeString } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cleanId = sanitizeString(params.id, 60);
    const rawOrder = relationalDb.getOrderByIdOrNumber(cleanId);
    if (!rawOrder) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }
    const order = formatOrderRecord(rawOrder);
    return NextResponse.json({ success: true, data: order });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = requireAdminAuth(req, 'UPDATE_ORDER_STATUS');
    if ('errorResponse' in auth) return auth.errorResponse;

    const cleanId = sanitizeString(params.id, 60);
    const body = await req.json().catch(() => ({}));
    const { status, note, updatedBy } = body;

    const validStatuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json({ success: false, error: 'Valid order status is required' }, { status: 400 });
    }

    const cleanNote = note ? sanitizeString(note, 300) : undefined;
    const actor = auth.session.name || updatedBy || 'Kitchen Admin';

    const updated = relationalDb.updateOrderStatus(cleanId, status, cleanNote, actor);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    relationalDb.logAudit(
      auth.session.id,
      auth.session.name,
      'ORDER_STATUS_CHANGED',
      'Order',
      cleanId,
      `Changed order #${updated.order_number} status to '${status}'`
    );

    const formatted = formatOrderRecord(updated);

    return NextResponse.json({
      success: true,
      message: `Order status updated to ${status}`,
      data: formatted,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to update order status' },
      { status: 500 }
    );
  }
}
