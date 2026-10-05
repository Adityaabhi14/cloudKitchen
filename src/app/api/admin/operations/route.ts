import { NextRequest, NextResponse } from 'next/server';
import { relationalDb } from '@/../database/db';
import { requireAdminAuth } from '@/lib/auth';
import { validateDateString } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = requireAdminAuth(req);
    if ('errorResponse' in auth) return auth.errorResponse;

    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get('date');
    const date = (dateParam && validateDateString(dateParam)) ? dateParam : relationalDb.getTomorrowDate();

    const summary = relationalDb.getKitchenOperationsSummary(date);
    const kanban = relationalDb.getOrdersKanban(date);
    const alerts = relationalDb.getAdminAlerts();

    return NextResponse.json({
      success: true,
      data: {
        summary,
        kanban,
        alerts,
      },
    });
  } catch (error: any) {
    console.error('Error fetching kitchen operations:', error);
    return NextResponse.json({ success: false, error: 'Failed to retrieve operations data' }, { status: 500 });
  }
}
