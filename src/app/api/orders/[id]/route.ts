import { NextRequest, NextResponse } from 'next/server';
import { relationalDb } from '@/../database/db';
import { formatOrderRecord } from '@/lib/formatters';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const rawOrder = relationalDb.getOrderByIdOrNumber(params.id);
    if (!rawOrder) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }
    const order = formatOrderRecord(rawOrder);
    return NextResponse.json({ success: true, data: order });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { status, note, updatedBy } = body;

    if (!status) {
      return NextResponse.json({ success: false, error: 'Status is required' }, { status: 400 });
    }

    const updated = relationalDb.updateOrderStatus(params.id, status, note, updatedBy || 'Kitchen Admin');
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    const formatted = formatOrderRecord(updated);

    return NextResponse.json({
      success: true,
      message: `Order status updated to ${status}`,
      data: formatted,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update order status' },
      { status: 500 }
    );
  }
}
