import { NextRequest, NextResponse } from 'next/server';
import { relationalDb } from '@/../database/db';
import { requireCustomerAuth, clearCustomerCookie } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function DELETE(req: NextRequest) {
  try {
    const auth = requireCustomerAuth(req);
    if ('errorResponse' in auth) return auth.errorResponse;

    const ok = relationalDb.softDeleteCustomer(auth.session.id);
    if (!ok) {
      return NextResponse.json({ success: false, error: 'Customer account not found' }, { status: 404 });
    }

    const resp = NextResponse.json({
      success: true,
      message: 'Account successfully closed and personal details anonymized. Past business records have been preserved.',
    });

    clearCustomerCookie(resp);
    return resp;
  } catch (error: any) {
    console.error('Error soft-deleting account:', error);
    return NextResponse.json({ success: false, error: 'Failed to process account deletion' }, { status: 500 });
  }
}
