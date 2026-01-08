'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Minus, Plus, Package, Search, X, MapPin } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StockBadge, StockStatus } from '@/components/stock/stock-badge';
import { formatCurrency } from '@/lib/utils';

const purchaseSchema = z.object({
  productId: z.string().min(1, 'Please select a product'),
  shelfId: z.string().min(1, 'Please select a location'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unitCost: z.number().min(0, 'Cost must be positive'),
  notes: z.string().optional(),
});

type PurchaseFormData = z.infer<typeof purchaseSchema>;

interface ProductSearchResult {
  id: string;
  productId: string;
  name:  string;
  costPrice: string;
  currentStock: number;
  reorderLevel: number;
}

interface LocationOption {
  id: string;
  code: string;
  label: string;
}

interface PurchaseFormProps {
  preselectedProductId?: string;
}

export function PurchaseForm({ preselectedProductId }: PurchaseFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ProductSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductSearchResult | null>(null);
  const [locations, setLocations] = useState<LocationOption[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<PurchaseFormData>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      productId: '',
      shelfId: '',
      quantity: 1,
      unitCost: 0,
      notes: '',
    },
  });

  const quantity = watch('quantity');
  const unitCost = watch('unitCost');
  const totalCost = quantity * unitCost;

  // Load locations on mount
  useEffect(() => {
    const loadLocations = async () => {
      try {
        const res = await fetch('/api/locations');
        const data = await res. json();
        setLocations(data.locations || []);
      } catch (error) {
        console.error('Failed to load locations:', error);
        toast.error('Failed to load locations');
      } finally {
        setIsLoadingLocations(false);
      }
    };
    loadLocations();
  }, []);

  // Search products
  useEffect(() => {
    const searchProducts = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const res = await fetch(`/api/products/search?q=${encodeURIComponent(searchQuery)}&includeCost=true`);
        const data = await res.json();
        setSearchResults(data.products || []);
        setShowResults(true);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(searchProducts, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  // Load preselected product
  useEffect(() => {
    if (preselectedProductId) {
      setSearchQuery(preselectedProductId);
    }
  }, [preselectedProductId]);

  const handleSelectProduct = (product: ProductSearchResult) => {
    setSelectedProduct(product);
    setSearchQuery(product.productId);
    setShowResults(false);
    setValue('productId', product.id);
    setValue('unitCost', parseFloat(product. costPrice));
    setValue('quantity', 1);
  };

  const handleClearProduct = () => {
    setSelectedProduct(null);
    setSearchQuery('');
    setValue('productId', '');
    setValue('unitCost', 0);
    setValue('quantity', 1);
  };

  const adjustQuantity = (delta: number) => {
    const newQty = Math.max(1, quantity + delta);
    setValue('quantity', newQty);
  };

  const getStockStatus = (stock: number, reorder: number): StockStatus => {
    if (stock === 0) return 'out_of_stock';
    if (stock <= reorder) return 'low_stock';
    return 'in_stock';
  };

  const onSubmit = async (data: PurchaseFormData) => {
    if (! selectedProduct) {
      toast.error('Please select a product');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: data.productId,
          shelfId: data.shelfId,
          quantity: data.quantity,
          unitCost: data.unitCost,
          notes: data.notes,
        }),
      });

      const result = await res.json();

      if (! res.ok) {
        throw new Error(result.error || 'Failed to record purchase');
      }

      toast.success('Stock added! ', {
        description: `${selectedProduct.name} +${data.quantity} units`,
      });

      // Reset form for next purchase
      reset();
      handleClearProduct();

    } catch (error) {
      toast.error('Failed to record purchase', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Product Search */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="space-y-2">
            <Label>Product</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (selectedProduct) {
                    handleClearProduct();
                  }
                }}
                placeholder="Search by ID or name..."
                className="pl-9 pr-9 h-12"
                disabled={isSubmitting}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearProduct}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Search Results Dropdown */}
            {showResults && searchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-background border rounded-lg shadow-lg max-h-60 overflow-auto">
                {searchResults.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => handleSelectProduct(product)}
                    className="w-full p-3 text-left hover:bg-muted flex items-center justify-between border-b last:border-0"
                  >
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.productId}</p>
                    </div>
                    <StockBadge
                      status={getStockStatus(product. currentStock, product.reorderLevel)}
                      quantity={product. currentStock}
                    />
                  </button>
                ))}
              </div>
            )}

            {showResults && searchQuery. length >= 2 && searchResults.length === 0 && ! isSearching && (
              <div className="absolute z-10 w-full mt-1 bg-background border rounded-lg shadow-lg p-4 text-center text-muted-foreground">
                No products found
              </div>
            )}
          </div>

          {/* Selected Product Display */}
          {selectedProduct && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">{selectedProduct.name}</p>
                  <p className="text-sm text-muted-foreground font-mono">
                    {selectedProduct.productId}
                  </p>
                  <p className="text-sm mt-1">
                    Cost: {formatCurrency(selectedProduct.costPrice)}
                  </p>
                </div>
                <StockBadge
                  status={getStockStatus(selectedProduct.currentStock, selectedProduct.reorderLevel)}
                  quantity={selectedProduct.currentStock}
                />
              </div>
            </div>
          )}

          {errors.productId && (
            <p className="text-sm text-destructive">{errors.productId.message}</p>
          )}
        </CardContent>
      </Card>

      {/* Location & Quantity */}
      {selectedProduct && (
        <>
          {/* Location Selection */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <Label>Storage Location</Label>
                <Select
                  onValueChange={(value) => setValue('shelfId', value)}
                  disabled={isSubmitting || isLoadingLocations}
                >
                  <SelectTrigger className="h-12">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Select shelf location..." />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={location.id}>
                        <span className="font-mono">{location.code}</span>
                        <span className="text-muted-foreground ml-2">
                          {location.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.shelfId && (
                  <p className="text-sm text-destructive">{errors.shelfId.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quantity & Cost */}
          <Card>
            <CardContent className="p-4 space-y-6">
              {/* Quantity Stepper */}
              <div className="space-y-2">
                <Label>Quantity</Label>
                <div className="flex items-center justify-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 rounded-full"
                    onClick={() => adjustQuantity(-1)}
                    disabled={quantity <= 1 || isSubmitting}
                  >
                    <Minus className="h-5 w-5" />
                  </Button>
                  <Input
                    type="number"
                    inputMode="numeric"
                    {... register('quantity', { valueAsNumber: true })}
                    className="w-24 h-14 text-center text-2xl font-bold"
                    disabled={isSubmitting}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 rounded-full"
                    onClick={() => adjustQuantity(1)}
                    disabled={isSubmitting}
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>
                {errors.quantity && (
                  <p className="text-sm text-destructive text-center">{errors.quantity.message}</p>
                )}
              </div>

              {/* Unit Cost */}
              <div className="space-y-2">
                <Label htmlFor="unitCost">Unit Cost</Label>
                <Input
                  id="unitCost"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  {...register('unitCost', { valueAsNumber: true })}
                  className="h-12 text-lg"
                  disabled={isSubmitting}
                />
                {errors.unitCost && (
                  <p className="text-sm text-destructive">{errors.unitCost.message}</p>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Supplier, invoice number, etc..."
                  {...register('notes')}
                  disabled={isSubmitting}
                />
              </div>
            </CardContent>

            {/* Total & Submit */}
            <CardFooter className="flex-col gap-4 bg-muted/50 p-4">
              <div className="flex justify-between items-center w-full">
                <span className="text-lg font-medium">Total Cost</span>
                <span className="text-3xl font-bold">
                  {formatCurrency(totalCost)}
                </span>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full h-14 text-lg"
                disabled={isSubmitting || ! selectedProduct}
              >
                <Package className="mr-2 h-5 w-5" />
                {isSubmitting ? 'Recording...' : 'Record Purchase'}
              </Button>
            </CardFooter>
          </Card>
        </>
      )}
    </form>
  );
}