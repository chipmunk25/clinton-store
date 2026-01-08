import { db } from "@/db";
import { products, sales, purchases, stockLevels, users } from "@/db/schema";
import { eq, sql, and, gte, lte, desc } from "drizzle-orm";

export interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  todaySales: number;
  todaySalesCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  lowStockItems: {
    id: string;
    productId: string;
    productCode: string;
    name: string;
    currentStock: number;
    reorderLevel: number;
  }[];
}

export interface RecentActivityItem {
  id: string;
  type: "sale" | "purchase";
  productName: string;
  quantity: number;
  unitPrice: string;
  total: string;
  date: Date;
  userName: string;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  // Get today's date range
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Total products count
  const [productCount] = await db
    .select({
      total: sql<number>`count(*)::int`,
      active: sql<number>`count(*) filter (where ${products.isActive} = true)::int`,
    })
    .from(products);

  // Today's sales total
  const [salesTotal] = await db
    .select({
      total: sql<number>`COALESCE(SUM(${sales.totalAmount}:: numeric), 0)`,
      count: sql<number>`count(*)::int`,
    })
    .from(sales)
    .where(and(gte(sales.saleDate, today), lte(sales.saleDate, tomorrow)));

  // Low stock count (stock <= reorderLevel but > 0)
  const [lowStock] = await db
    .select({ count: sql<number>`count(*)::int` })
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
    .select({ count: sql<number>`count(*)::int` })
    .from(stockLevels)
    .innerJoin(products, eq(stockLevels.productId, products.id))
    .where(and(eq(products.isActive, true), eq(stockLevels.currentStock, 0)));

  // Low stock items list
  const lowStockItems = await db
    .select({
      id: products.id,
      productId: products.id,
      productCode: products.productId,
      name: products.name,
      currentStock: stockLevels.currentStock,
      reorderLevel: products.reorderLevel,
    })
    .from(stockLevels)
    .innerJoin(products, eq(stockLevels.productId, products.id))
    .where(
      and(
        eq(products.isActive, true),
        sql`${stockLevels.currentStock} <= ${products.reorderLevel}`
      )
    )
    .orderBy(stockLevels.currentStock)
    .limit(10);

  return {
    totalProducts: Number(productCount?.total ?? 0),
    activeProducts: Number(productCount?.active ?? 0),
    todaySales: Number(salesTotal?.total ?? 0),
    todaySalesCount: Number(salesTotal?.count ?? 0),
    lowStockCount: Number(lowStock?.count ?? 0),
    outOfStockCount: Number(outOfStock?.count ?? 0),
    lowStockItems,
  };
}

export async function getRecentActivity(
  limit = 10
): Promise<RecentActivityItem[]> {
  // Get recent sales
  const recentSales = await db
    .select({
      id: sales.id,
      productName: products.name,
      quantity: sales.quantity,
      unitPrice: sales.unitPrice,
      total: sales.totalAmount,
      date: sales.saleDate,
      userName: users.name,
    })
    .from(sales)
    .innerJoin(products, eq(sales.productId, products.id))
    .innerJoin(users, eq(sales.recordedBy, users.id))
    .orderBy(desc(sales.saleDate))
    .limit(limit);

  // Get recent purchases
  const recentPurchases = await db
    .select({
      id: purchases.id,
      productName: products.name,
      quantity: purchases.quantity,
      unitPrice: purchases.unitCost,
      total: purchases.totalCost,
      date: purchases.purchaseDate,
      userName: users.name,
    })
    .from(purchases)
    .innerJoin(products, eq(purchases.productId, products.id))
    .innerJoin(users, eq(purchases.recordedBy, users.id))
    .orderBy(desc(purchases.purchaseDate))
    .limit(limit);

  // Combine and sort by date
  const activities: RecentActivityItem[] = [
    ...recentSales.map((s) => ({
      id: s.id,
      type: "sale" as const,
      productName: s.productName,
      quantity: s.quantity,
      unitPrice: s.unitPrice,
      total: s.total,
      date: s.date,
      userName: s.userName,
    })),
    ...recentPurchases.map((p) => ({
      id: p.id,
      type: "purchase" as const,
      productName: p.productName,
      quantity: p.quantity,
      unitPrice: p.unitPrice,
      total: p.total,
      date: p.date,
      userName: p.userName,
    })),
  ];

  // Sort by date descending and limit
  return activities
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}
