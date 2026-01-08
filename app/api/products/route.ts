import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { products } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth/session';
import { z } from 'zod';

const createProductSchema = z.object({
  productId: z.string().min(1).max(50),
  name: z.string().min(1).max(255),
  categoryId: z.string().uuid().optional().nullable(),
  costPrice: z.number().min(0),
  sellingPrice: z.number().min(0),
  reorderLevel: z.number().int().min(0),
  expiryDate: z.string().optional().nullable(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins can create products
    if (user.role !== 'admin') {
      return NextResponse. json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const result = createProductSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const data = result.data;

    // Check if productId already exists
    const [existing] = await db
      .select()
      .from(products)
      .where(eq(products.productId, data.productId))
      .limit(1);

    if (existing) {
      return NextResponse.json(
        { error: 'Product ID already exists' },
        { status:  400 }
      );
    }

    const [newProduct] = await db
      . insert(products)
      .values({
        productId: data. productId,
        name: data.name,
        categoryId: data.categoryId || null,
        costPrice: data. costPrice. toFixed(2),
        sellingPrice: data.sellingPrice.toFixed(2),
        reorderLevel: data.reorderLevel,
        expiryDate: data.expiryDate || null,
      })
      .returning();

    return NextResponse.json({
      message: 'Product created successfully',
      product: newProduct,
    });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}