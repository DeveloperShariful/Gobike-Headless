//app/order-success/OrderSuccessClient.tsx
'use client';

import { useEffect, useState } from 'react';
import { useCart } from '../../context/CartContext';
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

  if (loading) return (
    // .loadingContainer replaced
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
        {/* .spinner replaced */}
        <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 text-lg">Loading Order Details...</p>
    </div>
  );
  
  if (error) return (
    // .errorContainer replaced
    <div className="max-w-[600px] mx-auto mt-12 p-6 bg-red-50 border border-red-200 text-red-700 rounded-lg text-center">
        <p>Error: {error}</p>
    </div>
  );
  
  if (!order) return null;

  const formatAddress = (addr: Address) => (
    <>
      <strong className="block mb-1 text-gray-800">{addr.firstName} {addr.lastName}</strong><br />
      {addr.address1}<br />
      {addr.address2 && <>{addr.address2}<br /></>}
      {addr.city}, {addr.state} {addr.postcode}<br />
      {addr.country}
    </>
  );

  return (
    // .mainContainer replaced
    <div className="bg-gray-50 min-h-screen py-12 px-4">
      {/* .successCard replaced */}
      <div className="max-w-[900px] mx-auto bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        
        {/* Header */}
        {/* .cardHeader replaced */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-10 text-center border-b border-gray-100">
          {/* .iconCircle replaced */}
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-200">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 text-white">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          {/* .title replaced */}
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Order Confirmed!</h1>
          {/* .subtitle replaced */}
          <p className="text-lg text-gray-600 max-w-[600px] mx-auto mb-2">
            Hi {order.billing.firstName}, your order <strong>#{order.databaseId}</strong> has been placed.
          </p>
          {/* .emailText replaced */}
          {order.billing.email && <p className="text-sm text-gray-500">We sent a confirmation email to <span className="font-semibold text-gray-700">{order.billing.email}</span></p>}
        </div>

        {/* Order Meta Data */}
        {/* .metaGrid replaced */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 border-b border-gray-100 bg-white">
           {/* .metaItem replaced */}
           <div className="text-center p-2">
              <span className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Order Number</span>
              <strong className="text-gray-800 text-lg">#{order.databaseId}</strong>
           </div>
           <div className="text-center p-2">
              <span className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Date</span>
              <strong className="text-gray-800 text-lg">{new Date(order.date).toLocaleDateString()}</strong>
           </div>
           <div className="text-center p-2">
              <span className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Total Amount</span>
              {/* .highlightPrice replaced */}
              <strong className="text-green-600 text-xl font-bold" dangerouslySetInnerHTML={{ __html: order.total }} />
           </div>
           <div className="text-center p-2">
              <span className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Payment Method</span>
              <strong className="text-gray-800 text-lg">{order.paymentMethodTitle}</strong>
           </div>
        </div>

        {/* Product Table */}
        {/* .tableSection replaced */}
        <div className="p-8">
          {/* .sectionHeading replaced */}
          <h2 className="text-xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-100">Items Ordered</h2>
          {/* .tableResponsive replaced */}
          <div className="overflow-x-auto">
            {/* .productTable replaced */}
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left p-3 font-semibold text-gray-600 text-sm uppercase tracking-wider" style={{width: '60%'}}>Product</th>
                  <th className="text-center p-3 font-semibold text-gray-600 text-sm uppercase tracking-wider">Qty</th>
                  <th className="text-right p-3 font-semibold text-gray-600 text-sm uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.lineItems.nodes.map((item, idx) => {
                  const isShipping = item.product.node.name.startsWith('Shipping:');
                  return (
                    <tr key={idx} className="border-b border-gray-100 last:border-0">
                      {/* .productInfoTd replaced */}
                      <td className="p-4 pl-0">
                        {/* .productFlex replaced */}
                        <div className="flex items-center gap-4">
                           {/* .imgWrapper replaced */}
                           <div className="w-[50px] h-[50px] flex-shrink-0 border border-gray-200 rounded-md overflow-hidden bg-gray-50 flex items-center justify-center">
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
                           {/* .productName replaced */}
                           <span className="font-medium text-gray-800">{item.product.node.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-center text-gray-600">
                          {isShipping ? '-' : item.quantity}
                      </td>
                      <td className="p-4 text-right font-bold text-gray-800">
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
        {/* .addressGrid replaced */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 bg-gray-50 border-t border-gray-100">
          {/* .addressBox replaced */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-sm uppercase tracking-wider font-bold text-gray-500 mb-4 border-b border-gray-100 pb-2">Billing Address</h3>
            <address className="not-italic text-gray-600 leading-relaxed text-sm">{formatAddress(order.billing)}</address>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-sm uppercase tracking-wider font-bold text-gray-500 mb-4 border-b border-gray-100 pb-2">Shipping Address</h3>
            <address className="not-italic text-gray-600 leading-relaxed text-sm">
              {order.shipping?.address1 ? formatAddress(order.shipping) : "Same as Billing Address"}
            </address>
          </div>
        </div>

        {/* Button */}
        {/* .footerAction replaced */}
        <div className="p-8 text-center bg-white border-t border-gray-100">
          <Link href="/products" className="inline-block bg-black text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 hover:bg-gray-800 hover:-translate-y-0.5 shadow-lg shadow-gray-200">
            Continue Shopping
          </Link>
        </div>

      </div>
    </div>
  );
}