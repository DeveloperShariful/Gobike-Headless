// app/product/[slug]/StickyActions.tsx

'use client';

import { useState } from 'react';
import { useCart } from '../../../context/CartContext';
import styles from './StickyActions.module.css';

interface ProductForCart {
  id: string;
  databaseId: number;
  variationId?: number;
  name: string;
  price?: string | null;
  image?: string | null;
  slug: string;
}

interface StickyActionsProps {
  product: ProductForCart;
  isValid: boolean; 
}

export default function StickyActions({ product, isValid }: StickyActionsProps) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart, loading: isCartLoading } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    if (!isValid) return;

    setIsAdding(true);
    await addToCart({
        id: product.id,
        databaseId: product.databaseId,
        variationId: product.variationId,
        name: product.name,
        price: product.price,
        image: product.image,
        slug: product.slug
    }, quantity);
    setIsAdding(false);
  };

  const handleQuantityChange = (amount: number) => {
    setQuantity(prev => Math.max(1, prev + amount));
  };

  // বাটন টেক্সট লজিক
  const buttonText = isAdding ? 'Adding...' : (isValid ? 'Add to Cart' : 'Select color and size');

  return (
    <div className={styles.actionsWrapper}>
      <div className={styles.quantitySelector}>
        <button 
          onClick={() => handleQuantityChange(-1)} 
          disabled={isCartLoading || isAdding || quantity <= 1 || !isValid}
        >
          -
        </button>
        <span>{quantity}</span>
        <button 
          onClick={() => handleQuantityChange(1)} 
          disabled={isCartLoading || isAdding || !isValid}
        >
          +
        </button>
      </div>
      
      <button 
        className={styles.addToCartButton}
        onClick={handleAddToCart}
        disabled={isCartLoading || isAdding || !isValid}
        style={{ 
            opacity: isValid ? 1 : 0.6, 
            cursor: isValid ? 'pointer' : 'not-allowed' 
        }}
      >
        {buttonText}
      </button>
    </div>
  );
}