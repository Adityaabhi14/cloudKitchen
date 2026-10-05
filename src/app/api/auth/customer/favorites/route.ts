import { NextRequest, NextResponse } from 'next/server';
import { relationalDb } from '@/../database/db';
import { requireCustomerAuth } from '@/lib/auth';
import { sanitizeString } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const auth = requireCustomerAuth(req);
    if ('errorResponse' in auth) return auth.errorResponse;

    const body = await req.json().catch(() => ({}));
    const foodItemId = sanitizeString(body.foodItemId, 50);

    if (!foodItemId) {
      return NextResponse.json({ success: false, error: 'Food item ID is required' }, { status: 400 });
    }

    const updatedFavorites = relationalDb.toggleCustomerFavorite(auth.session.id, foodItemId);

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
