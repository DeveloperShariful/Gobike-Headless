'use client';

import { useEffect, useState } from 'react';
import { useCart } from '../../context/CartContext';
import styles from './OrderSuccessClient.module.css';
import Image from 'next/image';
import Link from 'next/link';
import { gtmPurchase } from '../../lib/gtm';
import { klaviyoIdentify, klaviyoTrackPlacedOrder } from '../../lib/klaviyo';

// --- Interfaces (Same as before) ---
interface OrderItemNode {
  databaseId: number;
  slug: string;
  name: string;
  image: { sourceUrl: string | null; } | null;
}
interface OrderItem {
  product: { node: OrderItemNode; };
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
  lineItems: { nodes: OrderItem[]; };
  billing: Address;
  shipping: Address;
  customerNote: string | null;
  appliedCoupons?: { nodes: { code: string }[]; } | null;
}

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
        if (!response.ok) throw new Error(data.error || "Failed to fetch order.");

        if (isMounted) {
          setOrder(data);
          if (typeof clearCart === 'function') clearCart();
        }
      } catch (err: unknown) {
        if (isMounted) setError(err instanceof Error ? err.message : "An unknown error occurred.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchOrderViaApiRoute();
    return () => { isMounted = false; };
  }, [orderId, orderKey, clearCart]);

  useEffect(() => {
    if (order && !trackingFired) {
      // Tracking Logic (Keeping it same)
       const parsePrice = (p: string | null | undefined) => p ? parseFloat(p.replace(/[^0-9.]/g, '')) : 0;
      
      if (order.billing.email) {
        klaviyoIdentify({ email: order.billing.email, first_name: order.billing.firstName || '', last_name: order.billing.lastName || '' });
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
        item_names: order.lineItems.nodes.map(i => i.product.node.name),
        checkout_url: window.location.href,
        items: order.lineItems.nodes.map(item => ({
             ProductID: item.product.node.databaseId,
             ProductName: item.product.node.name,
             Quantity: item.quantity,
             ItemPrice: parsePrice(item.total) / item.quantity,
             RowTotal: parsePrice(item.total),
             ProductURL: `${window.location.origin}/product/${item.product.node.slug}`,
             ImageURL: item.product.node.image?.sourceUrl || '',
        }))
      });
      fetch('/api/update-order-source', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.databaseId.toString() }),
      }).catch(console.error);
      
      setTrackingFired(true);
    }
  }, [order, trackingFired]);

  if (loading) return <div className={styles.loadingContainer}><div className={styles.spinner}></div><p>Loading Order Details...</p></div>;
  if (error) return <div className={styles.errorContainer}><p>Error: {error}</p></div>;
  if (!order) return null;

  const formatAddress = (addr: Address) => (
    <>
      <strong className={styles.addressName}>{addr.firstName} {addr.lastName}</strong><br />
      {addr.address1}<br />
      {addr.address2 && <>{addr.address2}<br /></>}
      {addr.city}, {addr.state} {addr.postcode}<br />
      {addr.country}
    </>
  );

  return (
    <div className={styles.mainContainer}>
      <div className={styles.successCard}>
        
        {/* Header */}
        <div className={styles.cardHeader}>
          <div className={styles.iconCircle}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <h1 className={styles.title}>Order Confirmed!</h1>
          <p className={styles.subtitle}>
            Hi {order.billing.firstName}, your order <strong>#{order.databaseId}</strong> has been placed.
          </p>
          {order.billing.email && <p className={styles.emailText}>We sent a confirmation email to <span>{order.billing.email}</span></p>}
        </div>

        {/* Order Meta Data */}
        <div className={styles.metaGrid}>
           <div className={styles.metaItem}>
              <span>Order Number</span>
              <strong>#{order.databaseId}</strong>
           </div>
           <div className={styles.metaItem}>
              <span>Date</span>
              <strong>{new Date(order.date).toLocaleDateString()}</strong>
           </div>
           <div className={styles.metaItem}>
              <span>Total Amount</span>
              <strong className={styles.highlightPrice} dangerouslySetInnerHTML={{ __html: order.total }} />
           </div>
           <div className={styles.metaItem}>
              <span>Payment Method</span>
              <strong>{order.paymentMethodTitle}</strong>
           </div>
        </div>

        {/* Product Table */}
        <div className={styles.tableSection}>
          <h2 className={styles.sectionHeading}>Items Ordered</h2>
          <div className={styles.tableResponsive}>
            <table className={styles.productTable}>
              <thead>
                <tr>
                  <th style={{width: '60%'}}>Product</th>
                  <th style={{textAlign: 'center'}}>Qty</th>
                  <th style={{textAlign: 'right'}}>Total</th>
                </tr>
              </thead>
              <tbody>
                {order.lineItems.nodes.map((item, idx) => {
                  const isShipping = item.product.node.name.startsWith('Shipping:');
                  return (
                    <tr key={idx}>
                      <td className={styles.productInfoTd}>
                        <div className={styles.productFlex}>
                           <div className={styles.imgWrapper}>
                              {isShipping ? (
                                <Image src="/Transdirect.jpg" alt="Shipping" width={40} height={40} style={{objectFit:'contain'}}/>
                              ) : (
                                <Image 
                                  src={item.product?.node.image?.sourceUrl || '/placeholder.png'} 
                                  alt="Product" 
                                  width={50} height={50} 
                                  style={{objectFit:'contain'}}
                                />
                              )}
                           </div>
                           <span className={styles.productName}>{item.product.node.name}</span>
                        </div>
                      </td>
                      <td style={{textAlign: 'center'}}>
                         {isShipping ? '-' : item.quantity}
                      </td>
                      <td style={{textAlign: 'right', fontWeight: 'bold'}}>
                        <span dangerouslySetInnerHTML={{ __html: item.total }} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Addresses */}
        <div className={styles.addressGrid}>
          <div className={styles.addressBox}>
            <h3>Billing Address</h3>
            <address>{formatAddress(order.billing)}</address>
          </div>
          <div className={styles.addressBox}>
            <h3>Shipping Address</h3>
            <address>
              {order.shipping?.address1 ? formatAddress(order.shipping) : "Same as Billing Address"}
            </address>
          </div>
        </div>

        {/* Button */}
        <div className={styles.footerAction}>
          <Link href="/products" className={styles.btnPrimary}>
            Continue Shopping
          </Link>
        </div>

      </div>
    </div>
  );
}