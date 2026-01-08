import { db } from "@/db";
import { products, stockLevels } from "@/db/schema";
import { eq, sql, desc } from "drizzle-orm";
import { StockStatus } from "@/components/stock/stock-badge";

export interface StockOverviewData {
  summary: {
    inStock: number;
    lowStock: number;
    outOfStock: number;
    totalValue: number;
  };
  products: {
    id: string;
    productId: string;
    name: string;
    currentStock: number;
    reorderLevel: number;
    costPrice: string;
    stockStatus: StockStatus;
  }[];
}

export async function getStockOverview(
  filter?: string
): Promise<StockOverviewData> {
  // Get all products with stock
  const allProducts = await db
    .select({
      id: products.id,
      productId: products.productId,
      name: products.name,
      costPrice: products.costPrice,
      reorderLevel: products.reorderLevel,
      currentStock: sql<number>`COALESCE(${stockLevels.currentStock}, 0)`,
    })
    .from(products)
    .leftJoin(stockLevels, eq(products.id, stockLevels.productId))
    .where(eq(products.isActive, true))
    .orderBy(
      sql`COALESCE(${stockLevels.currentStock}, 0)`,
      desc(products.name)
    );

  // Calculate summary
  let inStock = 0;
  let lowStock = 0;
  let outOfStock = 0;
  let totalValue = 0;

  const productsWithStatus = allProducts.map((p) => {
    const currentStock = Number(p.currentStock);
    const costPrice = Number(p.costPrice);
    let stockStatus: StockStatus = "in_stock";

    if (currentStock === 0) {
      stockStatus = "out_of_stock";
      outOfStock++;
    } else if (currentStock <= p.reorderLevel) {
      stockStatus = "low_stock";
      lowStock++;
    } else {
      inStock++;
    }

    totalValue += currentStock * costPrice;

    return {
      id: p.id,
      productId: p.productId,
      name: p.name,
      currentStock,
      reorderLevel: p.reorderLevel,
      costPrice: p.costPrice,
      stockStatus,
    };
  });

  // Filter products based on filter param
  let filteredProducts = productsWithStatus;
  if (filter === "low") {
    filteredProducts = productsWithStatus.filter(
      (p) => p.stockStatus === "low_stock"
    );
  } else if (filter === "out") {
    filteredProducts = productsWithStatus.filter(
      (p) => p.stockStatus === "out_of_stock"
    );
  }

  return {
    summary: {
      inStock,
      lowStock,
      outOfStock,
      totalValue,
    },
    products: filteredProducts,
  };
}
