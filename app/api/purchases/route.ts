import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { purchases, products, stockLevels, shelves } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth/session';
import { z } from 'zod';

const createPurchaseSchema = z.object({
  productId: z. string().uuid('Invalid product ID'),
  shelfId: z.string().uuid('Invalid shelf ID'),
  quantity: z.number().int().positive('Quantity must be positive'),
  unitCost: z. number().positive('Cost must be positive'),
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
    const result = createPurchaseSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { productId, shelfId, quantity, unitCost, notes } = result.data;

    // Check product exists
    const [product] = await db
      . select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check shelf exists
    const [shelf] = await db
      .select()
      .from(shelves)
      .where(eq(shelves.id, shelfId))
      .limit(1);

    if (!shelf) {
      return NextResponse.json(
        { error: 'Shelf location not found' },
        { status: 404 }
      );
    }

    // Get current stock
    const [currentStock] = await db
      . select()
      .from(stockLevels)
      .where(eq(stockLevels.productId, productId))
      .limit(1);

    const totalCost = quantity * unitCost;

    // Create purchase and update stock in transaction
    const [newPurchase] = await db. transaction(async (tx) => {
      // Create purchase record
      const [purchase] = await tx
        .insert(purchases)
        .values({
          productId,
          shelfId,
          quantity,
          unitCost:  unitCost. toFixed(2),
          totalCost: totalCost.toFixed(2),
          recordedBy: user.id,
          notes:  notes || null,
        })
        .returning();

      // Update or insert stock levels
      if (currentStock) {
        await tx
          . update(stockLevels)
          .set({
            totalPurchased: currentStock.totalPurchased + quantity,
            currentStock: currentStock.currentStock + quantity,
            lastPurchaseDate: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(stockLevels.productId, productId));
      } else {
        await tx
          .insert(stockLevels)
          .values({
            productId,
            totalPurchased: quantity,
            totalSold: 0,
            currentStock: quantity,
            lastPurchaseDate: new Date(),
          });
      }

      return [purchase];
    });

    const newStockLevel = (currentStock?. currentStock ??  0) + quantity;

    return NextResponse.json({
      message: 'Purchase recorded successfully',
      purchase: newPurchase,
      newStockLevel,
    });
  } catch (error) {
    console.error('Create purchase error:', error);
    return NextResponse.json(
      { error: 'Failed to record purchase' },
      { status: 500 }
    );
  }
}