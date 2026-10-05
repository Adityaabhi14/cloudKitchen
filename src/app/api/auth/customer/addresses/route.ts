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
  const customerId = getCustomerIdFromReq(req);
  if (!customerId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const customer = relationalDb.getCustomerById(customerId);
  return NextResponse.json({
    success: true,
    data: customer?.addresses || [],
  });
}

export async function POST(req: NextRequest) {
  try {
    const customerId = getCustomerIdFromReq(req);
    if (!customerId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      label,
      fullName,
      phone,
      houseFlat,
      street,
      area,
      city,
      state,
      pincode,
      instructions,
      isDefault,
    } = body;

    if (!fullName || !phone || !houseFlat || !street || !area || !pincode) {
      return NextResponse.json(
        { success: false, error: 'Please provide all required address fields' },
        { status: 400 }
      );
    }

    const created = relationalDb.addCustomerAddress(customerId, {
      label: label || 'Home',
      full_name: fullName,
      phone,
      house_flat: houseFlat,
      street,
      area,
      city: city || 'Hyderabad',
      state: state || 'Telangana',
      pincode,
      instructions,
      is_default: Boolean(isDefault),
    });

    if (!created) {
      return NextResponse.json({ success: false, error: 'Failed to add address' }, { status: 400 });
    }

    const customer = relationalDb.getCustomerById(customerId);
    return NextResponse.json({
      success: true,
      data: {
        address: created,
        addresses: customer?.addresses || [],
      },
    });
  } catch (error: any) {
    console.error('Error adding address:', error);
    return NextResponse.json({ success: false, error: 'Failed to save address' }, { status: 500 });
  }
}
