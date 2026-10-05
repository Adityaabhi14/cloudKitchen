import { NextRequest, NextResponse } from 'next/server';
import { relationalDb } from '@/../database/db';
import { createSignedToken, verifySignedToken } from './security';

export interface AdminSessionData {
  id: string;
  username: string;
  name: string;
  role: string;
  permissions: string[];
}

export interface CustomerSessionData {
  id: string;
  googleId: string;
  email: string;
  name: string;
  phone?: string;
  profileImage?: string;
}

const ADMIN_COOKIE_NAME = 'vindu_admin_session';
const CUSTOMER_COOKIE_NAME = 'vindu_customer_session';

/**
 * Sign an admin session into a secure token (7 days)
 */
export function signAdminSession(admin: { id: string; username: string; name: string; role: string; permissions?: string[] }): string {
  const payload: AdminSessionData = {
    id: admin.id,
    username: admin.username,
    name: admin.name,
    role: admin.role,
    permissions: admin.permissions || [],
  };
  return createSignedToken(payload, 60 * 60 * 24 * 7); // 7 days
}

/**
 * Extract and verify admin session from Request headers or cookies
 */
export function verifyAdminSession(req: NextRequest): AdminSessionData | null {
  const authHeader = req.headers.get('authorization');
  const cookieToken = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const rawToken = (authHeader ? authHeader.replace(/^Bearer\s+/i, '') : '') || cookieToken;

  if (!rawToken) return null;

  // Verify cryptographic signature and expiry
  const verified = verifySignedToken<AdminSessionData>(rawToken);
  if (!verified || !verified.id) {
    // Fallback check for demo/seed legacy tokens during transition
    if (rawToken.startsWith('jwt_') || rawToken.startsWith('admin_session_')) {
      const parts = rawToken.split('_');
      const adminId = parts[1];
      const admin = relationalDb.getAdmins().find(a => a.id === adminId && a.status === 'ACTIVE');
      if (admin) {
        return {
          id: admin.id,
          username: admin.username,
          name: admin.name,
          role: admin.role,
          permissions: admin.custom_permissions || [],
        };
      }
    }
    return null;
  }

  // Cross-reference with database to ensure the admin is still ACTIVE
  const admins = relationalDb.getAdmins();
  const dbAdmin = admins.find(a => a.id === verified.id);
  if (!dbAdmin || dbAdmin.status !== 'ACTIVE') {
    return null;
  }

  return verified;
}

/**
 * Guard middleware for Admin API routes
 * Returns AdminSessionData if valid, or a NextResponse 401/403 response if unauthorized
 */
export function requireAdminAuth(
  req: NextRequest,
  requiredPermission?: string
): { session: AdminSessionData } | { errorResponse: NextResponse } {
  const session = verifyAdminSession(req);
  if (!session) {
    return {
      errorResponse: NextResponse.json(
        { success: false, error: 'Unauthorized: Valid admin authentication required' },
        { status: 401 }
      ),
    };
  }

  if (requiredPermission) {
    // Super admins have all permissions
    if (session.role !== 'SUPER_ADMIN' && !session.permissions?.includes(requiredPermission)) {
      return {
        errorResponse: NextResponse.json(
          { success: false, error: `Forbidden: Insufficient permissions (${requiredPermission} required)` },
          { status: 403 }
        ),
      };
    }
  }

  return { session };
}

/**
 * Sign a customer session into a secure token (30 days)
 */
export function signCustomerSession(customer: {
  id: string;
  google_id?: string;
  googleId?: string;
  email?: string;
  name: string;
  phone?: string;
  profile_image?: string;
  profileImage?: string;
}): string {
  const payload: CustomerSessionData = {
    id: customer.id,
    googleId: customer.google_id || customer.googleId || '',
    email: customer.email || '',
    name: customer.name,
    phone: customer.phone,
    profileImage: customer.profile_image || customer.profileImage,
  };
  return createSignedToken(payload, 60 * 60 * 24 * 30); // 30 days
}

/**
 * Extract and verify customer session from Request headers or cookies
 */
export function verifyCustomerSession(req: NextRequest): CustomerSessionData | null {
  const authHeader = req.headers.get('authorization');
  const cookieToken = req.cookies.get(CUSTOMER_COOKIE_NAME)?.value;
  const rawToken = (authHeader ? authHeader.replace(/^Bearer\s+/i, '') : '') || cookieToken;

  if (!rawToken) return null;

  // 1. Verify signed token
  const verified = verifySignedToken<CustomerSessionData>(rawToken);
  if (verified && verified.id) {
    // Verify customer exists and is not blocked
    const customer = relationalDb.getCustomerById(verified.id);
    if (!customer || customer.status === 'BLOCKED') {
      return null;
    }
    return verified;
  }

  // 2. Fallback check for legacy base64 tokens during transition
  try {
    const decoded = JSON.parse(Buffer.from(rawToken, 'base64').toString('utf-8'));
    if (decoded && decoded.id && decoded.email) {
      const customer = relationalDb.getCustomerById(decoded.id);
      if (customer && customer.status !== 'BLOCKED') {
        return {
          id: customer.id,
          googleId: customer.google_id || '',
          email: customer.email || '',
          name: customer.name,
          phone: customer.phone,
          profileImage: customer.profile_image,
        };
      }
    }
  } catch {
    // Ignore invalid legacy base64
  }

  return null;
}

/**
 * Guard middleware for Customer API routes
 */
export function requireCustomerAuth(
  req: NextRequest
): { session: CustomerSessionData } | { errorResponse: NextResponse } {
  const session = verifyCustomerSession(req);
  if (!session) {
    return {
      errorResponse: NextResponse.json(
        { success: false, error: 'Unauthorized: Please log in with your customer account' },
        { status: 401 }
      ),
    };
  }
  return { session };
}

/**
 * Helper to set secure Admin cookie on response
 */
export function setAdminCookie(response: NextResponse, token: string): void {
  response.cookies.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

/**
 * Helper to set secure Customer cookie on response
 */
export function setCustomerCookie(response: NextResponse, token: string): void {
  response.cookies.set(CUSTOMER_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

/**
 * Clear session cookies on logout
 */
export function clearAdminCookie(response: NextResponse): void {
  response.cookies.set(ADMIN_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

export function clearCustomerCookie(response: NextResponse): void {
  response.cookies.set(CUSTOMER_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}
