import { NextRequest, NextResponse } from 'next/server';
import { relationalDb } from '@/../database/db';
import { requireAdminAuth } from '@/lib/auth';
import { validateDateString } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = requireAdminAuth(req, 'EXPORT_REPORTS');
    if ('errorResponse' in auth) return auth.errorResponse;

    const { searchParams } = new URL(req.url);
    const startParam = searchParams.get('startDate');
    const endParam = searchParams.get('endDate');

    const startDate = (startParam && validateDateString(startParam)) ? startParam : '2026-01-01';
    const endDate = (endParam && validateDateString(endParam)) ? endParam : '2026-12-31';

    const csvContent = relationalDb.exportBusinessReportCSV(startDate, endDate);

    return new Response(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="Vindu_Ruchulu_Sales_Report_${startDate}_to_${endDate}.csv"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error: any) {
    console.error('Error generating CSV report:', error);
    return NextResponse.json({ success: false, error: 'Failed to export CSV report' }, { status: 500 });
  }
}
