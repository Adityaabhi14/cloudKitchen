import { NextRequest, NextResponse } from 'next/server';
import { relationalDb } from '@/../database/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Please enter both username and password' },
        { status: 400 }
      );
    }

    const admin = relationalDb.verifyAdmin(username.trim(), password.trim());
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Set secure session cookie
    const response = NextResponse.json({
      success: true,
      message: 'Admin authenticated successfully',
      data: {
        id: admin.id,
        username: admin.username,
        name: admin.name,
        role: admin.role,
        permissions: admin.permissions,
        token: admin.token,
      },
    });

    response.cookies.set('vindu_admin_session', admin.token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Authentication error' },
      { status: 500 }
    );
  }
}
