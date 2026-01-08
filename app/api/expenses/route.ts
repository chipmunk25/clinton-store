import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { expenses } from '@/db/schema';
import { getCurrentUser } from '@/lib/auth/session';
import { z } from 'zod';

const createExpenseSchema = z.object({
  category: z.enum([
    'rent',
    'utilities',
    'salaries',
    'supplies',
    'transport',
    'marketing',
    'maintenance',
    'other',
  ]),
  description: z.string().min(1).max(500),
  amount: z.number().positive(),
  expenseDate: z.string(),
  receiptReference: z. string().max(100).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins can record expenses
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const result = createExpenseSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const data = result.data;

    const [newExpense] = await db
      .insert(expenses)
      .values({
        category: data.category,
        description: data.description,
        amount: data.amount. toFixed(2),
        expenseDate: data.expenseDate,
        receiptReference: data.receiptReference || null,
        recordedBy: user.id,
      })
      .returning();

    return NextResponse.json({
      message: 'Expense recorded successfully',
      expense: newExpense,
    });
  } catch (error) {
    console.error('Create expense error:', error);
    return NextResponse.json(
      { error: 'Failed to record expense' },
      { status: 500 }
    );
  }
}