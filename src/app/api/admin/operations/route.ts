import { NextRequest, NextResponse } from 'next/server';
import { relationalDb } from '@/../database/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date') || relationalDb.getTomorrowDate();

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
