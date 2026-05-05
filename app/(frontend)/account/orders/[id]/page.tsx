//app/account/orders/[id]/page.tsx

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { AUTH_COOKIE_NAME } from '@/lib/constants';

// ★★★ আপডেট: নতুন ফিল্ড সহ কুয়েরি ★★★
const GET_SINGLE_ORDER_QUERY = `
query GetSingleOrderByKey($key: String, $id: Int) {
  singleOrderByKey(secretKey: $key, orderId: $id) {
    orderNumber
    date
    status
    total
    subtotal
    shippingTotal
    taxTotal
    discountTotal
    paymentMethod
    customerNote
    lineItems {
      name
      quantity
      total
      price
      sku
      image
    }
    billing {
      firstName
      lastName
      address1
      address2
      city
      state
      postcode
      email
      phone
      country
    }
    shipping {
      firstName
      lastName
      address1
      address2
      city
      state
      postcode
      country
    }
  }
}
`;

async function getOrder(secretKey: string, orderId: number) {
  const endpoint = process.env.WORDPRESS_GRAPHQL_ENDPOINT;
  if (!endpoint) return null;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
          query: GET_SINGLE_ORDER_QUERY,
          variables: { key: secretKey, id: orderId } 
      }),
      cache: 'no-store',
    });
    
    const data = await response.json();
    return data?.data?.singleOrderByKey || null;

  } catch (error) {
    return null;
  }
}

export default async function SingleOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const secretKey = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const { id } = await params; 

  if (!secretKey) redirect('/login');

  const order = await getOrder(secretKey, parseInt(id));

  if (!order) {
    return (
      <div className="p-8 text-center bg-[#fff5f5] border border-[#fed7d7] rounded-lg text-[#c53030]">
        <p className="font-bold text-lg mb-2">Order not found</p>
        <Link href="/account/orders" className="text-[#007bff] hover:underline font-semibold">← Back to Orders</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
            <h1 className="text-2xl font-bold text-[#333]">Order #{order.orderNumber}</h1>
            <p className="text-sm text-[#666]">Placed on {new Date(order.date).toLocaleDateString()} at {new Date(order.date).toLocaleTimeString()}</p>
        </div>
        <Link href="/account/orders" className="text-sm px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 text-[#333] font-semibold transition">
          ← Back to List
        </Link>
      </div>

      {/* Note Section (যদি থাকে) */}
      {order.customerNote && (
          <div className="bg-[#fff9db] border-l-4 border-[#ffc107] p-4 mb-8 text-[#555]">
              <p className="font-bold text-[#333] text-sm uppercase mb-1">Order Note:</p>
              <p>{order.customerNote}</p>
          </div>
      )}

      {/* Order Items Table */}
      <div className="bg-white border border-[#e0e0e0] rounded-lg overflow-hidden mb-8 shadow-sm">
        <div className="overflow-x-auto">
            <table className="w-full border-collapse">
            <thead>
                <tr className="bg-[#f8f9fa] border-b border-[#e0e0e0]">
                <th className="p-4 text-left font-bold text-[#333] text-sm uppercase w-[60%]">Product</th>
                <th className="p-4 text-center font-bold text-[#333] text-sm uppercase">Price</th>
                <th className="p-4 text-center font-bold text-[#333] text-sm uppercase">Quantity</th>
                <th className="p-4 text-right font-bold text-[#333] text-sm uppercase">Total</th>
                </tr>
            </thead>
            <tbody>
                {order.lineItems.map((item: any, index: number) => (
                <tr key={index} className="border-b border-[#eee] last:border-0 hover:bg-[#fafafa]">
                    <td className="p-4">
                        <div className="flex items-center gap-4">
                            {item.image && (
                                <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded border border-[#eee]" />
                            )}
                            <div>
                                <p className="font-semibold text-[#333]">{item.name}</p>
                                {item.sku && <p className="text-xs text-[#888]">SKU: {item.sku}</p>}
                            </div>
                        </div>
                    </td>
                    <td className="p-4 text-center text-[#555]">{item.price}</td>
                    <td className="p-4 text-center text-[#555]">× {item.quantity}</td>
                    <td className="p-4 text-right font-medium text-[#333]">{item.total}</td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>

        {/* Totals Section */}
        <div className="bg-[#fcfcfc] p-6 border-t border-[#e0e0e0]">
            <div className="flex justify-end">
                <div className="w-full md:w-1/3 space-y-3">
                    <div className="flex justify-between text-[#555]">
                        <span>Subtotal:</span>
                        <span>{order.subtotal}</span>
                    </div>
                    <div className="flex justify-between text-[#555]">
                        <span>Shipping:</span>
                        <span>{order.shippingTotal}</span>
                    </div>
                    {/* যদি ট্যাক্স থাকে */}
                    {order.taxTotal !== '0.00' && ( // সাধারণত ফরম্যাটেড স্ট্রিং আসে, তাই চেক করা ভালো
                        <div className="flex justify-between text-[#555]">
                            <span>Tax:</span>
                            <span>{order.taxTotal}</span>
                        </div>
                    )}
                     {/* যদি ডিসকাউন্ট থাকে */}
                     {order.discountTotal !== '0.00' && ( // ভ্যালু চেক করা ভালো
                        <div className="flex justify-between text-[#28a745]">
                            <span>Discount:</span>
                            <span>-{order.discountTotal}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-[#555]">
                        <span>Payment Method:</span>
                        <span>{order.paymentMethod}</span>
                    </div>
                    <div className="border-t border-[#ddd] pt-3 flex justify-between items-center">
                        <span className="font-bold text-xl text-[#333]">Total:</span>
                        <span className="font-bold text-xl text-[#007bff]">{order.total}</span>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Address Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Billing Address */}
        <div className="bg-white p-6 border border-[#e0e0e0] rounded-lg shadow-sm">
            <h2 className="text-lg font-bold text-[#333] mb-4 border-b pb-2">Billing Address</h2>
            <div className="text-[#555] leading-relaxed">
                <p className="font-bold text-[#333]">{order.billing.firstName} {order.billing.lastName}</p>
                <p>{order.billing.address1}</p>
                {order.billing.address2 && <p>{order.billing.address2}</p>}
                <p>{order.billing.city}, {order.billing.state} {order.billing.postcode}</p>
                <p>{order.billing.country}</p>
                <div className="mt-4 pt-4 border-t border-[#eee] text-sm">
                    <p><span className="font-semibold">Email:</span> {order.billing.email}</p>
                    <p><span className="font-semibold">Phone:</span> {order.billing.phone}</p>
                </div>
            </div>
        </div>

        {/* Shipping Address */}
        <div className="bg-white p-6 border border-[#e0e0e0] rounded-lg shadow-sm">
            <h2 className="text-lg font-bold text-[#333] mb-4 border-b pb-2">Shipping Address</h2>
            <div className="text-[#555] leading-relaxed">
                <p className="font-bold text-[#333]">{order.shipping.firstName} {order.shipping.lastName}</p>
                <p>{order.shipping.address1}</p>
                {order.shipping.address2 && <p>{order.shipping.address2}</p>}
                <p>{order.shipping.city}, {order.shipping.state} {order.shipping.postcode}</p>
                <p>{order.shipping.country}</p>
            </div>
        </div>
      </div>
    </div>
  );
}