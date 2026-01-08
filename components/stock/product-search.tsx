"use client";

import { useState, useEffect, useCallback } from "react";

import { useProductStore } from "@/stores/product-store";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Search, Package } from "lucide-react";
import { StockBadge } from "./stock-badge";
import { useDebounce } from "@/lib/hooks/use-debounce";

interface ProductResult {
  id: string;
  productId: string;
  name: string;
  currentStock: number;
  stockStatus: "in_stock" | "low_stock" | "out_of_stock";
  sellingPrice: string;
}

interface ProductSearchProps {
  onSelect: (product: ProductResult) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ProductSearch({
  onSelect,
  disabled,
  placeholder = "Search product ID or name...",
}: ProductSearchProps) {
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<ProductResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { searchQuery, setSearchQuery, recentProducts, addToRecent } =
    useProductStore();

  const debouncedQuery = useDebounce(searchQuery, 300);

  const searchProducts = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/products/search?q=${encodeURIComponent(query)}`
      );
      const data = await res.json();
      setResults(data.products);
    } catch (error) {
      console.error("Search failed:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    searchProducts(debouncedQuery);
  }, [debouncedQuery, searchProducts]);

  const handleSelect = (product: ProductResult) => {
    addToRecent({
      id: product.id,
      productId: product.productId,
      name: product.name,
    });
    onSelect(product);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className="pl-9 h-12 text-base" // Larger touch target for mobile
            onFocus={() => setOpen(true)}
          />
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w-[calc(100vw-2rem)] max-w-lg p-0"
        align="start"
      >
        <Command>
          <CommandList>
            {isLoading && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Searching...
              </div>
            )}
            <CommandEmpty>No products found.</CommandEmpty>

            {results.length > 0 && (
              <CommandGroup heading="Search Results">
                {results.map((product) => (
                  <CommandItem
                    key={product.id}
                    onSelect={() => handleSelect(product)}
                    className="flex items-center justify-between p-3"
                  >
                    <div className="flex items-center gap-3">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{product.productId}</p>
                        <p className="text-sm text-muted-foreground">
                          {product.name}
                        </p>
                      </div>
                    </div>
                    <StockBadge
                      status={product.stockStatus}
                      quantity={product.currentStock}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {!searchQuery && recentProducts.length > 0 && (
              <CommandGroup heading="Recent">
                {recentProducts.map((product) => (
                  <CommandItem
                    key={product.id}
                    onSelect={() =>
                      handleSelect(product as unknown as ProductResult)
                    }
                    className="flex items-center gap-3 p-3"
                  >
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{product.productId}</p>
                      <p className="text-sm text-muted-foreground">
                        {product.name}
                      </p>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
