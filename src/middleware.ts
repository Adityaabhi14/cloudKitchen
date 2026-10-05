import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images, icons, uploads (public assets)
     */
    '/((?!_next/static|_next/image|favicon.ico|images/|icons/|uploads/).*)',
  ],
};

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const adminCookie = req.cookies.get('vindu_admin_session')?.value;
  const authHeader = req.headers.get('authorization');
  const token = (authHeader ? authHeader.replace(/^Bearer\s+/i, '') : '') || adminCookie;

  // 1. Admin Page Route Protection (e.g. /admin, /admin/orders, /admin/analytics, etc.)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!token) {
      const loginUrl = new URL('/admin/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Admin API Route Protection
  if (pathname.startsWith('/api/admin')) {
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin authentication token required' },
        { status: 401 }
      );
    }
  }

  // 3. CSRF Protection for state-changing API requests
  if (
    ['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method) &&
    pathname.startsWith('/api/') &&
    !pathname.startsWith('/api/payment/verify') // Razorpay webhook / callbacks
  ) {
    const origin = req.headers.get('origin');
    const host = req.headers.get('host');
    if (origin && host) {
      try {
        const originUrl = new URL(origin);
        if (originUrl.host !== host) {
          return NextResponse.json(
            { success: false, error: 'Forbidden: Cross-site request rejected (CSRF protection)' },
            { status: 403 }
          );
        }
      } catch {
        return NextResponse.json(
          { success: false, error: 'Forbidden: Invalid request origin' },
          { status: 403 }
        );
      }
    }
  }

  // 4. Continue with request and apply Security Headers
  const response = NextResponse.next();

  // Security Headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), browsing-topics=()');
  
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=63072000; includeSubDomains; preload'
    );
  }

  return response;
}
