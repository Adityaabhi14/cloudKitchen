import { NextRequest, NextResponse } from 'next/server';
import { relationalDb } from '@/../database/db';
import { formatFoodItem } from '@/lib/formatters';
import { requireAdminAuth } from '@/lib/auth';
import { sanitizeString } from '@/lib/security';

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
      { success: false, error: 'Failed to fetch items' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = requireAdminAuth(req, 'MANAGE_MENU');
    if ('errorResponse' in auth) return auth.errorResponse;

    const body = await req.json().catch(() => ({}));
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

    const cleanName = sanitizeString(name, 120);
    const cleanUnit = sanitizeString(unit, 30);
    const numPrice = Number(price);

    if (!cleanName || isNaN(numPrice) || numPrice < 0 || !cleanUnit) {
      return NextResponse.json(
        { success: false, error: 'Valid name, price, and unit are required' },
        { status: 400 }
      );
    }

    // Find category ID or default to curries
    const categories = relationalDb.getCategories();
    const cleanCategory = sanitizeString(category, 50);
    const matchedCat = categories.find(c => c.name.toLowerCase() === cleanCategory.toLowerCase()) || categories[1];

    const slug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const newItem = relationalDb.createFoodItem({
      name: cleanName,
      telugu_name: sanitizeString(teluguName, 120),
      slug: `${slug}-${Date.now().toString(36)}`,
      description: sanitizeString(description, 500),
      base_price: Math.max(0, numPrice),
      default_unit: cleanUnit,
      category_id: matchedCat ? matchedCat.id : 'cat-curries',
      is_veg: isVeg ? 1 : 0,
      spice_level: Math.min(5, Math.max(1, Number(spiceLevel) || 3)),
      image_url: imageUrl || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1000&q=80',
      default_stock: Math.max(1, Number(availableQuantity) || 20),
      max_order_qty: Math.max(1, Number(maxOrderQty) || 5),
      is_featured: isFeatured ? 1 : 0,
      is_active: 1,
    });

    relationalDb.logAudit(
      auth.session.id,
      auth.session.name,
      'FOOD_ITEM_CREATED',
      'FoodItem',
      newItem.id,
      `Created item '${newItem.name}' (₹${newItem.base_price})`
    );

    return NextResponse.json({ success: true, data: newItem }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to create item' },
      { status: 500 }
    );
  }
}
