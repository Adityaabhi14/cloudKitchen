import { NextRequest, NextResponse } from 'next/server';
import { relationalDb } from '@/../database/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const cookieToken = req.cookies.get('vindu_admin_session')?.value;
    const token = (authHeader ? authHeader.replace('Bearer ', '') : '') || cookieToken;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: No active session' },
        { status: 401 }
      );
    }

    // Lookup admin in database
    const admins = relationalDb.getAdmins();
    const activeAdmin = admins.find(a => a.status === 'ACTIVE');

    if (!activeAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Session invalid' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: activeAdmin.id,
        username: activeAdmin.username,
        name: activeAdmin.name,
        role: activeAdmin.role,
        token,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Session verification failed' },
      { status: 500 }
    );
  }
}
