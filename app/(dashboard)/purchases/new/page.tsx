import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PurchaseForm } from '@/components/forms/purchase-form';

interface NewPurchasePageProps {
  searchParams: Promise<{ product?:  string }>;
}

export default async function NewPurchasePage({ searchParams }: NewPurchasePageProps) {
  const params = await searchParams;

  return (
    <div className="space-y-4 py-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold">Stock In</h1>
          <p className="text-sm text-muted-foreground">
            Record a new purchase
          </p>
        </div>
      </div>

      {/* Purchase Form */}
      <PurchaseForm preselectedProductId={params.product} />
    </div>
  );
}