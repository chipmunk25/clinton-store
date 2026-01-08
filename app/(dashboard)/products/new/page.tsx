import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCurrentUser } from '@/lib/auth/session';
import { ProductForm } from '@/components/forms/product-form';

export default async function NewProductPage() {
  const user = await getCurrentUser();

  // Only admins can add products
  if (user?.role !== 'admin') {
    redirect('/products');
  }

  return (
    <div className="space-y-4 py-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/products">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold">Add Product</h1>
          <p className="text-sm text-muted-foreground">
            Create a new product
          </p>
        </div>
      </div>

      {/* Product Form */}
      <ProductForm />
    </div>
  );
}