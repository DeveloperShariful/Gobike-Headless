// components/MiniCart.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import styles from './MiniCart.module.css';
import { IoClose } from 'react-icons/io5';
import Image from 'next/image';

interface MiniCartProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MiniCart({ isOpen, onClose }: MiniCartProps) {
  const { cartItems, removeFromCart, updateQuantity, loading } = useCart();
  
  // ১. নির্দিষ্ট আইটেম রিমুভ হচ্ছে কিনা তা ট্র্যাক করার জন্য স্টেট
  const [removingKey, setRemovingKey] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) { document.body.classList.add('no-scroll'); } 
    else { document.body.classList.remove('no-scroll'); }
    return () => { document.body.classList.remove('no-scroll'); };
  }, [isOpen]);

  const parsePrice = (price: string) => {
    const cleanedPrice = price ? String(price).replace(/<[^>]*>|[^0-9.]/g, '') : '0';
    return parseFloat(cleanedPrice) || 0;
  };

  const subtotal = cartItems.reduce((total, item) => {
    // সাবটোটালের জন্য লাইন টোটাল ব্যবহার করা ভালো
    if (item.total) return total + parsePrice(item.total);
    const price = parsePrice(item.price);
    return total + price * item.quantity;
  }, 0);

  // ২. রিমুভ হ্যান্ডলার যা Removing স্টেট সেট করবে
  const handleRemove = async (key: string) => {
    setRemovingKey(key); 
    await removeFromCart(key);
    setRemovingKey(null);
  };

  // অ্যাট্রিবিউট নাম সুন্দর করার ফাংশন (pa_size -> Size)
  const formatLabel = (name: string) => {
    const clean = name.replace(/^pa_/, '').replace(/_/g, ' ');
    return clean.charAt(0).toUpperCase() + clean.slice(1);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className={`${styles.miniCartOverlay} ${isOpen ? styles.open : ''}`} onClick={onClose}></div>
      <div className={`${styles.miniCartContainer} ${isOpen ? styles.open : ''}`}>
        <header className={styles.header}>
          <h3>Shopping Cart</h3>
          <button className={styles.closeButton} onClick={onClose}><IoClose /></button>
        </header>

        {loading && <div className={styles.loadingBar}>Processing...</div>}

        <div className={styles.cartBody}>
          {cartItems.length === 0 ? (
            <p className={styles.emptyMessage}>Your cart is empty.</p>
          ) : (
            cartItems.map(item => {
                // ৩. সঠিক প্রাইস বের করার লজিক (Total / Qty)
                let displayPrice = item.price;
                if (item.total && item.quantity > 0) {
                    const totalPrice = parsePrice(item.total);
                    const unitPrice = totalPrice / item.quantity;
                    displayPrice = `$${unitPrice.toFixed(2)}`;
                }

                return (
                  <div key={item.key} className={styles.cartItem}>
                    {item.image ? (<Image src={item.image} alt={item.name} className={styles.itemImage} width={100} height={100} />) : (<div className={styles.placeholderImage}/>)}
                    
                    <div className={styles.itemDetails}>
                      <p className={styles.itemName}>{item.name}</p>
                      
                      {/* ৪. Size এবং Color দেখানো (যদি থাকে) */}
                      {/* @ts-ignore - attributes টাইপ ইরর এড়াতে */}
                      {item.attributes && item.attributes.length > 0 && (
                          <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                              {/* @ts-ignore */}
                              {item.attributes.map((attr: any, index: number) => (
                                  <span key={index} style={{ marginRight: '8px', textTransform: 'capitalize' }}>
                                      <strong>{formatLabel(attr.name)}:</strong> {attr.value}
                                  </span>
                              ))}
                          </div>
                      )}

                      <div className={styles.quantityControl}>
                        <span>Qty: </span>
                        <button onClick={() => updateQuantity(item.key, item.quantity - 1)} disabled={loading || item.quantity <= 1}>-</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.key, item.quantity + 1)} disabled={loading}>+</button>
                      </div>
                      
                      {/* আপডেট করা প্রাইস দেখানো */}
                      <p className={styles.itemPrice} dangerouslySetInnerHTML={{ __html: displayPrice }}></p>
                    </div>
                    
                    <div className={styles.itemActions}>
                        <button 
                            className={styles.removeButton} 
                            onClick={() => handleRemove(item.key)} 
                            // গ্লোবাল লোডিং অথবা স্পেসিফিক রিমুভিং এর সময় ডিজেবল থাকবে
                            disabled={loading || removingKey === item.key}
                            style={{ opacity: removingKey === item.key ? 0.6 : 1 }}
                        >
                            {/* Removing টেক্সট দেখানো */}
                            {removingKey === item.key ? 'Removing...' : 'Remove'}
                        </button>
                    </div>
                  </div>
                );
            })
          )}
        </div>

        {cartItems.length > 0 && (
          <footer className={styles.footer}>
            <div className={styles.subtotal}>
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className={styles.actionButtons}>
              <Link href="/cart" className={`${styles.actionButton} ${styles.viewCart}`} onClick={onClose}>
                View Cart
              </Link>
              <Link 
                href="/checkout"
                className={`${styles.actionButton} ${styles.checkout}`}
                onClick={onClose}
              >
                Checkout
              </Link>
            </div>
          </footer>
        )}
      </div>
    </>
  );
}