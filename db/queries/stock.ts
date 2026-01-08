import { db } from '@/db';
import { products, stockLevels, purchases, sales } from '@/db/schema';
import { eq, and, gte, lte, sql, desc } from 'drizzle-orm';

// Get product with current stock and status
export async function getProductWithStock(productId: string) {
  const result = await db
    .select({
      product: products,
      stock: stockLevels,
    })
    .from(products)
    .leftJoin(stockLevels, eq(products. id, stockLevels.productId))
    .where(eq(products.productId, productId))
    .limit(1);

  if (!result[0]) return null;

  const { product, stock } = result[0];
  const currentStock = stock?. currentStock ??  0;

  return {
    ... product,
    currentStock,
    stockStatus: getStockStatus(currentStock, product.reorderLevel),
  };
}

// Stock status helper
export function getStockStatus(
  currentStock: number,
  reorderLevel: number
): 'out_of_stock' | 'low_stock' | 'in_stock' {
  if (currentStock === 0) return 'out_of_stock';
  if (currentStock <= reorderLevel) return 'low_stock';
  return 'in_stock';
}

// Get all products with stock status
export async function getProductsWithStock() {
  return db
    .select({
      id: products.id,
      productId: products.productId,
      name: products.name,
      categoryId: products.categoryId,
      costPrice: products. costPrice,
      sellingPrice: products.sellingPrice,
      reorderLevel: products.reorderLevel,
      currentStock: sql<number>`COALESCE(${stockLevels.currentStock}, 0)`,
      stockStatus: sql<string>`
        CASE 
          WHEN COALESCE(${stockLevels.currentStock}, 0) = 0 THEN 'out_of_stock'
          WHEN COALESCE(${stockLevels.currentStock}, 0) <= ${products.reorderLevel} THEN 'low_stock'
          ELSE 'in_stock'
        END
      `,
    })
    .from(products)
    .leftJoin(stockLevels, eq(products. id, stockLevels.productId))
    .where(eq(products.isActive, true))
    .orderBy(products.name);
}

// Product ledger/statement
export async function getProductLedger(
  productId: string,
  startDate?:  Date,
  endDate?: Date
) {
  const purchaseEntries = await db
    .select({
      id: purchases.id,
      type: sql<'purchase'>`'purchase'`,
      date: purchases.purchaseDate,
      quantity: purchases.quantity,
      unitPrice: purchases.unitCost,
      totalAmount: purchases.totalCost,
      notes: purchases.notes,
    })
    .from(purchases)
    .innerJoin(products, eq(purchases.productId, products.id))
    .where(
      and(
        eq(products.productId, productId),
        startDate ? gte(purchases.purchaseDate, startDate) : undefined,
        endDate ? lte(purchases. purchaseDate, endDate) : undefined
      )
    );

  const saleEntries = await db
    .select({
      id: sales.id,
      type: sql<'sale'>`'sale'`,
      date: sales.saleDate,
      quantity: sql<number>`-${sales.quantity}`, // Negative for sales
      unitPrice: sales.unitPrice,
      totalAmount: sales.totalAmount,
      notes: sales.notes,
    })
    .from(sales)
    .innerJoin(products, eq(sales.productId, products.id))
    .where(
      and(
        eq(products.productId, productId),
        startDate ? gte(sales.saleDate, startDate) : undefined,
        endDate ? lte(sales.saleDate, endDate) : undefined
      )
    );

  // Combine and sort by date
  const ledger = [...purchaseEntries, ...saleEntries]. sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Calculate running balance
  let balance = 0;
  return ledger.map((entry) => {
    balance += entry.quantity;
    return { ...entry, balance };
  });
}

// Low stock alerts
export async function getLowStockProducts() {
  return db
    .select({
      product: products,
      currentStock: stockLevels.currentStock,
    })
    .from(products)
    .innerJoin(stockLevels, eq(products.id, stockLevels.productId))
    .where(
      and(
        eq(products.isActive, true),
        sql`${stockLevels.currentStock} <= ${products.reorderLevel}`
      )
    )
    .orderBy(stockLevels.currentStock);
}