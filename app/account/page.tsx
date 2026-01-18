// app/account/page.tsx

import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AUTH_COOKIE_NAME } from '@/lib/constants';

const GET_VIEWER_BY_KEY_QUERY = `
query GetViewerByKey($key: String) {
  viewerByKey(secretKey: $key) {
    id
    firstName
    lastName
    email
  }
}
`;

async function getViewerData(secretKey: string) {
  const endpoint = process.env.WORDPRESS_GRAPHQL_ENDPOINT;
  if (!endpoint) return null;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        query: GET_VIEWER_BY_KEY_QUERY,
        variables: { 
            key: secretKey 
        }
      }),
      cache: 'no-store',
    });

    const data = await response.json();
    
    if (data.errors) {
      return null;
    }

    if (!data?.data?.viewerByKey) {
      return null;
    }

    return data.data.viewerByKey;

  } catch (error) {
    return null;
  }
}

export default async function AccountDashboardPage() {
  const cookieStore = await cookies();
  const secretKey = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  
  if (!secretKey) {
    redirect('/login');
  }

  const user = await getViewerData(secretKey);

  if (!user) {
    redirect('/api/auth/logout?redirect=/login');
  }

  return (
    <div>
      <p className="text-[1.2rem] text-[#333]">
        Hello, <strong className="font-semibold">{user.firstName || user.email}</strong>!
      </p>
      
      <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6 mt-10">
        <Link href="/account/orders" className="block p-6 border border-[#e0e0e0] rounded-lg no-underline text-inherit bg-[#fafafa] hover:border-[#007bff]">
          <h4 className="m-0 mb-2 text-[1.25rem] text-[#007bff]">My Orders</h4>
          <p className="m-0 text-[1rem] text-[#666]">View your order history</p>
        </Link>
        <Link href="/account/addresses" className="block p-6 border border-[#e0e0e0] rounded-lg no-underline text-inherit bg-[#fafafa] hover:border-[#007bff]">
          <h4 className="m-0 mb-2 text-[1.25rem] text-[#007bff]">My Addresses</h4>
          <p className="m-0 text-[1rem] text-[#666]">Edit billing & shipping info</p>
        </Link>
        <Link href="/account/details" className="block p-6 border border-[#e0e0e0] rounded-lg no-underline text-inherit bg-[#fafafa] hover:border-[#007bff]">
          <h4 className="m-0 mb-2 text-[1.25rem] text-[#007bff]">Account Details</h4>
          <p className="m-0 text-[1rem] text-[#666]">Change your name or password</p>
        </Link>
      </div>
    </div>
  );
}