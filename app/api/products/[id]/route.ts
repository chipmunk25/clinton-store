import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { products } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth/session';
import { z } from 'zod';

const updateProductSchema = z.object({
  name: z.string().min(1).max(255),
  categoryId: z.string().uuid().optional().nullable(),
  costPrice: z.number().min(0),
  sellingPrice: z. number().min(0),
  reorderLevel: z.number().int().min(0),
  expiryDate: z.string().optional().nullable(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status:  401 });
    }

    // Only admins can update products
    if (user.role !== 'admin') {
      return NextResponse. json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check product exists
    const [existing] = await db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const result = updateProductSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const data = result.data;

    const [updatedProduct] = await db
      .update(products)
      .set({
        name: data. name,
        categoryId: data.categoryId || null,
        costPrice: data. costPrice. toFixed(2),
        sellingPrice: data.sellingPrice.toFixed(2),
        reorderLevel: data.reorderLevel,
        expiryDate: data.expiryDate || null,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id))
      .returning();

    return NextResponse.json({
      message: 'Product updated successfully',
      product: updatedProduct,
    });
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const [product] = await db
      . select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Get product error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status:  500 }
    );
  }
}