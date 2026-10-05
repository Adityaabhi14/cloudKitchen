import { NextRequest, NextResponse } from 'next/server';
import { relationalDb } from '@/../database/db';
import { requireAdminAuth } from '@/lib/auth';
import { sanitizeString } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = requireAdminAuth(req, 'MANAGE_CUSTOMERS');
    if ('errorResponse' in auth) return auth.errorResponse;

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
    const auth = requireAdminAuth(req, 'MANAGE_CUSTOMERS');
    if ('errorResponse' in auth) return auth.errorResponse;

    const body = await req.json().catch(() => ({}));
    const id = sanitizeString(body.id, 50);
    const notes = body.notes !== undefined ? sanitizeString(body.notes, 500) : undefined;
    const status = body.status === 'BLOCKED' ? 'BLOCKED' : body.status === 'ACTIVE' ? 'ACTIVE' : undefined;

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

    relationalDb.logAudit(
      auth.session.id,
      auth.session.name,
      'CUSTOMER_UPDATED',
      'Customer',
      id,
      `Admin updated customer ID ${id}`
    );

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
