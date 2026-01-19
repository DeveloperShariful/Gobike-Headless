//app/affiliate/dashboard/page.tsx

import { cookies } from 'next/headers';
import { AUTH_COOKIE_NAME } from '@/lib/constants';
import { GET_AFFILIATE_DASHBOARD } from '@/lib/graphql/affiliateQueries';
import DashboardCharts from './_components/DashboardCharts';
import Link from 'next/link';
import { IoCopyOutline, IoOpenOutline } from 'react-icons/io5';

// Data Fetching Function
async function getDashboardData() {
  const cookieStore = await cookies();
  const secretKey = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const endpoint = process.env.WORDPRESS_GRAPHQL_ENDPOINT;

  if (!secretKey || !endpoint) return null;

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: GET_AFFILIATE_DASHBOARD,
        variables: { secretKey },
      }),
      cache: 'no-store', // Always fresh data
    });

    const json = await res.json();
    return json.data?.affiliateDashboard;
  } catch (error) {
    console.error('Affiliate Dashboard Error:', error);
    return null;
  }
}

export default async function AffiliateDashboardPage() {
  const data = await getDashboardData();

  if (!data) {
    return <div className="p-8 text-center text-red-500">Failed to load dashboard data.</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      
      {/* 1. Header Info Bar (Top Section) */}
      <div className="bg-white border-b border-gray-200 p-2 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-gray-800 mb-4">Affiliate Portal</h1>
           <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
              <div className="flex flex-col">
                  <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold">Affiliate Status</span>
                  <span className={`font-medium ${data.status === 'active' || data.status === 'approved' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {data.status ? data.status.charAt(0).toUpperCase() + data.status.slice(1) : 'Unknown'}
                  </span>
              </div>
              <div className="flex flex-col">
                  <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold">Commission Rate</span>
                  <span className="font-medium text-gray-800">{data.commissionRate}</span>
              </div>
           </div>
        </div>

        <div className="flex flex-col items-start md:items-end text-sm gap-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
            <div className="flex items-center gap-4 justify-between w-full">
                <span className="text-gray-500 text-xs uppercase">Affiliate ID</span>
                <span className="font-bold text-gray-800">{data.affiliateId}</span>
            </div>
            <div className="flex flex-col items-end">
                <span className="text-gray-500 text-xs uppercase mb-1">Your Affiliate Link</span>
                <a href={data.referralUrl} target="_blank" className="text-blue-600 hover:underline flex items-center gap-1 font-medium break-all">
                    {data.referralUrl} <IoOpenOutline />
                </a>
            </div>
        </div>
      </div>

      <div className="p-3 md:p-1">
        
        {/* 2. Stats Title */}
        <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800">Dashboard</h2>
            <p className="text-gray-500 text-sm">Overview of your affiliate performance.</p>
        </div>

        {/* 3. Stats Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            
            {/* Total Referrals */}
            <div className="bg-white p-5 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <p className="text-gray-500 text-xs font-semibold uppercase mb-2">Total Referrals</p>
                <p className="text-3xl font-bold text-gray-800">{data.totalReferrals}</p>
            </div>

            {/* Total Visits */}
            <div className="bg-white p-5 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <p className="text-gray-500 text-xs font-semibold uppercase mb-2">Total Visits</p>
                <p className="text-3xl font-bold text-gray-800">{data.totalVisits}</p>
            </div>

            {/* Unpaid Earnings */}
            <div className="bg-white p-5 border border-yellow-100 bg-yellow-50/50 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <p className="text-yellow-700 text-xs font-semibold uppercase mb-2">Unpaid Earnings</p>
                <p className="text-3xl font-bold text-yellow-700">${data.unpaidEarnings}</p>
            </div>

            {/* Paid Earnings */}
            <div className="bg-white p-5 border border-green-100 bg-green-50/50 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <p className="text-green-700 text-xs font-semibold uppercase mb-2">Paid Earnings</p>
                <p className="text-3xl font-bold text-green-700">${data.paidEarnings}</p>
            </div>
            
            {/* Store Credit (New Feature) */}
            <div className="bg-white p-5 border border-blue-100 bg-blue-50/50 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <p className="text-blue-700 text-xs font-semibold uppercase mb-2">Store Credit</p>
                <p className="text-3xl font-bold text-blue-700">${data.storeCredit}</p>
            </div>

        </div>

        {/* 4. Charts Section (Client Component) */}
        <DashboardCharts 
            visitsData={data.visitsChart} 
            referralsData={data.referralsChart} 
        />

      </div>
    </div>
  );
}