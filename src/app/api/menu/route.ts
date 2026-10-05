import { NextRequest, NextResponse } from 'next/server';
import { relationalDb } from '@/../database/db';
import { formatMenuItem } from '@/lib/formatters';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get('date') || relationalDb.getTomorrowDate();

    const { menu, items } = relationalDb.getMenuByDate(dateParam);
    const formattedItems = items.map(formatMenuItem);

    return NextResponse.json({
      success: true,
      data: {
        ...menu,
        date: menu.menu_date,
        isPublished: menu.is_published === 1,
        isAcceptingOrders: menu.is_accepting_orders === 1,
        cutoffTime: menu.cutoff_time,
        items: formattedItems,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch menu' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { date, title, note, isPublished, isAcceptingOrders, cutoffTime, items } = body;

    if (!date) {
      return NextResponse.json({ success: false, error: 'Date is required' }, { status: 400 });
    }

    const updatedMenu = relationalDb.updateMenu(date, {
      title,
      note,
      is_published: isPublished !== undefined ? (isPublished ? 1 : 0) : undefined,
      is_accepting_orders: isAcceptingOrders !== undefined ? (isAcceptingOrders ? 1 : 0) : undefined,
      cutoff_time: cutoffTime,
    });

    if (items && Array.isArray(items)) {
      const { menu } = relationalDb.getMenuByDate(date);
      for (const it of items) {
        if (it.foodItemId && it.remainingStock !== undefined) {
          relationalDb.updateMenuItemStock(menu.id, it.foodItemId, it.remainingStock, it.status);
        }
      }
    }

    const refreshed = relationalDb.getMenuByDate(date);
    return NextResponse.json({ success: true, data: { ...refreshed.menu, items: refreshed.items } });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update menu' },
      { status: 500 }
    );
  }
}
