// app/product/[slug]/StickyAddToCart.tsx

'use client';

import Image from 'next/image';
import styles from './StickyAddToCart.module.css';
import StickyActions from './StickyActions';

interface ProductForCart {
  id: string;
  databaseId: number;
  variationId?: number;
  name: string;
  price?: string | null;
  image?: string | null;
  slug: string;
}

const StickyAddToCart = ({ 
  product, 
  isVisible, 
  isValid = true 
}: { 
  product: ProductForCart; 
  isVisible: boolean; 
  isValid?: boolean; // এই লাইনটি মিসিং ছিল
}) => {
  if (!product) return null;

  return (
    <div className={`${styles.stickyWrapper} ${isVisible ? styles.visible : ''}`}>
      <div className={styles.productInfo}>
        {product.image && (
          <Image
            src={product.image}
            alt={product.name}
            width={50}
            height={50}
            className={styles.productImage}
          />
        )}
        <div className={styles.textInfo}>
             <span className={styles.productName}>{product.name}</span>
             <span className={styles.productPrice} dangerouslySetInnerHTML={{ __html: product.price || '' }} />
        </div>
      </div>
      <div className={styles.actions}>
        {/* isValid ভ্যালুটি Actions কম্পোনেন্টে পাঠানো হচ্ছে */}
        <StickyActions product={product} isValid={isValid} /> 
      </div>
    </div>
  );
};

export default StickyAddToCart;