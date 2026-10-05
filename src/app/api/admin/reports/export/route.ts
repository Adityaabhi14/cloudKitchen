import { NextRequest, NextResponse } from 'next/server';
import { relationalDb } from '@/../database/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate') || '2026-01-01';
    const endDate = searchParams.get('endDate') || '2026-12-31';

    const csvContent = relationalDb.exportBusinessReportCSV(startDate, endDate);

    return new Response(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="Vindu_Ruchulu_Sales_Report_${startDate}_to_${endDate}.csv"`,
      },
    });
  } catch (error: any) {
    console.error('Error generating CSV report:', error);
    return NextResponse.json({ success: false, error: 'Failed to export CSV report' }, { status: 500 });
  }
}
