//app/account/orders/[orderNumber]/page.tsx

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { notFound } from 'next/navigation';
import styles from './order-details.module.css';

type Address = {
  firstName: string;
  lastName: string;
  address1: string;
  address2: string | null;
  city: string;
  state: string | null;
  postcode: string;
  country: string;
  email: string;
  phone: string;
};

type LineItem = {
  quantity: number;
  total: string;
  product: {
    node: {
      name: string;
    };
  };
};

type SingleOrder = {
  databaseId: string;
  orderNumber: number;
  date: string;
  status: string;
  total: string;
  billing: Address;
  shipping: Address;
  lineItems: {
    nodes: LineItem[];
  };
};

const GET_ORDER_DETAILS_QUERY = `
query GetOrderDetails($orderNumber: Int!) {
  customer {
    orders(where: { ordernumber: $orderNumber }) {
      nodes {
        databaseId
        orderNumber
        date
        status
        total
        billing {
          firstName
          lastName
          address1
          address2
          city
          state
          postcode
          country
          email
          phone
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
        lineItems {
          nodes {
            quantity
            total
            product {
              node {
                name
              }
            }
          }
        }
      }
    }
  }
}
`;

async function getOrderDetails(
  authToken: string,
  orderNumber: number
): Promise<SingleOrder | null> {
  const endpoint = process.env.WORDPRESS_GRAPHQL_ENDPOINT;
  if (!endpoint) throw new Error('GraphQL endpoint is not set.');

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        query: GET_ORDER_DETAILS_QUERY,
        variables: { orderNumber: orderNumber },
      }),
      cache: 'no-store',
    });
    const data = await response.json();
    if (data.errors) {
      console.error("GraphQL Errors:", data.errors);
      return null;
    }
    const orders = data.data.customer.orders.nodes;
    return orders && orders.length > 0 ? orders[0] : null;
  } catch (error) {
    console.error("Fetch Error:", error);
    return null;
  }
}

export default async function OrderDetailPage({
  params,
}: {
  params: { orderNumber: string };
}) {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('auth-token')?.value;

  if (!authToken) redirect('/login');

  const orderNumberInt = parseInt(params.orderNumber, 10);
  if (isNaN(orderNumberInt)) notFound();

  const order = await getOrderDetails(authToken, orderNumberInt);
  if (!order) notFound();

  return (
    <div>
      <p className={styles.summary}>
        Order <strong>#{order.orderNumber}</strong> was placed on{' '}
        <strong>{new Date(order.date).toLocaleDateString()}</strong> and is currently{' '}
        <strong>{order.status}</strong>.
      </p>

      <h3 className={styles.title}>Products</h3>
      <table className={styles.productsTable}>
        <thead>
          <tr>
            <th>Product</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {order.lineItems.nodes.map((item, index) => (
            <tr key={index}>
              <td>
                <span className={styles.productName}>{item.product.node.name}</span> &times; {item.quantity}
              </td>
              <td>{item.total}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td><strong>Total:</strong></td>
            <td><strong>{order.total}</strong></td>
          </tr>
        </tfoot>
      </table>

      <div className={styles.addressGrid}>
        <div className={styles.addressBox}>
          <h3>Billing Address</h3>
          <address>
            {order.billing.firstName} {order.billing.lastName}<br />
            {order.billing.address1}
            {order.billing.address2 && <><br />{order.billing.address2}</>}<br />
            {order.billing.city}, {order.billing.state} {order.billing.postcode}<br />
            {order.billing.phone}<br />
            {order.billing.email}
          </address>
        </div>
        <div className={styles.addressBox}>
          <h3>Shipping Address</h3>
          <address>
            {order.shipping.firstName} {order.shipping.lastName}<br />
            {order.shipping.address1}
            {order.shipping.address2 && <><br />{order.shipping.address2}</>}<br />
            {order.shipping.city}, {order.shipping.state} {order.shipping.postcode}
          </address>
        </div>
      </div>
    </div>
  );
}