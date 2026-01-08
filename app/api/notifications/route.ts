import { NextResponse } from 'next/server';
import { db } from '@/db';
import { products, stockLevels } from '@/db/schema';
import { eq, and, sql, lte, gt } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth/session';
import { getSettings } from '@/lib/db/queries/settings';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await getSettings();

    // Get low stock items (stock > 0 but <= reorder level)
    const lowStockItems = await db
      .select({
        id: products.id,
        productId: products.productId,
        name: products.name,
        currentStock: stockLevels.currentStock,
        reorderLevel: products.reorderLevel,
      })
      .from(products)
      .innerJoin(stockLevels, eq(products.id, stockLevels.productId))
      .where(
        and(
          eq(products.isActive, true),
          sql`${stockLevels.currentStock} > 0`,
          sql`${stockLevels.currentStock} <= ${products.reorderLevel}`
        )
      )
      .orderBy(stockLevels.currentStock)
      .limit(20);

    // Get out of stock count
    const [outOfStockResult] = await db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(products)
      .innerJoin(stockLevels, eq(products.id, stockLevels.productId))
      .where(
        and(
          eq(products.isActive, true),
          eq(stockLevels.currentStock, 0)
        )
      );

    // Get expiring items
    const expiryThreshold = new Date();
    expiryThreshold. setDate(expiryThreshold.getDate() + settings.expiryAlertDays);

    const expiringItems = await db
      .select({
        id: products.id,
        productId: products.productId,
        name: products.name,
        expiryDate: products.expiryDate,
      })
      .from(products)
      .innerJoin(stockLevels, eq(products. id, stockLevels.productId))
      .where(
        and(
          eq(products.isActive, true),
          sql`${stockLevels.currentStock} > 0`,
          sql`${products.expiryDate} IS NOT NULL`,
          sql`${products.expiryDate}::date <= ${expiryThreshold. toISOString().split('T')[0]}:: date`,
          sql`${products.expiryDate}::date >= CURRENT_DATE`
        )
      )
      .orderBy(products.expiryDate)
      .limit(20);

    // Calculate days until expiry
    const expiringItemsWithDays = expiringItems.map((item) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const expiry = new Date(item.expiryDate! );
      expiry.setHours(0, 0, 0, 0);
      const daysUntilExpiry = Math.ceil(
        (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      return {
        ...item,
        expiryDate: item.expiryDate!,
        daysUntilExpiry,
      };
    });

    return NextResponse.json({
      lowStockItems,
      expiringItems: expiringItemsWithDays,
      outOfStockCount: outOfStockResult?. count || 0,
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}