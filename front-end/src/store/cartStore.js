import { create } from 'zustand';

// useCartStore: dedicado a gestionar el estado del carrito de compras.
export const useCartStore = create((set, get) => ({
  //estados iniciales, en un principio el carrito esta vacío
  cartItems: [],

  // 1. añadir al carrito en base al id
  addToCart: (product) => 
    set((state) => {
      const exists = state.cartItems.find((item) => item._id === product._id); // Verifica si el producto ya existe en el carrito
      if (exists) {
        return {
          cartItems: state.cartItems.map((item) =>
            item._id === product._id
              ? { ...item, quantity: item.quantity + 1 } // Incrementa la cantidad
              : item // Mantiene los otros elementos como estan
          ),
        };
      } else {
        return {
          cartItems: [...state.cartItems, { ...product, quantity: 1 }],
        };
      }
    }),

  // 2. sacar del carrito en base al id
  removeFromCart: (productId) =>
    set((state) => ({
      cartItems: state.cartItems.filter((item) => item._id !== productId),
    })),

  // 3. vaciar el carrito
  clearCart: () => set({ cartItems: [] }),

  // 4. actualiza la cantidad de los productos en el carrito 
  updateQuantity: (productId, quantity) =>
    set((state) => ({
      cartItems: state.cartItems.map((item) =>
        item._id === productId
          ? { ...item, quantity: quantity > 0 ? quantity : 1 } // Asegura que la cantidad sea al menos 1
          : item
      ),
    })),

  // 5. verificar si el producto esta en el carrito en base al id
  isInCart: (productId) =>
    get().cartItems.some((item) => item._id === productId),
}));