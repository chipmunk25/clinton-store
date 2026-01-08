import { db } from '@/db';
import { sales, stockLevels, products } from '@/db/schema';
import { eq } from 'drizzle-orm';

export interface CreateSaleInput {
  productId: string; // User-facing product ID (SKU)
  quantity: number;
  unitPrice: number;
  recordedBy: string;
  notes?: string;
}

export async function createSale(input: CreateSaleInput) {
  return db.transaction(async (tx) => {
    // 1. Get product by user-facing ID
    const product = await tx
      .select()
      .from(products)
      .where(eq(products.productId, input.productId))
      .limit(1);

    if (!product[0]) {
      throw new Error(`Product not found: ${input.productId}`);
    }

    // 2. Check stock (trigger will also check, but fail fast here)
    const stock = await tx
      .select()
      .from(stockLevels)
      .where(eq(stockLevels.productId, product[0].id))
      .limit(1);

    const currentStock = stock[0]?. currentStock ?? 0;
    if (currentStock < input.quantity) {
      throw new Error(
        `Insufficient stock for ${product[0].name}. Available: ${currentStock}, Requested: ${input.quantity}`
      );
    }

    // 3. Create sale record (trigger updates stock_levels)
    const [sale] = await tx
      . insert(sales)
      .values({
        productId: product[0].id,
        quantity: input.quantity,
        unitPrice: input.unitPrice. toFixed(2),
        totalAmount: (input.quantity * input.unitPrice).toFixed(2),
        recordedBy: input.recordedBy,
        notes: input. notes,
      })
      .returning();

    return {
      sale,
      product: product[0],
      previousStock: currentStock,
      newStock: currentStock - input.quantity,
    };
  });
}