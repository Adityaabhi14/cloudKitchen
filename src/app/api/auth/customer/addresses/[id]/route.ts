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

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const customerId = getCustomerIdFromReq(req);
    if (!customerId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const addressId = params.id;
    const body = await req.json();

    if (body.setDefault) {
      const ok = relationalDb.setDefaultAddress(customerId, addressId);
      const customer = relationalDb.getCustomerById(customerId);
      return NextResponse.json({ success: ok, data: customer?.addresses || [] });
    }

    const updated = relationalDb.updateCustomerAddress(customerId, addressId, {
      label: body.label,
      full_name: body.fullName,
      phone: body.phone,
      house_flat: body.houseFlat,
      street: body.street,
      area: body.area,
      city: body.city,
      state: body.state,
      pincode: body.pincode,
      instructions: body.instructions,
      is_default: body.isDefault,
    });

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Address not found or update failed' }, { status: 404 });
    }

    const customer = relationalDb.getCustomerById(customerId);
    return NextResponse.json({ success: true, data: customer?.addresses || [] });
  } catch (error: any) {
    console.error('Error updating address:', error);
    return NextResponse.json({ success: false, error: 'Failed to update address' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const customerId = getCustomerIdFromReq(req);
    if (!customerId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const addressId = params.id;
    const ok = relationalDb.deleteCustomerAddress(customerId, addressId);

    const customer = relationalDb.getCustomerById(customerId);
    return NextResponse.json({
      success: ok,
      data: customer?.addresses || [],
    });
  } catch (error: any) {
    console.error('Error deleting address:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete address' }, { status: 500 });
  }
}
