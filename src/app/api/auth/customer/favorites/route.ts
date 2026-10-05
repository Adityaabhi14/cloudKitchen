import { NextRequest, NextResponse } from 'next/server';
import { relationalDb } from '@/../database/db';

export const dynamic = 'force-dynamic';

function getCustomerIdFromReq(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization');
  const cookieToken = req.cookies.get('vindu_customer_session')?.value;
  const token = (authHeader ? authHeader.replace('Bearer ', '') : '') || cookieToken;
  if (!token) return null;
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
    return decoded.id || null;
  } catch {
    return token;
  }
}

export async function POST(req: NextRequest) {
  try {
    const customerId = getCustomerIdFromReq(req);
    if (!customerId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { foodItemId } = body;

    if (!foodItemId) {
      return NextResponse.json({ success: false, error: 'Food item ID is required' }, { status: 400 });
    }

    const updatedFavorites = relationalDb.toggleCustomerFavorite(customerId, foodItemId);

    return NextResponse.json({
      success: true,
      data: {
        favorites: updatedFavorites,
        isFavorite: updatedFavorites.includes(foodItemId),
      },
    });
  } catch (error: any) {
    console.error('Error toggling favorite:', error);
    return NextResponse.json({ success: false, error: 'Failed to update favorites' }, { status: 500 });
  }
}
