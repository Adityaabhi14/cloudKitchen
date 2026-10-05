import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const response = NextResponse.json({
    success: true,
    message: 'Successfully logged out',
  });

  response.cookies.delete('vindu_customer_session');
  return response;
}
