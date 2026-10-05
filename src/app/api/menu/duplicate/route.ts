import { NextRequest, NextResponse } from 'next/server';
import { relationalDb } from '@/../database/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sourceDate, targetDate } = body;

    if (!sourceDate || !targetDate) {
      return NextResponse.json(
        { success: false, error: 'Source date and target date are required' },
        { status: 400 }
      );
    }

    const duplicatedMenu = relationalDb.duplicateMenu(sourceDate, targetDate);

    return NextResponse.json({
      success: true,
      message: `Menu successfully duplicated from ${sourceDate} to ${targetDate}`,
      data: duplicatedMenu,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to duplicate menu' },
      { status: 500 }
    );
  }
}
