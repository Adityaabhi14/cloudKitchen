import { NextRequest, NextResponse } from 'next/server';
import { relationalDb } from '@/../database/db';
import { requireCustomerAuth } from '@/lib/auth';
import { sanitizeString, validateAndFormatPhone, validatePincode } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = requireCustomerAuth(req);
    if ('errorResponse' in auth) return auth.errorResponse;

    const addressId = sanitizeString(params.id, 50);
    const body = await req.json().catch(() => ({}));

    if (body.setDefault) {
      const ok = relationalDb.setDefaultAddress(auth.session.id, addressId);
      const customer = relationalDb.getCustomerById(auth.session.id);
      return NextResponse.json({ success: ok, data: customer?.addresses || [] });
    }

    const updates: any = {};
    if (body.label) updates.label = ['Home', 'Work', 'Other'].includes(body.label) ? body.label : 'Home';
    if (body.fullName) updates.full_name = sanitizeString(body.fullName, 100);
    if (body.phone) {
      const phoneVal = validateAndFormatPhone(body.phone);
      if (phoneVal.valid) updates.phone = phoneVal.formatted;
    }
    if (body.houseFlat) updates.house_flat = sanitizeString(body.houseFlat, 150);
    if (body.street) updates.street = sanitizeString(body.street, 150);
    if (body.area) updates.area = sanitizeString(body.area, 100);
    if (body.city) updates.city = sanitizeString(body.city, 60);
    if (body.state) updates.state = sanitizeString(body.state, 60);
    if (body.pincode && validatePincode(body.pincode)) updates.pincode = body.pincode.toString().trim();
    if (body.instructions !== undefined) updates.instructions = sanitizeString(body.instructions, 300);
    if (body.isDefault !== undefined) updates.is_default = Boolean(body.isDefault);

    const updated = relationalDb.updateCustomerAddress(auth.session.id, addressId, updates);

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Address not found or update failed' }, { status: 404 });
    }

    const customer = relationalDb.getCustomerById(auth.session.id);
    return NextResponse.json({ success: true, data: customer?.addresses || [] });
  } catch (error: any) {
    console.error('Error updating address:', error);
    return NextResponse.json({ success: false, error: 'Failed to update address' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = requireCustomerAuth(req);
    if ('errorResponse' in auth) return auth.errorResponse;

    const addressId = sanitizeString(params.id, 50);
    const ok = relationalDb.deleteCustomerAddress(auth.session.id, addressId);

    const customer = relationalDb.getCustomerById(auth.session.id);
    return NextResponse.json({
      success: ok,
      data: customer?.addresses || [],
    });
  } catch (error: any) {
    console.error('Error deleting address:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete address' }, { status: 500 });
  }
}
