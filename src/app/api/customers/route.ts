import { NextRequest, NextResponse } from 'next/server';
import { relationalDb } from '@/../database/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const customers = relationalDb.getCustomers();
    return NextResponse.json({
      success: true,
      data: customers,
    });
  } catch (error: any) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customer directory' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, notes, status } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    if (notes !== undefined) {
      relationalDb.updateCustomerNotes(id, notes);
    }

    if (status) {
      relationalDb.toggleCustomerStatus(id, status);
    }

    return NextResponse.json({
      success: true,
      message: 'Customer updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating customer:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update customer' },
      { status: 500 }
    );
  }
}
