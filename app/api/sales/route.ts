import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sales, products, stockLevels } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth/session';
import { z } from 'zod';

const createSaleSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  quantity: z.number().int().positive('Quantity must be positive'),
  unitPrice: z.number().positive('Price must be positive'),
  notes: z.string().optional(),
});

export async function POST(request:  NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status:  401 }
      );
    }

    const body = await request.json();
    const result = createSaleSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { productId, quantity, unitPrice, notes } = result.data;

    // Check product exists
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check stock availability
    const [stock] = await db
      .select()
      .from(stockLevels)
      .where(eq(stockLevels.productId, productId))
      .limit(1);

    const currentStock = stock?.currentStock ??  0;

    if (currentStock < quantity) {
      return NextResponse.json(
        { error: `Insufficient stock. Available: ${currentStock}` },
        { status: 400 }
      );
    }

    // Create sale and update stock in transaction
    const totalAmount = quantity * unitPrice;

    const [newSale] = await db. transaction(async (tx) => {
      // Create sale record
      const [sale] = await tx
        .insert(sales)
        .values({
          productId,
          quantity,
          unitPrice:  unitPrice.toFixed(2),
          totalAmount: totalAmount.toFixed(2),
          recordedBy: user.id,
          notes: notes || null,
        })
        .returning();

      // Update stock levels
      await tx
        .update(stockLevels)
        .set({
          totalSold: stock ?  stock.totalSold + quantity :  quantity,
          currentStock: currentStock - quantity,
          lastSaleDate: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(stockLevels.productId, productId));

      return [sale];
    });

    return NextResponse.json({
      message: 'Sale recorded successfully',
      sale: newSale,
      newStockLevel: currentStock - quantity,
    });
  } catch (error) {
    console.error('Create sale error:', error);
    return NextResponse.json(
      { error: 'Failed to record sale' },
      { status: 500 }
    );
  }
}