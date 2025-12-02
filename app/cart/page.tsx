//app/cart/page.tsx

"use client";
import Breadcrumbs from '../../components/Breadcrumbs';
import { useCart } from '../../context/CartContext';
import Link from 'next/link';
import styles from './CartPage.module.css';
import CartCrossSell from './CartCrossSell';
import { gtmViewCart, gtmBeginCheckout } from '../../lib/gtm';
import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { gql } from '@apollo/client'; // <-- ApolloError ইম্পোর্ট সরানো হয়েছে
import client from '../../lib/apolloClient';
import toast from 'react-hot-toast';

// --- TypeScript Interfaces (অপরিবর্তিত) ---
interface AppliedCoupon {
  code: string;
}

interface CartDetails {
  subtotal: string;
  total: string;
  discountTotal: string;
  appliedCoupons: AppliedCoupon[] | null;
}

// --- GraphQL কোড (অপরিবর্তিত) ---
const GET_CART_DETAILS = gql`
  query GetCartDetails {
    cart {
      subtotal(format: FORMATTED)
      total(format: FORMATTED)
      discountTotal(format: FORMATTED)
      appliedCoupons {
        code
      }
    }
  }
`;

const APPLY_COUPON_MUTATION = gql`
  mutation ApplyCoupon($input: ApplyCouponInput!) {
    applyCoupon(input: $input) { cart { total } }
  }
`;

const REMOVE_COUPON_MUTATION = gql`
  mutation RemoveCoupons($input: RemoveCouponsInput!) {
    removeCoupons(input: $input) { cart { total } }
  }
`;

// --- Checkout বাটন কম্পোনেন্ট (অপরিবর্তিত) ---
function CheckoutButton() {
    const { cartItems } = useCart();
    const handleCheckout = () => {
        if (cartItems.length > 0) {
            const gtmItems = cartItems.map(item => {
                const priceNum = parseFloat(item.price?.replace(/[^0-9.]/g, '') || '0');
                return { item_name: item.name, item_id: item.databaseId, price: priceNum, quantity: item.quantity };
            });
            gtmBeginCheckout(gtmItems);
        }
    };
    return (
        <Link href="/checkout" className={styles.checkoutButton} onClick={handleCheckout}>
            Proceed to Checkout
        </Link>
    );
}

// --- মূল কার্ট পেজ কম্পোনেন্ট ---
export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, loading: isCartLoading } = useCart();
  const [cartDetails, setCartDetails] = useState<CartDetails | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [isCouponLoading, setCouponLoading] = useState(false);

  // --- সার্ভার থেকে কার্টের তথ্য আনার ফাংশন ---
  const fetchCartDetails = useCallback(async () => {
    try {
      // ★★★ সমাধান ১: কোয়েরির টাইপ লেখার পদ্ধতি পরিবর্তন করা হয়েছে ★★★
      const { data } = await client.query<{ cart: CartDetails }>({
        query: GET_CART_DETAILS,
        fetchPolicy: 'network-only'
      });
      if (data && data.cart) {
        setCartDetails(data.cart);
      }
    } catch (error) {
      console.error("Failed to fetch cart details:", error);
    }
  }, []);

  useEffect(() => {
    fetchCartDetails();
  }, [cartItems, fetchCartDetails]);

  useEffect(() => {
    if (cartItems.length > 0) {
        const gtmItems = cartItems.map(item => {
            const priceNum = parseFloat(item.price?.replace(/[^0-9.]/g, '') || '0');
            return { item_name: item.name, item_id: item.databaseId, price: priceNum, quantity: item.quantity };
        });
        gtmViewCart(gtmItems);
    }
  }, [cartItems]);

  // ★★★ সমাধান ২: এরর মেসেজ পাওয়ার জন্য একটি নিরাপদ ফাংশন ★★★
  const getErrorMessage = (error: unknown): string => {
    if (typeof error === 'object' && error !== null && 'message' in error) {
      // GraphQL error এবং 일반 error উভয়ের জন্যই কাজ করবে
      return String((error as { message: string }).message).replace(/<[^>]*>?/gm, '');
    }
    return 'An unknown error occurred.';
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    if (cartDetails?.appliedCoupons && cartDetails.appliedCoupons.length > 0) {
      toast.error("Only one coupon can be applied per order.");
      return;
    }
    setCouponLoading(true);
    toast.loading('Applying coupon...');
    try {
      await client.mutate({
        mutation: APPLY_COUPON_MUTATION,
        variables: { input: { code: couponCode.trim() } }
      });
      await fetchCartDetails();
      toast.dismiss();
      toast.success('Coupon applied!');
      setCouponCode('');
    } catch (error) {
      toast.dismiss();
      toast.error(getErrorMessage(error));
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = async (code: string) => {
    setCouponLoading(true);
    toast.loading('Removing coupon...');
    try {
      await client.mutate({
        mutation: REMOVE_COUPON_MUTATION,
        variables: { input: { codes: [code] } }
      });
      await fetchCartDetails();
      toast.dismiss();
      toast.success('Coupon removed.');
    } catch (error) {
      toast.dismiss();
      toast.error(getErrorMessage(error));
    } finally {
      setCouponLoading(false);
    }
  };

  const isLoading = isCartLoading || isCouponLoading;

  return (
    <>
      <Breadcrumbs pageTitle="Shopping Cart" />
      <div className={styles.container}>
        {cartItems.length === 0 && !isCartLoading ? (
          <div className={styles.emptyCartContainer}>
            <h1 className={styles.title}>Your Cart is Empty</h1>
            <Link href="/products" className={styles.continueShopping}>
              Continue Shopping
            </Link>
          </div>
        ) : (
          <>
            <h1 className={styles.title}>Your Shopping Cart</h1>
            {isLoading && <div className={styles.loadingOverlay}>Updating Cart...</div>}
            <div className={`${styles.cartLayout} ${isLoading ? styles.disabled : ''}`}>
              <div className={styles.cartItems}>
                {cartItems.map(item => (
                  <div key={item.key} className={styles.cartItem}>
                    {item.image ? ( <Image src={item.image} alt={item.name} className={styles.itemImage} width={100} height={100}/> ) : ( <div className={styles.placeholderImage} /> )}
                    <div className={styles.itemInfo}>
                      <h2 className={styles.itemName}>{item.name}</h2>
                      <div className={styles.itemMeta}>
                          <p className={styles.itemPrice} dangerouslySetInnerHTML={{ __html: item.price }}></p>
                          <div className={styles.quantityControl}>
                            <button onClick={() => updateQuantity(item.key, item.quantity - 1)} disabled={isLoading || item.quantity <= 1}>-</button>
                            <span>{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.key, item.quantity + 1)} disabled={isLoading}>+</button>
                          </div>
                      </div>
                    </div>
                    <div className={styles.itemActions}>
                      <button onClick={() => removeFromCart(item.key)} className={styles.removeButton} disabled={isLoading}>Remove</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className={styles.cartSummary}>
                <h2>Order Summary</h2>
                <div className={styles.summaryRow}>
                  <span>Subtotal</span>
                  <span dangerouslySetInnerHTML={{ __html: cartDetails?.subtotal || '$0.00' }}></span>
                </div>
                <div className={styles.couponContainer}>
                  <div className={styles.couponForm}>
                      <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="Coupon code" className={styles.couponInput} disabled={isLoading}/>
                      <button onClick={handleApplyCoupon} className={styles.couponButton} disabled={isLoading || !couponCode.trim()}>
                          {isCouponLoading ? 'Applying...' : 'Apply'}
                      </button>
                  </div>
                </div>
                {cartDetails?.appliedCoupons?.map((coupon) => (
                  <div key={coupon.code} className={`${styles.summaryRow} ${styles.couponRow}`}>
                    <span>Coupon: {coupon.code}</span>
                    <div className={styles.couponValue}>
                      <span dangerouslySetInnerHTML={{ __html: `-${cartDetails.discountTotal || '$0.00'}` }} />
                      <button onClick={() => handleRemoveCoupon(coupon.code)} className={styles.removeButtonSmall} disabled={isLoading}>
                        [Remove]
                      </button>
                    </div>
                  </div>
                ))}
                <div className={`${styles.summaryRow} ${styles.grandTotal}`}>
                  <strong>Total</strong>
                  <strong dangerouslySetInnerHTML={{ __html: cartDetails?.total || '$0.00' }}></strong>
                </div>
                <CheckoutButton />
              </div>
            </div>
          </>
        )}
        <CartCrossSell />
      </div>
    </>
  );
}