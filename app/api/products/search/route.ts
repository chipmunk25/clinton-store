import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products, stockLevels } from "@/db/schema";
import { eq, and, or, ilike, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q") || "";
    const includeCost = searchParams.get("includeCost") === "true";

    if (query.length < 2) {
      return NextResponse.json({ products: [] });
    }

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
      .limit(10);

    const productsList = results.map((p) => {
      const currentStock = Number(p.currentStock);
      let stockStatus: "in_stock" | "low_stock" | "out_of_stock" = "in_stock";
      if (currentStock === 0) stockStatus = "out_of_stock";
      else if (currentStock <= p.reorderLevel) stockStatus = "low_stock";

      return {
        id: p.id,
        productId: p.productId,
        name: p.name,
        costPrice: p.costPrice,
        sellingPrice: p.sellingPrice,
        currentStock,
        reorderLevel: p.reorderLevel,
        stockStatus,
      };
    });

    return NextResponse.json({ products: productsList });
  } catch (error) {
    console.error("Product search error:", error);
    return NextResponse.json(
      { error: "Failed to search products" },
      { status: 500 }
    );
  }
}
