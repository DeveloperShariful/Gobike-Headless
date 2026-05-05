//app/account/orders/page.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { AUTH_COOKIE_NAME } from '@/lib/constants';

type Order = {
  databaseId: string;
  orderNumber: number;
  date: string;
  status: string;
  total: string;
};

const GET_CUSTOMER_ORDERS_QUERY = `
query GetOrdersByKey($key: String) {
  customerOrdersByKey(secretKey: $key) {
    databaseId
    orderNumber
    date
    status
    total
  }
}
`;

async function getCustomerOrders(secretKey: string): Promise<Order[] | null> {
  const endpoint = process.env.WORDPRESS_GRAPHQL_ENDPOINT;
  if (!endpoint) return null;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
          query: GET_CUSTOMER_ORDERS_QUERY,
          variables: { key: secretKey } 
      }),
      cache: 'no-store',
    });
    
    const data = await response.json();
    
    if (data.errors) {
        return null;
    }
    
    return data.data.customerOrdersByKey || [];

  } catch (error) {
    return null;
  }
}

function getStatusStyle(status: string) {
  switch (status.toUpperCase()) {
    case 'PROCESSING': return 'text-[#ffa500]';
    case 'COMPLETED': return 'text-[#28a745]';
    case 'CANCELLED': 
    case 'FAILED': return 'text-[#d9534f]';
    case 'ON HOLD': return 'text-[#007bff]';
    default: return '';
  }
}

export default async function AccountOrdersPage() {
  const cookieStore = await cookies();
  const secretKey = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!secretKey) redirect('/login');

  const orders = await getCustomerOrders(secretKey);

  if (orders === null) {
    redirect('/api/auth/logout?redirect=/login');
  }

  return (
    <div>
      {orders.length === 0 ? (
        <div className="bg-[#f8f9fa] border border-dashed border-[#ccc] rounded-lg p-8 text-center text-[#555] text-[1.1rem]">
          <p>You have not placed any orders yet.</p>
          <Link href="/bikes" className="text-[#007bff] font-semibold no-underline hover:underline">Browse Bikes</Link>
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full border-collapse mb-6 bg-white border border-[#e0e0e0] rounded-lg overflow-hidden">
            <thead>
              <tr>
                <th className="p-4 text-left border-b border-[#e0e0e0] bg-[#f8f9fa] font-bold text-[#333] text-[0.95rem] uppercase">Order</th>
                <th className="p-4 text-left border-b border-[#e0e0e0] bg-[#f8f9fa] font-bold text-[#333] text-[0.95rem] uppercase">Date</th>
                <th className="p-4 text-left border-b border-[#e0e0e0] bg-[#f8f9fa] font-bold text-[#333] text-[0.95rem] uppercase">Status</th>
                <th className="p-4 text-left border-b border-[#e0e0e0] bg-[#f8f9fa] font-bold text-[#333] text-[0.95rem] uppercase">Total</th>
                <th className="p-4 text-left border-b border-[#e0e0e0] bg-[#f8f9fa] font-bold text-[#333] text-[0.95rem] uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order: Order) => (
                <tr key={order.databaseId} className="even:bg-[#fcfdfe] hover:bg-[#f1f8ff]">
                  <td className="p-4 text-left border-b border-[#e0e0e0] text-[#555]"><strong>#{order.orderNumber}</strong></td>
                  <td className="p-4 text-left border-b border-[#e0e0e0] text-[#555]">{new Date(order.date).toLocaleDateString()}</td>
                  <td className="p-4 text-left border-b border-[#e0e0e0] text-[#555]"><span className={`font-semibold ${getStatusStyle(order.status)}`}>{order.status}</span></td>
                  <td className="p-4 text-left border-b border-[#e0e0e0] text-[#555]">{order.total}</td>
                  <td className="p-4 text-left border-b border-[#e0e0e0] text-[#555]">
                    <Link href={`/account/orders/${order.orderNumber}`} className="inline-block py-2 px-4 bg-[#007bff] text-white rounded-[5px] font-semibold text-[0.9rem] hover:bg-[#0056b3]">View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}