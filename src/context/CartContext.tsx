import { createContext, useContext, useState, ReactNode, useMemo } from 'react';

interface CartItem {
  productId?: string;
  название: string;
  количество: number;
  цена: number;
  изображение?: string;
  количествоВУпаковке?: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  updateQuantity: (productId: string | undefined, quantity: number) => void;
  removeItem: (productId: string | undefined) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (newItem: CartItem) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.productId === newItem.productId);
      if (existingItem) {
        return prevItems.map((item) =>
          item.productId === newItem.productId
            ? { ...item, количество: item.количество + newItem.количество }
            : item,
        );
      }
      return [...prevItems, newItem];
    });
  };

  const updateQuantity = (productId: string | undefined, quantity: number) => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.productId === productId) {
          const packageSize = item.количествоВУпаковке || 100;
          const remainder = quantity % packageSize;
          const roundedQuantity = remainder === 0 ? quantity : quantity + (packageSize - remainder);
          return { ...item, количество: Math.max(packageSize, roundedQuantity) };
        }
        return item;
      }),
    );
  };

  const removeItem = (productId: string | undefined) => {
    setItems((prevItems) => prevItems.filter((item) => item.productId !== productId));
  };

  const cartContextValue = useMemo(
    () => ({
      items,
      addToCart,
      updateQuantity,
      removeItem,
    }),
    [items, addToCart, updateQuantity, removeItem],
  );

  return <CartContext.Provider value={cartContextValue}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
