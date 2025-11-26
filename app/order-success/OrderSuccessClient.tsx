//app/order-success/OrderSuccesClient.tsx

'use client';

import { useEffect, useState } from 'react';
import { useCart } from '../../context/CartContext';
import styles from './OrderSuccessClient.module.css';
import Image from 'next/image';
import Link from 'next/link';
import { gtmPurchase } from '../../lib/gtm';
import { klaviyoIdentify, klaviyoTrackPlacedOrder } from '../../lib/klaviyo';

// ====================================================================
// TypeScript ইন্টারফেস (অপরিবর্তিত)
// ====================================================================
interface OrderItemNode {
  databaseId: number;
  slug: string;
  name: string;
  image: {
    sourceUrl: string | null;
  } | null;
}

interface OrderItem {
  product: {
    node: OrderItemNode;
  };
  quantity: number;
  total: string;
}

interface Address {
  firstName: string | null;
  lastName: string | null;
  address1: string | null;
  address2: string | null;
  city: string | null;
  state: string | null;
  postcode: string | null;
  country: string | null;
  email?: string | null;
  phone?: string | null;
}

interface OrderData {
  databaseId: number;
  date: string;
  total: string;
  shippingTotal: string | null;
  discountTotal: string | null;
  status: string;
  paymentMethodTitle: string;
  lineItems: {
    nodes: OrderItem[];
  };
  billing: Address;
  shipping: Address;
  customerNote: string | null;
  appliedCoupons?: {
    nodes: { code: string }[];
  } | null;
}
// ====================================================================

export default function OrderSuccessClient({ orderId, orderKey }: { orderId: string; orderKey: string; }) {
  const { clearCart } = useCart();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trackingFired, setTrackingFired] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchOrderViaApiRoute = async () => {
      try {
        const response = await fetch('/api/get-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId, orderKey }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch order from API route.");
        }

        if (isMounted) {
          console.log("Final Order Data Received:", data);
          setOrder(data);
          if (typeof clearCart === 'function') {
            clearCart();
          }
        }
      } catch (err: unknown) {
        if (isMounted) {
          const message = err instanceof Error ? err.message : "An unknown error occurred.";
          setError(message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchOrderViaApiRoute();
    
    return () => { isMounted = false; };
  }, [orderId, orderKey, clearCart]);

  useEffect(() => {
    if (order && !trackingFired) {
      const parsePrice = (priceStr: string | null | undefined): number => {
        if (!priceStr) return 0;
        return parseFloat(priceStr.replace(/[^0-9.]/g, ''));
      };

      if (order.billing.email) {
        klaviyoIdentify({
          email: order.billing.email,
          first_name: order.billing.firstName || '',
          last_name: order.billing.lastName || '',
        });
      }

      const gtmItems = order.lineItems.nodes.map(item => ({
        item_name: item.product.node.name,
        item_id: item.product.node.databaseId,
        price: parsePrice(item.total) / item.quantity,
        quantity: item.quantity,
      }));

      gtmPurchase({
        transaction_id: order.databaseId.toString(),
        value: parsePrice(order.total),
        tax: 0,
        shipping: parsePrice(order.shippingTotal),
        currency: 'AUD',
        coupon: order.appliedCoupons?.nodes[0]?.code || '',
        items: gtmItems,
      });

      klaviyoTrackPlacedOrder({
        order_id: order.databaseId.toString(),
        value: parsePrice(order.total),
        item_names: order.lineItems.nodes.map(item => item.product.node.name),
        checkout_url: window.location.href,
        items: order.lineItems.nodes.map(item => ({
          ProductID: item.product.node.databaseId,
          ProductName: item.product.node.name,
          Quantity: item.quantity,
          ItemPrice: parsePrice(item.total) / item.quantity,
          RowTotal: parsePrice(item.total),
          ProductURL: `${window.location.origin}/product/${item.product.node.slug}`,
          ImageURL: item.product.node.image?.sourceUrl || '',
        })),
      });

      // --- ★★★ নতুন কোড শুরু ★★★ ---
      // WooCommerce-এ অর্ডারের সোর্স আপডেট করার জন্য API কল
      fetch('/api/update-order-source', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.databaseId.toString() }),
      })
      .then(res => res.json())
      .then(data => {
        console.log('WooCommerce source update response:', data.message);
      })
      .catch(err => {
        console.error('Failed to send order source to WooCommerce:', err);
      });
      // --- ★★★ নতুন কোড শেষ ★★★ ---

      setTrackingFired(true);
    }
  }, [order, trackingFired]);

  if (loading) { return <div className={styles.loader}>Loading your order details...</div>; }
  if (error) { return <div className={styles.error}>{error}</div>; }
  if (!order) { return <div className={styles.error}>Could not load order information.</div>; }
  
  const formatAddress = (addr: Address) => (
    <>
      {addr.firstName} {addr.lastName}<br />
      {addr.address1}{addr.address2 ? <><br />{addr.address2}</> : ''}<br />
      {addr.city}, {addr.state} {addr.postcode}<br />
      {addr.country}
    </>
  );

  return (
    // ... আপনার বাকি JSX কোড সম্পূর্ণ অপরিবর্তিত থাকবে
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <span className={styles.successIcon}>✓</span>
        <h1>Thank You! Your Order is Confirmed.</h1>
        {order.billing.email && <p>A confirmation email has been sent to <strong>{order.billing.email}</strong>.</p>}
      </div>
      <div className={styles.orderDetails}>
        <h2>Order Summary</h2>
        <div className={styles.orderMeta}>
          <p><strong>Order Number:</strong> #{order.databaseId}</p>
          <p><strong>Date:</strong> {new Date(order.date).toLocaleDateString()}</p>
          <p><strong>Total:</strong> <span dangerouslySetInnerHTML={{ __html: order.total }} /></p>
          <p><strong>Payment Method:</strong> {order.paymentMethodTitle}</p>
        </div>
        
        {order.customerNote && (
          <div className={styles.notesSection}>
            <h3>Your Note:</h3>
            <p>{order.customerNote}</p>
          </div>
        )}

         <h3 className={styles.itemsHeader}>Items Ordered</h3>
        <table className={styles.itemsTable}>
          <tbody>
            {order.lineItems.nodes.map((item, index) => {
              const isShipping = item.product.node.name.startsWith('Shipping:');

              return (
                <tr key={index} className={styles.itemRow}>
                  <td className={styles.itemImageCell}>
                    {isShipping ? (
                      <div className={styles.shippingIcon}><Image
                        src="/Transdirect.jpg"
                        alt="Transdirect Shipping"
                        width={80}
                        height={80}
                    /> </div>
                    ) : (
                      <Image 
                        src={item.product?.node.image?.sourceUrl || '/placeholder.png'} 
                        alt={item.product?.node.name || 'Product Image'}
                        width={60} height={60}
                      />
                    )}
                  </td>
                  <td className={styles.itemNameCell}>
                    {isShipping ? (
                      <em>{item.product.node.name}</em>
                    ) : (
                      <>
                        {item.product.node.name} &times; <strong>{item.quantity}</strong>
                      </>
                    )}
                  </td>
                  <td className={styles.itemTotalCell}>
                    <span dangerouslySetInnerHTML={{ __html: item.total }} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className={styles.addressSection}>
        <div className={styles.addressBox}>
          <h3>Billing Address</h3>
          <address>{formatAddress(order.billing)}</address>
        </div>
        <div className={styles.addressBox}>
          <h3>Shipping Address</h3>
          {order.shipping?.address1 ? (
              <address>{formatAddress(order.shipping)}</address>
          ) : (
              <p>Same as billing address.</p>
          )}
        </div>
      </div>
      <div className={styles.actions}>
        <Link href="/products" className={styles.continueButton}>
            Continue Shopping
        </Link>
      </div>
    </div>
  );
}