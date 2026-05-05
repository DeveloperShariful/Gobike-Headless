//app/affiliate/dashboard/page.tsx

import { cookies } from 'next/headers';
import { AUTH_COOKIE_NAME } from '@/lib/constants';
import { GET_AFFILIATE_DASHBOARD } from '@/lib/graphql/affiliateQueries';
import DashboardCharts from './_components/DashboardCharts';
import { IoOpenOutline } from 'react-icons/io5';

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
      cache: 'no-store',
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
      
      {/* 1. Header Info Bar (Mobile Optimized) */}
      <div className="bg-white border-b border-gray-200 p-1 md:p-1 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        
        {/* Left Side: Title & Status */}
        <div className="w-full lg:w-auto">
           <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Affiliate Portal</h1>
           
           <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 text-sm">
              <div className="flex flex-col">
                  <span className="text-gray-500 text-xs uppercase tracking-wider font-bold mb-1">Affiliate Status</span>
                  <span className={`px-2 py-1 rounded text-xs font-bold uppercase w-fit ${data.status === 'active' || data.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {data.status ? data.status : 'Unknown'}
                  </span>
              </div>
              <div className="flex flex-col">
                  <span className="text-gray-500 text-xs uppercase tracking-wider font-bold mb-1">Commission Rate</span>
                  <span className="font-bold text-gray-900 text-base">{data.commissionRate}</span>
              </div>
           </div>
        </div>

        {/* Right Side: ID & Link Box (Full width on mobile) */}
        <div className="w-full lg:w-auto flex flex-col gap-3 bg-gray-50 p-4 rounded-lg border border-gray-100 shadow-sm">
            
            <div className="flex justify-between items-center border-b border-gray-200 pb-2 mb-1">
                <span className="text-gray-500 text-xs uppercase font-bold">Affiliate ID</span>
                <span className="font-mono font-bold text-gray-800 bg-white px-2 py-0.5 rounded border border-gray-200">
                    {data.affiliateId}
                </span>
            </div>

            <div className="flex flex-col">
                <span className="text-gray-500 text-xs uppercase font-bold mb-1">Your Affiliate Link</span>
                <a 
                    href={data.referralUrl} 
                    target="_blank" 
                    className="text-blue-600 hover:text-blue-800 bg-white px-3 py-2 rounded border border-blue-100 flex items-center justify-between gap-2 font-medium text-sm break-all transition-colors hover:border-blue-300"
                >
                    <span className="truncate">{data.referralUrl}</span>
                    <IoOpenOutline size={18} className="flex-shrink-0" />
                </a>
            </div>
        </div>

      </div>

      <div className="p-1 md:p-1">
        
        {/* 2. Stats Title */}
        <div className="mb-5">
            <h2 className="text-xl font-bold text-gray-800">Dashboard Overview</h2>
            <p className="text-gray-500 text-sm">Track your performance and earnings.</p>
        </div>

        {/* 3. Stats Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
            
            <div className="bg-white p-5 border border-gray-200 rounded-lg shadow-sm">
                <p className="text-gray-500 text-xs font-bold uppercase mb-2">Total Referrals</p>
                <p className="text-3xl font-bold text-gray-800">{data.totalReferrals}</p>
            </div>

            <div className="bg-white p-5 border border-gray-200 rounded-lg shadow-sm">
                <p className="text-gray-500 text-xs font-bold uppercase mb-2">Total Visits</p>
                <p className="text-3xl font-bold text-gray-800">{data.totalVisits}</p>
            </div>

            <div className="bg-yellow-50 p-5 border border-yellow-100 rounded-lg shadow-sm">
                <p className="text-yellow-700 text-xs font-bold uppercase mb-2">Unpaid Earnings</p>
                <p className="text-3xl font-bold text-yellow-700">${data.unpaidEarnings}</p>
            </div>

            <div className="bg-green-50 p-5 border border-green-100 rounded-lg shadow-sm">
                <p className="text-green-700 text-xs font-bold uppercase mb-2">Paid Earnings</p>
                <p className="text-3xl font-bold text-green-700">${data.paidEarnings}</p>
            </div>
            
            <div className="bg-blue-50 p-5 border border-blue-100 rounded-lg shadow-sm">
                <p className="text-blue-700 text-xs font-bold uppercase mb-2">Store Credit</p>
                <p className="text-3xl font-bold text-blue-700">${data.storeCredit}</p>
            </div>

        </div>

        {/* 4. Charts Section */}
        <div className="mt-5">
            <DashboardCharts 
                visitsData={data.visitsChart} 
                referralsData={data.referralsChart} 
            />
        </div>

      </div>
    </div>
  );
}