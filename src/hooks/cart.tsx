import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

export interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const asyncStorageProducts = await AsyncStorage.getItem(
        '@GoMarketPlace:products',
      );

      if (asyncStorageProducts) {
        setProducts(JSON.parse(asyncStorageProducts));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async (product: Product) => {
      const productIndex = products.findIndex(
        element => element.id === product.id,
      );

      if (productIndex === -1) {
        setProducts([...products, { ...product, quantity: 1 }]);
      } else {
        const newProducts: Product[] = products;
        newProducts[productIndex].quantity += 1;

        setProducts([...newProducts]);
      }

      AsyncStorage.setItem('@GoMarketPlace:products', JSON.stringify(products));

      await AsyncStorage.setItem(
        '@GoMarketPlace:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    async (id: string) => {
      const productIndex = products.findIndex(product => product.id === id);

      const newProducts: Product[] = products;
      newProducts[productIndex].quantity += 1;

      setProducts([...newProducts]);

      await AsyncStorage.setItem(
        '@GoMarketPlace:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async (id: string) => {
      const productIndex = products.findIndex(product => product.id === id);

      const newProducts: Product[] = products;
      newProducts[productIndex].quantity -= 1;

      setProducts([...newProducts]);

      console.log('produtos', products);

      await AsyncStorage.setItem(
        '@GoMarketPlace:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
