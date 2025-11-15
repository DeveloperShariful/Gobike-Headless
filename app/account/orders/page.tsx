//app/account/orders/page.tsx

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import styles from './orders.module.css';

type Order = {
  databaseId: string;
  orderNumber: number;
  date: string;
  status: string;
  total: string;
};

const GET_CUSTOMER_ORDERS_QUERY = `
query GetCustomerOrders {
  customer {
    orders(first: 50) {
      nodes {
        databaseId
        orderNumber
        date
        status
        total
      }
    }
  }
}
`;

async function getCustomerOrders(authToken: string): Promise<Order[] | null> {
  const endpoint = process.env.WORDPRESS_GRAPHQL_ENDPOINT;
  if (!endpoint) throw new Error('GraphQL endpoint is not set.');

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({ query: GET_CUSTOMER_ORDERS_QUERY }),
      cache: 'no-store',
    });
    const data = await response.json();
    if (data.errors) {
      console.error("GraphQL Errors:", data.errors);
      return null;
    }
    return data.data.customer.orders.nodes;
  } catch (error) {
    console.error("Fetch Error:", error);
    return null;
  }
}

function getStatusStyle(status: string) {
  switch (status.toUpperCase()) {
    case 'PROCESSING':
      return styles.statusProcessing;
    case 'COMPLETED':
      return styles.statusCompleted;
    case 'CANCELLED':
    case 'FAILED':
      return styles.statusCancelled;
    case 'ON HOLD':
      return styles.statusOnHold;
    default:
      return '';
  }
}

export default async function AccountOrdersPage() {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('auth-token')?.value;

  if (!authToken) {
    redirect('/login');
  }

  const orders = await getCustomerOrders(authToken);

  if (!orders) {
    return (
      <div>
        <p className={styles.noOrdersMessage}>
          Could not fetch orders. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div>
      {orders.length === 0 ? (
        <div className={styles.noOrdersMessage}>
          <p>You have not placed any orders yet.</p>
          <Link href="/bikes">Browse Bikes</Link>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.ordersTable}>
            <thead>
              <tr>
                <th>Order</th>
                <th>Date</th>
                <th>Status</th>
                <th>Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order: Order) => (
                <tr key={order.databaseId}>
                  <td>
                    <strong>#{order.orderNumber}</strong>
                  </td>
                  <td>{new Date(order.date).toLocaleDateString()}</td>
                  <td>
                    <span className={`${styles.status} ${getStatusStyle(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>{order.total}</td>
                  <td>
                    <Link href={`/account/orders/${order.orderNumber}`} className={styles.viewButton}>
                      View
                    </Link>
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