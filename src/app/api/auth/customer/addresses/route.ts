import { NextRequest, NextResponse } from 'next/server';
import { relationalDb } from '@/../database/db';
import { requireCustomerAuth } from '@/lib/auth';
import { sanitizeString, validateAndFormatPhone, validatePincode } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = requireCustomerAuth(req);
  if ('errorResponse' in auth) return auth.errorResponse;

  const customer = relationalDb.getCustomerById(auth.session.id);
  return NextResponse.json({
    success: true,
    data: customer?.addresses || [],
  });
}

export async function POST(req: NextRequest) {
  try {
    const auth = requireCustomerAuth(req);
    if ('errorResponse' in auth) return auth.errorResponse;

    const body = await req.json().catch(() => ({}));
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

    const cleanFullName = sanitizeString(fullName, 100);
    const cleanHouse = sanitizeString(houseFlat, 150);
    const cleanStreet = sanitizeString(street, 150);
    const cleanArea = sanitizeString(area, 100);
    const cleanCity = sanitizeString(city || 'Hyderabad', 60);
    const cleanState = sanitizeString(state || 'Telangana', 60);
    const cleanPincode = (pincode || '').toString().trim();
    const cleanInstructions = sanitizeString(instructions, 300);

    if (!cleanFullName || !phone || !cleanHouse || !cleanStreet || !cleanArea || !cleanPincode) {
      return NextResponse.json(
        { success: false, error: 'Please provide all required address fields' },
        { status: 400 }
      );
    }

    const phoneVal = validateAndFormatPhone(phone);
    if (!phoneVal.valid) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid 10-digit mobile number' },
        { status: 400 }
      );
    }

    if (!validatePincode(cleanPincode)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid 6-digit postal pincode' },
        { status: 400 }
      );
    }

    const validLabel = ['Home', 'Work', 'Other'].includes(label) ? label : 'Home';

    const created = relationalDb.addCustomerAddress(auth.session.id, {
      label: validLabel,
      full_name: cleanFullName,
      phone: phoneVal.formatted,
      house_flat: cleanHouse,
      street: cleanStreet,
      area: cleanArea,
      city: cleanCity,
      state: cleanState,
      pincode: cleanPincode,
      instructions: cleanInstructions,
      is_default: Boolean(isDefault),
    });

    if (!created) {
      return NextResponse.json({ success: false, error: 'Failed to add address' }, { status: 400 });
    }

    const customer = relationalDb.getCustomerById(auth.session.id);
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
