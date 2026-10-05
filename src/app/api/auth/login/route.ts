import { NextRequest, NextResponse } from 'next/server';
import { relationalDb } from '@/../database/db';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rateLimiter';
import { signAdminSession, setAdminCookie } from '@/lib/auth';
import { sanitizeString } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // 1. Rate limiting check to prevent brute-force attacks
    const rateLimit = checkRateLimit(req, RATE_LIMITS.AUTH);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many login attempts. Please try again in ${rateLimit.resetInSeconds} seconds.`,
        },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const username = sanitizeString(body.username, 100);
    const password = typeof body.password === 'string' ? body.password : '';

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Please enter both username and password' },
        { status: 400 }
      );
    }

    const admin = relationalDb.verifyAdmin(username.trim(), password.trim());
    if (!admin) {
      relationalDb.logAudit(
        'SYSTEM',
        'Security Guard',
        'ADMIN_LOGIN_FAILED',
        'Auth',
        username,
        `Failed admin login attempt for '${username}'`
      );
      return NextResponse.json(
        { success: false, error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Generate cryptographically signed HMAC token
    const token = signAdminSession({
      id: admin.id,
      username: admin.username,
      name: admin.name,
      role: admin.role,
      permissions: admin.permissions,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Admin authenticated successfully',
      data: {
        id: admin.id,
        username: admin.username,
        name: admin.name,
        role: admin.role,
        permissions: admin.permissions,
        token,
      },
    });

    // Set secure HTTP-only cookie
    setAdminCookie(response, token);

    relationalDb.logAudit(
      admin.id,
      admin.name,
      'ADMIN_LOGIN_SUCCESS',
      'Auth',
      admin.id,
      `Admin logged in successfully (${admin.role})`
    );

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Authentication service encountered an error' },
      { status: 500 }
    );
  }
}
