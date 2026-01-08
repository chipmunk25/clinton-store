import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCurrentUser } from '@/lib/auth/session';
import { getProductById } from '@/lib/db/queries/products';
import { ProductForm } from '@/components/forms/product-form';

interface EditProductPageProps {
  params:  Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const user = await getCurrentUser();

  // Only admins can edit products
  if (user?.role !== 'admin') {
    redirect('/products');
  }

  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  const initialData = {
    id: product.id,
    productId: product.productId,
    name: product.name,
    categoryId: product.categoryId || undefined,
    costPrice: Number(product.costPrice),
    sellingPrice: Number(product.sellingPrice),
    reorderLevel: product.reorderLevel,
    expiryDate: product.expiryDate || undefined,
  };

  return (
    <div className="space-y-4 py-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/products/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold">Edit Product</h1>
          <p className="text-sm text-muted-foreground">
            {product.productId} - {product.name}
          </p>
        </div>
      </div>

      {/* Product Form */}
      <ProductForm initialData={initialData} />
    </div>
  );
}