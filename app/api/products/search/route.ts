import { NextRequest, NextResponse } from "next/server";
import { searchProducts } from "@/lib/db/queries/products";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q") || "";

    if (query.length < 2) {
      return NextResponse.json({ products: [] });
    }

    const products = await searchProducts(query);

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Product search error:", error);
    return NextResponse.json(
      { error: "Failed to search products" },
      { status: 500 }
    );
  }
}
