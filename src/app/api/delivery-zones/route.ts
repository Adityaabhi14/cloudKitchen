import { NextRequest, NextResponse } from 'next/server';
import { relationalDb } from '@/../database/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pincode = searchParams.get('pincode');
    const subtotal = Number(searchParams.get('subtotal') || 0);

    if (pincode) {
      const calculation = relationalDb.calculateDeliveryFeeForPincode(pincode, subtotal);
      return NextResponse.json({
        success: true,
        data: calculation,
      });
    }

    const zones = relationalDb.getDeliveryZones();
    return NextResponse.json({
      success: true,
      data: zones,
    });
  } catch (error: any) {
    console.error('Error fetching delivery zones:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch delivery zones' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, pincodes, deliveryFee, minOrder, maxDistanceKm } = body;

    if (!name || !Array.isArray(pincodes) || typeof deliveryFee !== 'number') {
      return NextResponse.json({ success: false, error: 'Invalid zone payload' }, { status: 400 });
    }

    const created = relationalDb.createDeliveryZone({
      name,
      pincodes,
      delivery_fee: deliveryFee,
      min_order: minOrder || 299,
      max_distance_km: maxDistanceKm || 15,
      is_active: 1,
    });

    return NextResponse.json({
      success: true,
      data: created,
    });
  } catch (error: any) {
    console.error('Error creating delivery zone:', error);
    return NextResponse.json({ success: false, error: 'Failed to create delivery zone' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, updates } = body;

    if (!id || !updates) {
      return NextResponse.json({ success: false, error: 'ID and updates required' }, { status: 400 });
    }

    const updated = relationalDb.updateDeliveryZone(id, updates);
    return NextResponse.json({
      success: Boolean(updated),
      data: updated,
    });
  } catch (error: any) {
    console.error('Error updating delivery zone:', error);
    return NextResponse.json({ success: false, error: 'Failed to update delivery zone' }, { status: 500 });
  }
}
