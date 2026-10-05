import { NextRequest, NextResponse } from 'next/server';
import { relationalDb } from '@/../database/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const item = relationalDb.getFoodItemById(params.id);
    if (!item) {
      return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: item });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch item' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { name, teluguName, description, price, unit, category, isVeg, spiceLevel, imageUrl, availableQuantity, maxOrderQty, isFeatured } = body;

    let category_id: string | undefined = undefined;
    if (category) {
      const categories = relationalDb.getCategories();
      const matched = categories.find(c => c.name.toLowerCase() === category.toLowerCase() || c.id === category);
      if (matched) category_id = matched.id;
    }

    const updated = relationalDb.updateFoodItem(params.id, {
      name: name !== undefined ? name : undefined,
      telugu_name: teluguName !== undefined ? teluguName : undefined,
      description: description !== undefined ? description : undefined,
      base_price: price !== undefined ? Number(price) : undefined,
      default_unit: unit !== undefined ? unit : undefined,
      category_id: category_id,
      is_veg: isVeg !== undefined ? (isVeg ? 1 : 0) : undefined,
      spice_level: spiceLevel !== undefined ? Number(spiceLevel) : undefined,
      image_url: imageUrl !== undefined ? imageUrl : undefined,
      default_stock: availableQuantity !== undefined ? Number(availableQuantity) : undefined,
      max_order_qty: maxOrderQty !== undefined ? Number(maxOrderQty) : undefined,
      is_featured: isFeatured !== undefined ? (isFeatured ? 1 : 0) : undefined,
    });

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update item' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const deleted = relationalDb.deleteFoodItem(params.id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Item deleted successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete item' },
      { status: 500 }
    );
  }
}
