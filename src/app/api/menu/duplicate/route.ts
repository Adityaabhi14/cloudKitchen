import { NextRequest, NextResponse } from 'next/server';
import { relationalDb } from '@/../database/db';
import { requireAdminAuth } from '@/lib/auth';
import { validateDateString } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const auth = requireAdminAuth(req, 'MANAGE_MENU');
    if ('errorResponse' in auth) return auth.errorResponse;

    const body = await req.json().catch(() => ({}));
    const { sourceDate, targetDate } = body;

    if (!sourceDate || !targetDate || !validateDateString(sourceDate) || !validateDateString(targetDate)) {
      return NextResponse.json(
        { success: false, error: 'Valid source date and target date are required (YYYY-MM-DD)' },
        { status: 400 }
      );
    }

    const duplicatedMenu = relationalDb.duplicateMenu(sourceDate, targetDate);

    relationalDb.logAudit(
      auth.session.id,
      auth.session.name,
      'MENU_DUPLICATED',
      'Menu',
      targetDate,
      `Duplicated menu from ${sourceDate} to ${targetDate}`
    );

    return NextResponse.json({
      success: true,
      message: `Menu successfully duplicated from ${sourceDate} to ${targetDate}`,
      data: duplicatedMenu,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to duplicate menu' },
      { status: 500 }
    );
  }
}
