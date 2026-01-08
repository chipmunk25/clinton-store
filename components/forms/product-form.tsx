'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Save, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const productSchema = z.object({
  productId: z.string().min(1, 'Product ID is required').max(50),
  name: z.string().min(1, 'Product name is required').max(255),
  categoryId: z.string().optional(),
  costPrice: z.number().min(0, 'Cost price must be positive'),
  sellingPrice: z. number().min(0, 'Selling price must be positive'),
  reorderLevel: z.number().int().min(0, 'Reorder level must be positive'),
  expiryDate: z.string().optional(),
});

type ProductFormData = z. infer<typeof productSchema>;

interface Category {
  id: string;
  name: string;
}

interface ProductFormProps {
  initialData?:  ProductFormData & { id: string };
}

export function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  const isEditing = !!initialData;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData || {
      productId: '',
      name: '',
      categoryId: '',
      costPrice:  0,
      sellingPrice: 0,
      reorderLevel: 5,
      expiryDate:  '',
    },
  });

  const costPrice = watch('costPrice');
  const sellingPrice = watch('sellingPrice');
  const profit = sellingPrice - costPrice;
  const margin = sellingPrice > 0 ? (profit / sellingPrice) * 100 : 0;

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        setCategories(data. categories || []);
      } catch (error) {
        console.error('Failed to load categories:', error);
      } finally {
        setIsLoadingCategories(false);
      }
    };
    loadCategories();
  }, []);

  const onSubmit = async (data:  ProductFormData) => {
    setIsSubmitting(true);

    try {
      const url = isEditing ? `/api/products/${initialData.id}` : '/api/products';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result. error || 'Failed to save product');
      }

      toast. success(isEditing ? 'Product updated!' : 'Product created!', {
        description: data.name,
      });

      router.push('/products');
      router.refresh();

    } catch (error) {
      toast.error('Failed to save product', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Card>
        <CardContent className="p-4 space-y-4">
          {/* Product ID */}
          <div className="space-y-2">
            <Label htmlFor="productId">Product ID (SKU)</Label>
            <Input
              id="productId"
              placeholder="e.g., BEV-001"
              className="h-12 font-mono"
              disabled={isSubmitting || isEditing}
              {...register('productId')}
            />
            {errors.productId && (
              <p className="text-sm text-destructive">{errors.productId. message}</p>
            )}
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Product Name</Label>
            <Input
              id="name"
              placeholder="e.g., Coca Cola 500ml"
              className="h-12"
              disabled={isSubmitting}
              {...register('name')}
            />
            {errors. name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              onValueChange={(value) => setValue('categoryId', value)}
              defaultValue={initialData?.categoryId}
              disabled={isSubmitting || isLoadingCategories}
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select category (optional)" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <h3 className="font-semibold">Pricing</h3>

          <div className="grid grid-cols-2 gap-4">
            {/* Cost Price */}
            <div className="space-y-2">
              <Label htmlFor="costPrice">Cost Price</Label>
              <Input
                id="costPrice"
                type="number"
                inputMode="decimal"
                step="0.01"
                className="h-12"
                disabled={isSubmitting}
                {...register('costPrice', { valueAsNumber: true })}
              />
              {errors. costPrice && (
                <p className="text-sm text-destructive">{errors.costPrice. message}</p>
              )}
            </div>

            {/* Selling Price */}
            <div className="space-y-2">
              <Label htmlFor="sellingPrice">Selling Price</Label>
              <Input
                id="sellingPrice"
                type="number"
                inputMode="decimal"
                step="0.01"
                className="h-12"
                disabled={isSubmitting}
                {...register('sellingPrice', { valueAsNumber: true })}
              />
              {errors.sellingPrice && (
                <p className="text-sm text-destructive">{errors.sellingPrice.message}</p>
              )}
            </div>
          </div>

          {/* Profit Display */}
          {sellingPrice > 0 && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Profit per unit</span>
                <span className={profit >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                  ${profit.toFixed(2)} ({margin.toFixed(1)}%)
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stock Settings */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <h3 className="font-semibold">Stock Settings</h3>

          <div className="grid grid-cols-2 gap-4">
            {/* Reorder Level */}
            <div className="space-y-2">
              <Label htmlFor="reorderLevel">Reorder Level</Label>
              <Input
                id="reorderLevel"
                type="number"
                inputMode="numeric"
                className="h-12"
                disabled={isSubmitting}
                {... register('reorderLevel', { valueAsNumber: true })}
              />
              {errors.reorderLevel && (
                <p className="text-sm text-destructive">{errors.reorderLevel. message}</p>
              )}
            </div>

            {/* Expiry Date */}
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input
                id="expiryDate"
                type="date"
                className="h-12"
                disabled={isSubmitting}
                {...register('expiryDate')}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <Button
        type="submit"
        size="lg"
        className="w-full h-14 text-lg"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Saving... 
          </>
        ) : (
          <>
            <Save className="mr-2 h-5 w-5" />
            {isEditing ? 'Update Product' : 'Create Product'}
          </>
        )}
      </Button>
    </form>
  );
}