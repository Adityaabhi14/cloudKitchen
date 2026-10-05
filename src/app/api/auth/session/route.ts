import { NextRequest, NextResponse } from 'next/server';
import { relationalDb } from '@/../database/db';
import { verifyAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = verifyAdminSession(req);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: No active or valid admin session' },
        { status: 401 }
      );
    }

    const admin = relationalDb.getAdmins().find(a => a.id === session.id);
    if (!admin || admin.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin account is inactive or disabled' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: admin.id,
        username: admin.username,
        name: admin.name,
        role: admin.role,
        permissions: session.permissions,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Session verification failed' },
      { status: 500 }
    );
  }
}
