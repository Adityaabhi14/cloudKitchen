import { NextRequest, NextResponse } from 'next/server';
import { relationalDb } from '@/../database/db';
import { requireAdminAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = requireAdminAuth(req, 'VIEW_ANALYTICS');
    if ('errorResponse' in auth) return auth.errorResponse;

    const analytics = relationalDb.getDeepAnalytics();
    return NextResponse.json({ success: true, data: analytics });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
