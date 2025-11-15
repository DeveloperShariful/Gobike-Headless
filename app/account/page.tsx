// app/account/page.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link'; // ★ Link ইম্পোর্ট করুন
import styles from './dashboard.module.css'; // ★ লোকাল CSS ইম্পোর্ট

// --- GraphQL Query (অপরিবর্তিত) ---
const GET_VIEWER_QUERY = `
query GetViewer {
  viewer {
    id
    firstName
    lastName
    email
  }
}
`;

// --- getViewerData ফাংশন (অপরিবর্তিত) ---
async function getViewerData(authToken: string) {
  const endpoint = process.env.WORDPRESS_GRAPHQL_ENDPOINT;
  if (!endpoint) throw new Error('WORDPRESS_GRAPHQL_ENDPOINT is not set');

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}` 
      },
      body: JSON.stringify({
        query: GET_VIEWER_QUERY,
      }),
      cache: 'no-store',
    });

    const data = await response.json();
    if (data.errors) {
      console.error("GraphQL Errors:", data.errors);
      return null;
    }
    return data.data.viewer;
  } catch (error) {
    console.error("Fetch Error:", error);
    return null;
  }
}

// --- মূল পেজ কম্পোনেন্ট (আপডেট করা হয়েছে) ---
export default async function AccountDashboardPage() {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('auth-token')?.value;

  if (!authToken) {
    redirect('/login');
  }

  const user = await getViewerData(authToken);

  if (!user) {
    console.error("Could not fetch viewer, redirecting to login.");
    redirect('/login'); 
  }

  return (
    <div>
      {/* <h2>Dashboard</h2> - এটি layout.module.css দিয়ে স্টাইল করা হয়েছে */}
      
      {/* ★ নতুন স্টাইল যোগ করা হয়েছে */}
      <p className={styles.welcomeMessage}>
        Hello, <strong>{user.firstName || user.email}</strong>!
      </p>
      <p className={styles.introText}>
        From your account dashboard you can view your recent orders, 
        manage your shipping and billing addresses, 
        and edit your password and account details.
      </p>

      {/* ★ নতুন কুইক লিংক বক্স যোগ করা হয়েছে */}
      <div className={styles.quickLinksGrid}>
        <Link href="/account/orders" className={styles.quickLink}>
          <h4>My Orders</h4>
          <p>View your order history</p>
        </Link>
        <Link href="/account/addresses" className={styles.quickLink}>
          <h4>My Addresses</h4>
          <p>Edit billing & shipping info</p>
        </Link>
        <Link href="/account/details" className={styles.quickLink}>
          <h4>Account Details</h4>
          <p>Change your name or password</p>
        </Link>
      </div>
    </div>
  );
}