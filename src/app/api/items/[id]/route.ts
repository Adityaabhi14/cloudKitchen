import { NextRequest, NextResponse } from 'next/server';
import { relationalDb } from '@/../database/db';
import { requireAdminAuth } from '@/lib/auth';
import { sanitizeString } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cleanId = sanitizeString(params.id, 50);
    const item = relationalDb.getFoodItemById(cleanId);
    if (!item) {
      return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: item });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch item' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = requireAdminAuth(req, 'MANAGE_MENU');
    if ('errorResponse' in auth) return auth.errorResponse;

    const cleanId = sanitizeString(params.id, 50);
    const body = await req.json().catch(() => ({}));
    const { name, teluguName, description, price, unit, category, isVeg, spiceLevel, imageUrl, availableQuantity, maxOrderQty, isFeatured } = body;

    let category_id: string | undefined = undefined;
    if (category) {
      const cleanCategory = sanitizeString(category, 50);
      const categories = relationalDb.getCategories();
      const matched = categories.find(c => c.name.toLowerCase() === cleanCategory.toLowerCase() || c.id === cleanCategory);
      if (matched) category_id = matched.id;
    }

    const updates: any = {};
    if (name !== undefined) updates.name = sanitizeString(name, 120);
    if (teluguName !== undefined) updates.telugu_name = sanitizeString(teluguName, 120);
    if (description !== undefined) updates.description = sanitizeString(description, 500);
    if (price !== undefined) updates.base_price = Math.max(0, Number(price));
    if (unit !== undefined) updates.default_unit = sanitizeString(unit, 30);
    if (category_id !== undefined) updates.category_id = category_id;
    if (isVeg !== undefined) updates.is_veg = isVeg ? 1 : 0;
    if (spiceLevel !== undefined) updates.spice_level = Math.min(5, Math.max(1, Number(spiceLevel) || 3));
    if (imageUrl !== undefined) updates.image_url = imageUrl;
    if (availableQuantity !== undefined) updates.default_stock = Math.max(0, Number(availableQuantity));
    if (maxOrderQty !== undefined) updates.max_order_qty = Math.max(1, Number(maxOrderQty));
    if (isFeatured !== undefined) updates.is_featured = isFeatured ? 1 : 0;

    const updated = relationalDb.updateFoodItem(cleanId, updates);

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
    }

    relationalDb.logAudit(
      auth.session.id,
      auth.session.name,
      'FOOD_ITEM_UPDATED',
      'FoodItem',
      cleanId,
      `Updated item '${updated.name}'`
    );

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to update item' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = requireAdminAuth(req, 'MANAGE_MENU');
    if ('errorResponse' in auth) return auth.errorResponse;

    const cleanId = sanitizeString(params.id, 50);
    const deleted = relationalDb.deleteFoodItem(cleanId);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
    }

    relationalDb.logAudit(
      auth.session.id,
      auth.session.name,
      'FOOD_ITEM_DELETED',
      'FoodItem',
      cleanId,
      `Deleted item ID '${cleanId}'`
    );

    return NextResponse.json({ success: true, message: 'Item deleted successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete item' },
      { status: 500 }
    );
  }
}
