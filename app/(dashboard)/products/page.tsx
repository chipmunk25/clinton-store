import { Suspense } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCurrentUser } from "@/lib/auth/session";
import { ProductsList } from "@/components/products/products-list";
import { ProductsListSkeleton } from "@/components/products/products-list/skeleton";

interface ProductsPageProps {
  searchParams: Promise<{ q?: string; category?: string }>;
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const user = await getCurrentUser();
  const params = await searchParams;
  const isAdmin = user?.role === "admin";

  return (
    <div className="space-y-4 py-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-sm text-muted-foreground">Manage your inventory</p>
        </div>
        {isAdmin && (
          <Link href="/products/new">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </Link>
        )}
      </div>

      {/* Search */}
      <form action="/products" method="GET">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            name="q"
            placeholder="Search products..."
            defaultValue={params.q}
            className="pl-9 h-11"
          />
        </div>
      </form>

      {/* Products List */}
      <Suspense fallback={<ProductsListSkeleton />}>
        <ProductsList searchQuery={params.q} />
      </Suspense>
    </div>
  );
}
