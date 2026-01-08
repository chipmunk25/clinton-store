import { create } from 'zustand';

interface ProductSearchState {
  searchQuery: string;
  selectedProductId: string | null;
  recentProducts: Array<{ id: string; productId: string; name: string }>;
  
  setSearchQuery: (query: string) => void;
  selectProduct: (product: { id: string; productId: string; name: string } | null) => void;
  addToRecent: (product: { id:  string; productId: string; name: string }) => void;
  clearSearch: () => void;
}

export const useProductStore = create<ProductSearchState>((set, get) => ({
  searchQuery: '',
  selectedProductId:  null,
  recentProducts:  [],

  setSearchQuery: (searchQuery) => set({ searchQuery }),

  selectProduct: (product) =>
    set({
      selectedProductId: product?. id ??  null,
      searchQuery: product?.productId ?? '',
    }),

  addToRecent: (product) => {
    const { recentProducts } = get();
    const filtered = recentProducts.filter((p) => p.id !== product. id);
    set({
      recentProducts: [product, ...filtered]. slice(0, 5), // Keep last 5
    });
  },

  clearSearch:  () => set({ searchQuery: '', selectedProductId: null }),
}));