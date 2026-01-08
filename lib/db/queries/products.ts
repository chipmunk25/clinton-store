import { db } from '@/db';
import { products, categories, stockLevels } from '@/db/schema';
import { eq, and, or, ilike, sql, desc } from 'drizzle-orm';
import { StockStatus } from '@/components/stock/stock-badge';

export interface ProductWithStock {
  id: string;
  productId: string;
  name:  string;
  categoryId: string | null;
  categoryName: string | null;
  costPrice:  string;
  sellingPrice: string;
  reorderLevel: number;
  currentStock: number;
  stockStatus: StockStatus;
  expiryDate: string | null;
}

export async function getProductsWithStock(
  searchQuery?: string
): Promise<ProductWithStock[]> {
  const baseQuery = db
    .select({
      id: products.id,
      productId: products.productId,
      name: products. name,
      categoryId: products.categoryId,
      categoryName: categories.name,
      costPrice: products.costPrice,
      sellingPrice: products.sellingPrice,
      reorderLevel: products.reorderLevel,
      expiryDate: products.expiryDate,
      currentStock:  sql<number>`COALESCE(${stockLevels.currentStock}, 0)`,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(stockLevels, eq(products.id, stockLevels. productId))
    .where(eq(products.isActive, true))
    .orderBy(desc(products.createdAt));

  let result;

  if (searchQuery) {
    result = await db
      .select({
        id: products.id,
        productId: products.productId,
        name: products.name,
        categoryId: products.categoryId,
        categoryName: categories. name,
        costPrice: products.costPrice,
        sellingPrice: products.sellingPrice,
        reorderLevel: products. reorderLevel,
        expiryDate: products.expiryDate,
        currentStock: sql<number>`COALESCE(${stockLevels.currentStock}, 0)`,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(stockLevels, eq(products.id, stockLevels.productId))
      .where(
        and(
          eq(products.isActive, true),
          or(
            ilike(products. productId, `%${searchQuery}%`),
            ilike(products.name, `%${searchQuery}%`)
          )
        )
      )
      .orderBy(desc(products.createdAt));
  } else {
    result = await baseQuery;
  }

  return result. map((product) => ({
    ...product,
    currentStock: Number(product.currentStock),
    stockStatus: getStockStatus(
      Number(product.currentStock),
      product.reorderLevel
    ),
  }));
}

export function getStockStatus(
  currentStock: number,
  reorderLevel: number
): StockStatus {
  if (currentStock === 0) return 'out_of_stock';
  if (currentStock <= reorderLevel) return 'low_stock';
  return 'in_stock';
}

export async function getProductById(id: string) {
  const [product] = await db
    . select({
      id: products.id,
      productId: products.productId,
      name: products. name,
      categoryId: products.categoryId,
      categoryName: categories.name,
      costPrice: products.costPrice,
      sellingPrice: products.sellingPrice,
      reorderLevel: products.reorderLevel,
      expiryDate: products. expiryDate,
      currentStock: sql<number>`COALESCE(${stockLevels.currentStock}, 0)`,
      totalPurchased: sql<number>`COALESCE(${stockLevels. totalPurchased}, 0)`,
      totalSold: sql<number>`COALESCE(${stockLevels.totalSold}, 0)`,
      createdAt: products.createdAt,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(stockLevels, eq(products.id, stockLevels.productId))
    .where(eq(products.id, id))
    .limit(1);

  if (! product) return null;

  return {
    ...product,
    currentStock: Number(product.currentStock),
    totalPurchased: Number(product. totalPurchased),
    totalSold: Number(product.totalSold),
    stockStatus: getStockStatus(
      Number(product.currentStock),
      product.reorderLevel
    ),
  };
}

export async function searchProducts(query:  string, limit = 10) {
  return db
    .select({
      id: products.id,
      productId: products.productId,
      name: products.name,
      sellingPrice: products.sellingPrice,
      currentStock: sql<number>`COALESCE(${stockLevels.currentStock}, 0)`,
      reorderLevel: products.reorderLevel,
    })
    .from(products)
    .leftJoin(stockLevels, eq(products. id, stockLevels.productId))
    .where(
      and(
        eq(products.isActive, true),
        or(
          ilike(products.productId, `%${query}%`),
          ilike(products.name, `%${query}%`)
        )
      )
    )
    .limit(limit);
}