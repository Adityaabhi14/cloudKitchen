import { NextRequest, NextResponse } from 'next/server';
import { relationalDb } from '@/../database/db';
import { formatKitchenSettings, normalizeSettingsUpdate } from '@/lib/formatters';

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
    const body = await req.json();
    const { settings: rawSettings, newUnit } = body;

    let updatedSettings = null;
    if (rawSettings) {
      const normalized = normalizeSettingsUpdate(rawSettings);
      const updatedRecord = relationalDb.updateSettings(normalized);
      updatedSettings = formatKitchenSettings(updatedRecord);
    }
    if (newUnit) {
      relationalDb.addUnit(newUnit);
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
