import { db } from '@/db';
import { products, sales, stockLevels } from '@/db/schema';
import { eq, sql, and, gte, lte } from 'drizzle-orm';

export interface DashboardStats {
  totalProducts: number;
  todaySales: number;
  lowStockCount: number;
  outOfStockCount: number;
  lowStockItems: {
    productId: string;
    name: string;
    currentStock: number;
    reorderLevel: number;
  }[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
  // Get today's date range
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Total products count
  const [productCount] = await db
    . select({ count: sql<number>`count(*)` })
    .from(products)
    .where(eq(products.isActive, true));

  // Today's sales total
  const [salesTotal] = await db
    . select({ total: sql<number>`COALESCE(SUM(${sales.totalAmount}), 0)` })
    .from(sales)
    .where(
      and(
        gte(sales.saleDate, today),
        lte(sales.saleDate, tomorrow)
      )
    );

  // Low stock count (stock <= reorderLevel but > 0)
  const [lowStock] = await db
    .select({ count: sql<number>`count(*)` })
    .from(stockLevels)
    .innerJoin(products, eq(stockLevels.productId, products.id))
    .where(
      and(
        eq(products.isActive, true),
        sql`${stockLevels.currentStock} <= ${products.reorderLevel}`,
        sql`${stockLevels.currentStock} > 0`
      )
    );

  // Out of stock count (stock = 0)
  const [outOfStock] = await db
    .select({ count: sql<number>`count(*)` })
    .from(stockLevels)
    .innerJoin(products, eq(stockLevels. productId, products.id))
    .where(
      and(
        eq(products.isActive, true),
        eq(stockLevels.currentStock, 0)
      )
    );

  // Low stock items list
  const lowStockItems = await db
    .select({
      productId: products.productId,
      name: products. name,
      currentStock: stockLevels.currentStock,
      reorderLevel: products.reorderLevel,
    })
    .from(stockLevels)
    .innerJoin(products, eq(stockLevels.productId, products.id))
    .where(
      and(
        eq(products. isActive, true),
        sql`${stockLevels.currentStock} <= ${products.reorderLevel}`
      )
    )
    .orderBy(stockLevels.currentStock)
    .limit(10);

  return {
    totalProducts: Number(productCount?. count ?? 0),
    todaySales: Number(salesTotal?.total ?? 0),
    lowStockCount:  Number(lowStock?.count ?? 0),
    outOfStockCount: Number(outOfStock?. count ?? 0),
    lowStockItems,
  };
}