import { NextRequest, NextResponse } from 'next/server';
import { relationalDb } from '@/../database/db';
import { formatFoodItem } from '@/lib/formatters';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rawItems = relationalDb.getFoodItems();
    const categories = relationalDb.getCategories();
    const catMap = new Map(categories.map(c => [c.id, c.name]));
    const items = rawItems.map(item => formatFoodItem(item, catMap.get(item.category_id)));
    return NextResponse.json({ success: true, data: items });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch items' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      teluguName,
      description,
      price,
      unit,
      category,
      isVeg,
      spiceLevel,
      imageUrl,
      availableQuantity,
      maxOrderQty,
      isFeatured,
    } = body;

    if (!name || price === undefined || !unit) {
      return NextResponse.json(
        { success: false, error: 'Name, price, and unit are required' },
        { status: 400 }
      );
    }

    // Find category ID or default to curries
    const categories = relationalDb.getCategories();
    const matchedCat = categories.find(c => c.name.toLowerCase() === (category || '').toLowerCase()) || categories[1];

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const newItem = relationalDb.createFoodItem({
      name,
      telugu_name: teluguName || '',
      slug: `${slug}-${Date.now().toString(36)}`,
      description: description || '',
      base_price: Number(price),
      default_unit: unit,
      category_id: matchedCat ? matchedCat.id : 'cat-curries',
      is_veg: isVeg ? 1 : 0,
      spice_level: Number(spiceLevel) || 3,
      image_url: imageUrl || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1000&q=80',
      default_stock: Number(availableQuantity) || 20,
      max_order_qty: Number(maxOrderQty) || 5,
      is_featured: isFeatured ? 1 : 0,
      is_active: 1,
    });

    return NextResponse.json({ success: true, data: newItem }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create item' },
      { status: 500 }
    );
  }
}
