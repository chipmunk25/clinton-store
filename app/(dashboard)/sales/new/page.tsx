import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SaleForm } from '@/components/forms/sale-form';

interface NewSalePageProps {
  searchParams:  Promise<{ product?:  string }>;
}

export default async function NewSalePage({ searchParams }: NewSalePageProps) {
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
          <h1 className="text-xl font-bold">New Sale</h1>
          <p className="text-sm text-muted-foreground">
            Record a product sale
          </p>
        </div>
      </div>

      {/* Sale Form */}
      <SaleForm preselectedProductId={params.product} />
    </div>
  );
}