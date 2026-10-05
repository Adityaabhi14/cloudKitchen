import { NextRequest, NextResponse } from 'next/server';
import { relationalDb } from '@/../database/db';
import { formatKitchenSettings, normalizeSettingsUpdate } from '@/lib/formatters';
import { requireAdminAuth } from '@/lib/auth';
import { sanitizeString } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rawSettings = relationalDb.getSettings();
    const settings = formatKitchenSettings(rawSettings);
    const categories = relationalDb.getCategories();
    const units = relationalDb.getUnits();
    return NextResponse.json({
      success: true,
      data: {
        settings,
        categories: categories.map(c => c.name),
        units,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = requireAdminAuth(req, 'MANAGE_SETTINGS');
    if ('errorResponse' in auth) return auth.errorResponse;

    const body = await req.json().catch(() => ({}));
    const { settings: rawSettings, newUnit } = body;

    let updatedSettings = null;
    if (rawSettings && typeof rawSettings === 'object') {
      const normalized = normalizeSettingsUpdate(rawSettings);
      const updatedRecord = relationalDb.updateSettings(normalized);
      updatedSettings = formatKitchenSettings(updatedRecord);

      relationalDb.logAudit(
        auth.session.id,
        auth.session.name,
        'SETTINGS_UPDATED',
        'Settings',
        'kitchen_settings',
        'Updated kitchen operational settings'
      );
    }
    if (newUnit && typeof newUnit === 'string') {
      relationalDb.addUnit(sanitizeString(newUnit, 30));
    }

    const currentRecord = relationalDb.getSettings();
    const finalSettings = updatedSettings || formatKitchenSettings(currentRecord);

    return NextResponse.json({
      success: true,
      data: {
        settings: finalSettings,
        categories: relationalDb.getCategories().map(c => c.name),
        units: relationalDb.getUnits(),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update settings' },
      { status: 500 }
    );
  }
}
