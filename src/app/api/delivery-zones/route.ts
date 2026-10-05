import { NextRequest, NextResponse } from 'next/server';
import { relationalDb } from '@/../database/db';
import { requireAdminAuth } from '@/lib/auth';
import { sanitizeString, validatePincode } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pincode = searchParams.get('pincode');
    const subtotal = Number(searchParams.get('subtotal') || 0);

    if (pincode) {
      const cleanPincode = sanitizeString(pincode, 10);
      const calculation = relationalDb.calculateDeliveryFeeForPincode(cleanPincode, Math.max(0, subtotal));
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
    const auth = requireAdminAuth(req, 'MANAGE_SETTINGS');
    if ('errorResponse' in auth) return auth.errorResponse;

    const body = await req.json().catch(() => ({}));
    const { name, pincodes, deliveryFee, minOrder, maxDistanceKm } = body;

    const cleanName = sanitizeString(name, 100);
    const numDeliveryFee = Number(deliveryFee);

    if (!cleanName || !Array.isArray(pincodes) || isNaN(numDeliveryFee)) {
      return NextResponse.json({ success: false, error: 'Valid zone name, pincodes array, and delivery fee required' }, { status: 400 });
    }

    const validatedPincodes = pincodes
      .map((p: any) => p.toString().trim())
      .filter((p: string) => validatePincode(p));

    const created = relationalDb.createDeliveryZone({
      name: cleanName,
      pincodes: validatedPincodes,
      delivery_fee: Math.max(0, numDeliveryFee),
      min_order: Math.max(0, Number(minOrder) || 299),
      max_distance_km: Math.max(1, Number(maxDistanceKm) || 15),
      is_active: 1,
    });

    relationalDb.logAudit(
      auth.session.id,
      auth.session.name,
      'DELIVERY_ZONE_CREATED',
      'DeliveryZone',
      created.id,
      `Created delivery zone '${cleanName}'`
    );

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
    const auth = requireAdminAuth(req, 'MANAGE_SETTINGS');
    if ('errorResponse' in auth) return auth.errorResponse;

    const body = await req.json().catch(() => ({}));
    const { id, updates } = body;
    const cleanId = sanitizeString(id, 50);

    if (!cleanId || !updates) {
      return NextResponse.json({ success: false, error: 'ID and updates required' }, { status: 400 });
    }

    const updated = relationalDb.updateDeliveryZone(cleanId, updates);
    return NextResponse.json({
      success: Boolean(updated),
      data: updated,
    });
  } catch (error: any) {
    console.error('Error updating delivery zone:', error);
    return NextResponse.json({ success: false, error: 'Failed to update delivery zone' }, { status: 500 });
  }
}
