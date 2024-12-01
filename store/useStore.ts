import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, CartItem } from '@/types/product';
import { products as initialProducts } from '@/data/products';

interface StoreState {
  products: Product[];
  cart: CartItem[];
  isDarkMode: boolean;
  isSideMenuExpanded: boolean;
  isAdminAuthenticated: boolean;
  addProduct: (product: Product) => void;
  editProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  duplicateProduct: (product: Product) => void;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartItemQuantity: (productId: string, quantity: number) => void;
  toggleDarkMode: () => void;
  toggleSideMenu: () => void;
  setAdminAuthenticated: (value: boolean) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      products: initialProducts,
      cart: [],
      isDarkMode: false,
      isSideMenuExpanded: true,
      isAdminAuthenticated: false,

      addProduct: (product) =>
        set((state) => {
          const newProducts = [...state.products, product];
          updateProductsFile(newProducts);
          return { products: newProducts };
        }),

      editProduct: (product) =>
        set((state) => {
          const newProducts = state.products.map((p) =>
            p.id === product.id ? product : p
          );
          updateProductsFile(newProducts);
          return { products: newProducts };
        }),

      deleteProduct: (productId) =>
        set((state) => {
          const newProducts = state.products.filter((p) => p.id !== productId);
          const newCart = state.cart.filter((item) => item.id !== productId);
          updateProductsFile(newProducts);
          return {
            products: newProducts,
            cart: newCart,
          };
        }),

      duplicateProduct: (product) =>
        set((state) => {
          const duplicatedProduct = {
            ...product,
            id: Date.now().toString(),
            name: `${product.name} (Copy)`,
          };
          const newProducts = [...state.products, duplicatedProduct];
          updateProductsFile(newProducts);
          return { products: newProducts };
        }),

      addToCart: (product) =>
        set((state) => {
          const existingItem = state.cart.find((item) => item.id === product.id);
          if (existingItem) {
            return {
              cart: state.cart.map((item) =>
                item.id === product.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            };
          }
          return { cart: [...state.cart, { ...product, quantity: 1 }] };
        }),

      removeFromCart: (productId) =>
        set((state) => ({
          cart: state.cart.filter((item) => item.id !== productId),
        })),

      updateCartItemQuantity: (productId, quantity) =>
        set((state) => ({
          cart: state.cart.map((item) =>
            item.id === productId ? { ...item, quantity } : item
          ),
        })),

      toggleDarkMode: () =>
        set((state) => ({ isDarkMode: !state.isDarkMode })),

      toggleSideMenu: () =>
        set((state) => ({ isSideMenuExpanded: !state.isSideMenuExpanded })),

      setAdminAuthenticated: (value: boolean) =>
        set({ isAdminAuthenticated: value }),
    }),
    {
      name: 'snack-shop-storage',
      partialize: (state) => ({
        isAdminAuthenticated: state.isAdminAuthenticated,
        isDarkMode: state.isDarkMode,
        cart: state.cart,
      }),
    }
  )
);

async function updateProductsFile(products: Product[]) {
  try {
    const response = await fetch('/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ products }),
    });
    
    if (!response.ok) {
      console.error('Failed to update products file');
    }
  } catch (error) {
    console.error('Error updating products file:', error);
  }
}