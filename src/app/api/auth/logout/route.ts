import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const response = NextResponse.json({
    success: true,
    message: 'Logged out successfully',
  });

  response.cookies.set('vindu_admin_session', '', {
    httpOnly: false,
    path: '/',
    expires: new Date(0),
  });

  return response;
}
