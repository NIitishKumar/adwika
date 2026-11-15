import { create } from 'zustand';
import { Cart } from '@/features/cart/types/cart.types';
import { cartService } from '@/features/cart/services/cart.service';
import { showToast } from '@/config/toast.config';
import { isLoggedIn } from '@/config/auth.config';

interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  isMutating: boolean;
  error: string | null;
  isOpen: boolean;

  // Actions
  fetchCart: () => Promise<void>;
  addItem: (variantId: string, quantity?: number, customizationNotes?: string) => Promise<boolean>;
  updateQuantity: (itemId: string, quantity: number) => Promise<boolean>;
  removeItem: (itemId: string) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
  openCart: () => void;
  closeCart: () => void;
  resetCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  cart: null,
  isLoading: false,
  isMutating: false,
  error: null,
  isOpen: false,

  fetchCart: async () => {
    if (!isLoggedIn()) {
      set({ cart: null, isLoading: false });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const cart = await cartService.getCart();
      set({ cart, isLoading: false });
    } catch (err: any) {
      console.error('Failed to fetch user cart:', err);
      set({ error: err?.message || 'Unable to retrieve your shopping bag.', isLoading: false });
    }
  },

  addItem: async (variantId: string, quantity = 1, customizationNotes?: string) => {
    if (!variantId) {
      showToast({
        type: 'error',
        title: 'Variant Required',
        message: 'Please choose an available color and size before adding to bag.',
      });
      return false;
    }

    set({ isMutating: true, error: null });
    try {
      const updatedCart = await cartService.addToCart({
        variantId,
        quantity,
        customizationNotes,
      });

      set({ cart: updatedCart, isMutating: false, isOpen: true });
      showToast({
        type: 'success',
        title: 'Added to Bag',
        message: 'The heirloom has been reserved in your shopping bag.',
      });
      return true;
    } catch (err: any) {
      console.error('Failed to add item to cart:', err);
      set({ isMutating: false, error: err?.message || 'Failed to add item to bag.' });
      showToast({
        type: 'error',
        title: 'Unable to Add',
        message: err?.message || 'Could not add the piece to your bag. Please try again.',
      });
      return false;
    }
  },

  updateQuantity: async (itemId: string, quantity: number) => {
    if (!itemId) return false;

    set({ isMutating: true, error: null });
    try {
      const updatedCart = await cartService.updateQuantity(itemId, quantity);
      set({ cart: updatedCart, isMutating: false });
      return true;
    } catch (err: any) {
      console.error('Failed to update item quantity:', err);
      set({ isMutating: false, error: err?.message || 'Failed to update quantity.' });
      showToast({
        type: 'error',
        title: 'Update Failed',
        message: err?.message || 'Could not update item quantity.',
      });
      return false;
    }
  },

  removeItem: async (itemId: string) => {
    if (!itemId) return false;

    set({ isMutating: true, error: null });
    try {
      const updatedCart = await cartService.removeItem(itemId);
      set({ cart: updatedCart, isMutating: false });
      showToast({
        type: 'info',
        title: 'Item Removed',
        message: 'The piece has been removed from your shopping bag.',
      });
      return true;
    } catch (err: any) {
      console.error('Failed to remove item from cart:', err);
      set({ isMutating: false, error: err?.message || 'Failed to remove item.' });
      showToast({
        type: 'error',
        title: 'Remove Failed',
        message: err?.message || 'Could not remove item from bag.',
      });
      return false;
    }
  },

  clearCart: async () => {
    set({ isMutating: true, error: null });
    try {
      await cartService.clearCart();
      set({ cart: null, isMutating: false });
      return true;
    } catch (err: any) {
      console.error('Failed to clear cart:', err);
      set({ isMutating: false, error: err?.message || 'Failed to clear bag.' });
      return false;
    }
  },

  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  resetCart: () => set({ cart: null, error: null, isOpen: false, isLoading: false, isMutating: false }),
}));
