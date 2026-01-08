'use client';

import { useState, useEffect } from 'react';
import { Search, Package, MapPin, DollarSign, X, PackageX } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StockBadge, StockStatus } from '@/components/stock/stock-badge';
import { formatCurrency } from '@/lib/utils';

interface ProductLocation {
  code: string;
  label: string;
  quantity: number;
}

interface ProductResult {
  id: string;
  productId: string;
  name:  string;
  sellingPrice: string;
  currentStock: number;
  stockStatus: StockStatus;
  locations:  ProductLocation[];
}

export default function EnquiryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<ProductResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const searchProducts = async () => {
      if (searchQuery.length < 2) {
        setResults([]);
        setHasSearched(false);
        return;
      }

      setIsSearching(true);
      setHasSearched(true);

      try {
        const res = await fetch(`/api/products/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        setResults(data.products || []);
      } catch (error) {
        console.error('Search failed:', error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(searchProducts, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  return (
    <div className="space-y-4 py-4">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold">Product Enquiry</h1>
        <p className="text-sm text-muted-foreground">
          Check product availability, price & location
        </p>
      </div>

      {/* Search Box */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search product name or ID..."
          className="pl-10 pr-10 h-14 text-lg"
          autoFocus
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Loading State */}
      {isSearching && (
        <div className="text-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-sm text-muted-foreground mt-2">Searching...</p>
        </div>
      )}

      {/* No Results */}
      {hasSearched && ! isSearching && results.length === 0 && (
        <div className="text-center py-12">
          <PackageX className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold text-lg">No products found</h3>
          <p className="text-sm text-muted-foreground">
            Try a different search term
          </p>
        </div>
      )}

      {/* Results */}
      {! isSearching && results.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Found {results.length} product{results.length !== 1 ? 's' :  ''}
          </p>

          {results.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <CardContent className="p-0">
                {/* Product Header */}
                <div className="p-4 bg-muted/30">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-mono text-sm text-muted-foreground">
                        {product.productId}
                      </p>
                      <h3 className="font-semibold text-lg">{product.name}</h3>
                    </div>
                    <StockBadge
                      status={product.stockStatus}
                      quantity={product.currentStock}
                    />
                  </div>
                </div>

                {/* Price */}
                <div className="p-4 border-b flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <DollarSign className="h-5 w-5" />
                    <span>Price</span>
                  </div>
                  <span className="text-2xl font-bold text-primary">
                    {formatCurrency(product.sellingPrice)}
                  </span>
                </div>

                {/* Stock Status */}
                <div className="p-4 border-b flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Package className="h-5 w-5" />
                    <span>Availability</span>
                  </div>
                  <div className="text-right">
                    {product.currentStock > 0 ? (
                      <span className="text-green-600 font-semibold">
                        In Stock ({product.currentStock} available)
                      </span>
                    ) : (
                      <span className="text-red-600 font-semibold">
                        Out of Stock
                      </span>
                    )}
                  </div>
                </div>

                {/* Locations */}
                <div className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-3">
                    <MapPin className="h-5 w-5" />
                    <span>Location{product.locations.length !== 1 ? 's' :  ''}</span>
                  </div>

                  {product.locations.length > 0 ? (
                    <div className="space-y-2">
                      {product.locations.map((loc) => (
                        <div
                          key={loc.code}
                          className="flex items-center justify-between bg-muted p-3 rounded-lg"
                        >
                          <div>
                            <p className="font-mono font-bold text-lg text-primary">
                              {loc.code}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {loc.label}
                            </p>
                          </div>
                          <Badge variant="secondary" className="font-mono text-base px-3 py-1">
                            {loc.quantity} pcs
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : product.currentStock > 0 ? (
                    <p className="text-sm text-amber-600 bg-amber-50 dark:bg-amber-950 p-3 rounded-lg">
                      Location not yet assigned.  Please ask staff for assistance.
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Product currently out of stock
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Initial State */}
      {!hasSearched && !isSearching && (
        <div className="text-center py-12">
          <Search className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold text-lg">Search for a product</h3>
          <p className="text-sm text-muted-foreground">
            Enter at least 2 characters to search
          </p>
        </div>
      )}
    </div>
  );
}