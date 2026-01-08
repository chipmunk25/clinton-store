import { db } from "@/db";
import {
  products,
  categories,
  stockLevels,
  purchases,
  shelves,
  chambers,
  zones,
} from "@/db/schema";
import { eq, and, or, ilike, sql, desc } from "drizzle-orm";
import { StockStatus } from "@/components/stock/stock-badge";

export interface ProductLocation {
  code: string;
  label: string;
  quantity: number;
}

export interface ProductWithStock {
  id: string;
  productId: string;
  name: string;
  categoryId: string | null;
  categoryName: string | null;
  costPrice: string;
  sellingPrice: string;
  reorderLevel: number;
  currentStock: number;
  stockStatus: StockStatus;
  expiryDate: string | null;
  locations?: ProductLocation[];
}

export function getStockStatus(
  currentStock: number,
  reorderLevel: number
): StockStatus {
  if (currentStock === 0) return "out_of_stock";
  if (currentStock <= reorderLevel) return "low_stock";
  return "in_stock";
}

// Get locations for a product based on purchases
export async function getProductLocations(
  productId: string
): Promise<ProductLocation[]> {
  // Group purchases by shelf and sum quantities
  // Then subtract sales (distributed proportionally or just show where it was stocked)
  const locationData = await db
    .select({
      shelfId: purchases.shelfId,
      totalQuantity: sql<number>`SUM(${purchases.quantity})::int`,
      zoneCode: zones.code,
      zoneName: zones.name,
      chamberNumber: chambers.chamberNumber,
      chamberName: chambers.name,
      shelfNumber: shelves.shelfNumber,
      zoneSortOrder: zones.sortOrder,
    })
    .from(purchases)
    .innerJoin(shelves, eq(purchases.shelfId, shelves.id))
    .innerJoin(chambers, eq(shelves.chamberId, chambers.id))
    .innerJoin(zones, eq(chambers.zoneId, zones.id))
    .where(eq(purchases.productId, productId))
    .groupBy(
      purchases.shelfId,
      zones.code,
      zones.name,
      zones.sortOrder,
      chambers.chamberNumber,
      chambers.name,
      shelves.shelfNumber
    )
    .orderBy(zones.sortOrder, chambers.chamberNumber, shelves.shelfNumber);

  return locationData.map((loc) => {
    const chamberPadded = String(loc.chamberNumber).padStart(2, "0");
    const shelfPadded = String(loc.shelfNumber).padStart(2, "0");

    return {
      code: `${loc.zoneCode}-C${chamberPadded}-S${shelfPadded}`,
      label: `${loc.zoneName} → ${loc.chamberName} → Shelf ${loc.shelfNumber}`,
      quantity: Number(loc.totalQuantity),
    };
  });
}

export async function getProductsWithStock(
  searchQuery?: string
): Promise<ProductWithStock[]> {
  let whereClause = eq(products.isActive, true);

  if (searchQuery) {
    whereClause = and(
      eq(products.isActive, true),
      or(
        ilike(products.productId, `%${searchQuery}%`),
        ilike(products.name, `%${searchQuery}%`)
      )
    ) as any;
  }

  const result = await db
    .select({
      id: products.id,
      productId: products.productId,
      name: products.name,
      categoryId: products.categoryId,
      categoryName: categories.name,
      costPrice: products.costPrice,
      sellingPrice: products.sellingPrice,
      reorderLevel: products.reorderLevel,
      expiryDate: products.expiryDate,
      currentStock: sql<number>`COALESCE(${stockLevels.currentStock}, 0)`,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(stockLevels, eq(products.id, stockLevels.productId))
    .where(whereClause)
    .orderBy(desc(products.createdAt));

  return result.map((product) => ({
    ...product,
    currentStock: Number(product.currentStock),
    stockStatus: getStockStatus(
      Number(product.currentStock),
      product.reorderLevel
    ),
  }));
}

export async function getProductById(id: string) {
  const [product] = await db
    .select({
      id: products.id,
      productId: products.productId,
      name: products.name,
      categoryId: products.categoryId,
      categoryName: categories.name,
      costPrice: products.costPrice,
      sellingPrice: products.sellingPrice,
      reorderLevel: products.reorderLevel,
      expiryDate: products.expiryDate,
      currentStock: sql<number>`COALESCE(${stockLevels.currentStock}, 0)`,
      totalPurchased: sql<number>`COALESCE(${stockLevels.totalPurchased}, 0)`,
      totalSold: sql<number>`COALESCE(${stockLevels.totalSold}, 0)`,
      createdAt: products.createdAt,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(stockLevels, eq(products.id, stockLevels.productId))
    .where(eq(products.id, id))
    .limit(1);

  if (!product) return null;

  // Get locations
  const locations = await getProductLocations(id);

  return {
    ...product,
    currentStock: Number(product.currentStock),
    totalPurchased: Number(product.totalPurchased),
    totalSold: Number(product.totalSold),
    stockStatus: getStockStatus(
      Number(product.currentStock),
      product.reorderLevel
    ),
    locations,
  };
}

export async function searchProducts(query: string, limit = 10) {
  const results = await db
    .select({
      id: products.id,
      productId: products.productId,
      name: products.name,
      costPrice: products.costPrice,
      sellingPrice: products.sellingPrice,
      currentStock: sql<number>`COALESCE(${stockLevels.currentStock}, 0)`,
      reorderLevel: products.reorderLevel,
    })
    .from(products)
    .leftJoin(stockLevels, eq(products.id, stockLevels.productId))
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

  // Get locations for each product
  const productsWithLocations = await Promise.all(
    results.map(async (product) => {
      const locations = await getProductLocations(product.id);
      const currentStock = Number(product.currentStock);

      return {
        ...product,
        currentStock,
        stockStatus: getStockStatus(currentStock, product.reorderLevel),
        locations,
      };
    })
  );

  return productsWithLocations;
}
