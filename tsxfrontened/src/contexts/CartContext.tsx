import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api, type CartItem, type Product } from '@/lib/api';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  total: number;
  isLoading: boolean;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => void;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      const response = await api.getCart();
      if (response.success) {
        setItems(response.data);
      }
    } catch (error) {
      console.error('Failed to load cart:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Load cart when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      refreshCart();
    } else {
      setItems([]);
    }
  }, [isAuthenticated, refreshCart]);

  const addToCart = async (product: Product, quantity: number = 1) => {
    if (!isAuthenticated) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to add items to cart",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Check if item already exists in cart
      const existingItem = items.find(item => item.productId === product.id);
      
      if (existingItem) {
        // Update existing item
        const newQuantity = existingItem.quantity + quantity;
        await updateQuantity(existingItem.id, newQuantity);
      } else {
        // Add new item
        const response = await api.addToCart({
          productId: product.id,
          quantity,
        });
        
        if (response.success) {
          setItems(prev => [...prev, response.data]);
          toast({
            title: "Added to cart",
            description: `${product.name} has been added to your cart`,
          });
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add to cart';
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(itemId);
      return;
    }

    // Find the cart item to get the productId
    const cartItem = items.find(item => item.id === itemId);
    if (!cartItem) {
      toast({
        title: "Error",
        description: "Cart item not found",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.updateCartItem(cartItem.productId, quantity);

      if (response.success) {
        setItems(prev =>
          prev.map(item =>
            item.id === itemId ? response.data : item
          )
        );
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update quantity';
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (itemId: string) => {
    // Find the cart item to get the productId
    const cartItem = items.find(item => item.id === itemId);
    if (!cartItem) {
      toast({
        title: "Error",
        description: "Cart item not found",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.removeFromCart(cartItem.productId);

      if (response.success) {
        setItems(prev => prev.filter(item => item.id !== itemId));
        toast({
          title: "Removed from cart",
          description: "Item has been removed from your cart",
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to remove item';
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = () => {
    setItems([]);
  };

  // Calculate derived values
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = items.reduce((sum, item) => {
    const price = typeof item.product.price === 'number' ? item.product.price : parseFloat(item.product.price || '0');
    return sum + (price * item.quantity);
  }, 0);

  const value: CartContextType = {
    items,
    itemCount,
    total,
    isLoading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};