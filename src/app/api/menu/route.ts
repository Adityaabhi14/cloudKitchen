import { NextRequest, NextResponse } from 'next/server';
import { relationalDb } from '@/../database/db';
import { formatMenuItem } from '@/lib/formatters';
import { requireAdminAuth } from '@/lib/auth';
import { validateDateString, sanitizeString } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get('date');
    const validDate = (dateParam && validateDateString(dateParam)) ? dateParam : relationalDb.getTomorrowDate();

    const { menu, items } = relationalDb.getMenuByDate(validDate);
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
      { success: false, error: 'Failed to fetch menu' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = requireAdminAuth(req, 'MANAGE_MENU');
    if ('errorResponse' in auth) return auth.errorResponse;

    const body = await req.json().catch(() => ({}));
    const { date, title, note, isPublished, isAcceptingOrders, cutoffTime, items } = body;

    if (!date || !validateDateString(date)) {
      return NextResponse.json({ success: false, error: 'Valid date (YYYY-MM-DD) is required' }, { status: 400 });
    }

    const updatedMenu = relationalDb.updateMenu(date, {
      title: title ? sanitizeString(title, 120) : undefined,
      note: note ? sanitizeString(note, 300) : undefined,
      is_published: isPublished !== undefined ? (isPublished ? 1 : 0) : undefined,
      is_accepting_orders: isAcceptingOrders !== undefined ? (isAcceptingOrders ? 1 : 0) : undefined,
      cutoff_time: cutoffTime ? sanitizeString(cutoffTime, 20) : undefined,
    });

    if (items && Array.isArray(items)) {
      const { menu } = relationalDb.getMenuByDate(date);
      for (const it of items) {
        if (it.foodItemId && it.remainingStock !== undefined) {
          const cleanFoodId = sanitizeString(it.foodItemId, 50);
          const cleanStock = Math.max(0, parseInt(it.remainingStock, 10) || 0);
          const cleanStatus = it.status === 'SOLD_OUT' ? 'SOLD_OUT' : it.status === 'LOW_STOCK' ? 'LOW_STOCK' : 'AVAILABLE';
          relationalDb.updateMenuItemStock(menu.id, cleanFoodId, cleanStock, cleanStatus);
        }
      }
    }

    relationalDb.logAudit(
      auth.session.id,
      auth.session.name,
      'MENU_UPDATED',
      'Menu',
      date,
      `Updated day menu for date ${date}`
    );

    const refreshed = relationalDb.getMenuByDate(date);
    return NextResponse.json({ success: true, data: { ...refreshed.menu, items: refreshed.items } });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to update menu' },
      { status: 500 }
    );
  }
}
