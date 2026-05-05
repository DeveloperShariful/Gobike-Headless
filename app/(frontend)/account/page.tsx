// app/account/page.tsx

import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AUTH_COOKIE_NAME } from '@/lib/constants';
import { IoBagHandleOutline, IoLocationOutline, IoSettingsOutline, IoTrendingUpOutline } from "react-icons/io5";

// ★★★ আপডেট: affiliateStatus ফিল্ড যোগ করা হয়েছে ★★★
const GET_VIEWER_BY_KEY_QUERY = `
query GetViewerByKey($key: String) {
  viewerByKey(secretKey: $key) {
    id
    firstName
    lastName
    email
    affiliateStatus
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

  // ★★★ অ্যাফিলিয়েট স্ট্যাটাস চেক ★★★
  const isAffiliate = user.affiliateStatus === 'active' || user.affiliateStatus === 'pending' || user.affiliateStatus === 'approved';

  return (
    <div>
      <p className="text-[1.2rem] text-[#333] mb-8">
        Hello, <strong className="font-semibold">{user.firstName || user.email}</strong>!
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        
        {/* Card 1: Orders */}
        <Link href="/account/orders" className="flex flex-col p-6 border border-[#e0e0e0] rounded-lg no-underline bg-white hover:border-[#007bff] hover:shadow-sm transition-all group">
          <div className="bg-[#e6f2ff] w-12 h-12 rounded-full flex items-center justify-center text-[#007bff] mb-4 group-hover:bg-[#007bff] group-hover:text-white transition-colors">
             <IoBagHandleOutline size={24} />
          </div>
          <h4 className="m-0 mb-2 text-[1.25rem] text-[#333] group-hover:text-[#007bff] transition-colors">My Orders</h4>
          <p className="m-0 text-[0.95rem] text-[#666]">View your order history</p>
        </Link>

        {/* Card 2: Addresses */}
        <Link href="/account/addresses" className="flex flex-col p-6 border border-[#e0e0e0] rounded-lg no-underline bg-white hover:border-[#007bff] hover:shadow-sm transition-all group">
          <div className="bg-[#e6f2ff] w-12 h-12 rounded-full flex items-center justify-center text-[#007bff] mb-4 group-hover:bg-[#007bff] group-hover:text-white transition-colors">
             <IoLocationOutline size={24} />
          </div>
          <h4 className="m-0 mb-2 text-[1.25rem] text-[#333] group-hover:text-[#007bff] transition-colors">My Addresses</h4>
          <p className="m-0 text-[0.95rem] text-[#666]">Edit billing & shipping info</p>
        </Link>

        {/* Card 3: Account Details */}
        <Link href="/account/details" className="flex flex-col p-6 border border-[#e0e0e0] rounded-lg no-underline bg-white hover:border-[#007bff] hover:shadow-sm transition-all group">
          <div className="bg-[#e6f2ff] w-12 h-12 rounded-full flex items-center justify-center text-[#007bff] mb-4 group-hover:bg-[#007bff] group-hover:text-white transition-colors">
             <IoSettingsOutline size={24} />
          </div>
          <h4 className="m-0 mb-2 text-[1.25rem] text-[#333] group-hover:text-[#007bff] transition-colors">Account Details</h4>
          <p className="m-0 text-[0.95rem] text-[#666]">Change your name or password</p>
        </Link>

        {/* ★★★ Card 4: Affiliate Portal (Dynamic) ★★★ */}
        <Link href="/affiliate/dashboard" className="flex flex-col p-6 border border-[#e0e0e0] rounded-lg no-underline bg-white hover:border-[#28a745] hover:shadow-sm transition-all group">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-colors ${isAffiliate ? 'bg-[#d4edda] text-[#155724] group-hover:bg-[#28a745] group-hover:text-white' : 'bg-[#fff3cd] text-[#856404] group-hover:bg-[#ffc107] group-hover:text-[#333]'}`}>
             <IoTrendingUpOutline size={24} />
          </div>
          <h4 className={`m-0 mb-2 text-[1.25rem] text-[#333] transition-colors ${isAffiliate ? 'group-hover:text-[#28a745]' : 'group-hover:text-[#d39e00]'}`}>
             {isAffiliate ? 'Affiliate Portal' : 'Become an Affiliate'}
          </h4>
          <p className="m-0 text-[0.95rem] text-[#666]">
             {isAffiliate ? 'Track sales & earnings' : 'Earn money by referring friends'}
          </p>
        </Link>

      </div>
    </div>
  );
}