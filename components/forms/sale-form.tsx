'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ProductSearch } from '@/components/stock/product-search';
import { StockBadge } from '@/components/stock/stock-badge';
import { formatCurrency } from '@/lib/utils';
import { Minus, Plus, ShoppingCart } from 'lucide-react';

const saleSchema = z.object({
  productId: z. string().min(1, 'Please select a product'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unitPrice: z.number().min(0, 'Price must be positive'),
  notes: z.string().optional(),
});

type SaleFormValues = z.infer<typeof saleSchema>;

interface SelectedProduct {
  id: string;
  productId: string;
  name: string;
  currentStock: number;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  sellingPrice: string;
}

export function SaleForm() {
  const router = useRouter();
  const [selectedProduct, setSelectedProduct] = useState<SelectedProduct | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SaleFormValues>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      productId: '',
      quantity:  1,
      unitPrice:  0,
      notes: '',
    },
  });

  const quantity = form.watch('quantity');
  const unitPrice = form.watch('unitPrice');
  const totalAmount = quantity * unitPrice;

  const handleProductSelect = (product: SelectedProduct) => {
    setSelectedProduct(product);
    form.setValue('productId', product.productId);
    form.setValue('unitPrice', parseFloat(product.sellingPrice));
    form.setValue('quantity', 1);
  };

  const adjustQuantity = (delta: number) => {
    const newQty = Math.max(1, quantity + delta);
    if (selectedProduct && newQty > selectedProduct.currentStock) {
      toast.warning(`Only ${selectedProduct.currentStock} available`);
      return;
    }
    form.setValue('quantity', newQty);
  };

  const onSubmit = async (data: SaleFormValues) => {
    if (!selectedProduct) return;

    if (data.quantity > selectedProduct.currentStock) {
      toast.error(`Insufficient stock.  Available: ${selectedProduct.currentStock}`);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to record sale');
      }

      const result = await res.json();

      toast.success('Sale recorded! ', {
        description: `${selectedProduct.name} × ${data.quantity} = ${formatCurrency(totalAmount)}`,
      });

      // Reset for next sale
      setSelectedProduct(null);
      form.reset();
      
      // Optionally navigate to sales list
      // router.push('/sales');
    } catch (error) {
      toast.error('Failed to record sale', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Product Search */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Select Product</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="productId"
              render={() => (
                <FormItem>
                  <FormControl>
                    <ProductSearch
                      onSelect={handleProductSelect}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedProduct && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{selectedProduct.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedProduct.productId}
                    </p>
                  </div>
                  <StockBadge
                    status={selectedProduct.stockStatus}
                    quantity={selectedProduct.currentStock}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quantity & Price */}
        {selectedProduct && (
          <Card>
            <CardContent className="pt-6 space-y-6">
              {/* Quantity Stepper - Mobile Optimized */}
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <div className="flex items-center justify-center gap-4">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-12 w-12 rounded-full"
                          onClick={() => adjustQuantity(-1)}
                          disabled={quantity <= 1}
                        >
                          <Minus className="h-5 w-5" />
                        </Button>
                        <Input
                          {... field}
                          type="number"
                          inputMode="numeric"
                          className="w-20 h-14 text-center text-2xl font-bold"
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-12 w-12 rounded-full"
                          onClick={() => adjustQuantity(1)}
                          disabled={quantity >= selectedProduct.currentStock}
                        >
                          <Plus className="h-5 w-5" />
                        </Button>
                      </div>
                    </FormControl>
                    <p className="text-center text-sm text-muted-foreground">
                      {selectedProduct.currentStock} available
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Unit Price */}
              <FormField
                control={form.control}
                name="unitPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Selling Price (per unit)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        className="h-12 text-lg"
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>

            {/* Total */}
            <CardFooter className="flex-col gap-4 bg-muted/50 rounded-b-lg">
              <div className="flex justify-between items-center w-full text-lg">
                <span className="font-medium">Total</span>
                <span className="text-2xl font-bold text-primary">
                  {formatCurrency(totalAmount)}
                </span>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full h-14 text-lg"
                disabled={isSubmitting || !selectedProduct}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {isSubmitting ? 'Recording...' : 'Record Sale'}
              </Button>
            </CardFooter>
          </Card>
        )}
      </form>
    </Form>
  );
}