import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getCurrentUser } from '@/lib/auth/session';
import { getAllCategories } from '@/lib/db/queries/categories';
import { AddCategoryDialog } from '@/components/admin/add-category-dialog';

export default async function CategoriesPage() {
  const user = await getCurrentUser();

  if (user?.role !== 'admin') {
    redirect('/');
  }

  const categories = await getAllCategories();

  return (
    <div className="space-y-4 py-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/more">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold">Categories</h1>
            <p className="text-sm text-muted-foreground">
              Manage product categories
            </p>
          </div>
        </div>
        <AddCategoryDialog />
      </div>

      {/* Categories List */}
      {categories.length === 0 ?  (
        <div className="text-center py-12">
          <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold text-lg">No categories</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Add your first product category
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map((category) => (
            <Card key={category.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-lg">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold">{category.name}</p>
                      {category.description && (
                        <p className="text-sm text-muted-foreground">
                          {category.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {category.productCount} products
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}