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

export async function DELETE(req: NextRequest) {
  try {
    const customerId = getCustomerIdFromReq(req);
    if (!customerId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const ok = relationalDb.softDeleteCustomer(customerId);
    if (!ok) {
      return NextResponse.json({ success: false, error: 'Customer account not found' }, { status: 404 });
    }

    const resp = NextResponse.json({
      success: true,
      message: 'Account successfully closed and personal details anonymized. Past business records have been preserved.',
    });

    resp.cookies.delete('vindu_customer_session');
    return resp;
  } catch (error: any) {
    console.error('Error soft-deleting account:', error);
    return NextResponse.json({ success: false, error: 'Failed to process account deletion' }, { status: 500 });
  }
}
