import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { AUTH_COOKIE_NAME } from '@/lib/constants';
import LinkGenerator from './LinkGenerator';
import AffiliateStats from './AffiliateStats';
import AffiliateApplicationForm from './AffiliateApplicationForm'; // ★★★ নতুন ফর্ম ইমপোর্ট ★★★

// ★★★ আমাদের তৈরি করা নতুন কুয়েরি ★★★
const GET_AFFILIATE_DASHBOARD = `
query GetAffiliateDashboard($key: String) {
  affiliateDashboard(secretKey: $key) {
    affiliateId
    status
    commissionRate
    referralUrl
    totalVisits
    totalReferrals
    totalEarnings
    unpaidEarnings
    referrals {
      id
      amount
      commission
      status
      date
      description
    }
    visits {
      id
      url
      referrer
      converted
      date
    }
    payouts {
        id
        amount
        date
        status
    }
  }
}
`;

async function getAffiliateData(secretKey: string) {
  const endpoint = process.env.WORDPRESS_GRAPHQL_ENDPOINT;
  if (!endpoint) return null;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
          query: GET_AFFILIATE_DASHBOARD,
          variables: { key: secretKey } 
      }),
      cache: 'no-store', // রিয়েল-টাইম ডাটার জন্য ক্যাশ বন্ধ
    });
    
    const data = await response.json();
    return data?.data?.affiliateDashboard || null;
  } catch (error) {
    return null;
  }
}

function getStatusBadge(status: string) {
    const styles: any = {
        paid: 'bg-green-100 text-green-800',
        unpaid: 'bg-yellow-100 text-yellow-800',
        rejected: 'bg-red-100 text-red-800',
        active: 'bg-green-100 text-green-800',
        pending: 'bg-orange-100 text-orange-800'
    };
    return (
        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
            {status}
        </span>
    );
}

export default async function AffiliateDashboardPage() {
  const cookieStore = await cookies();
  const secretKey = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!secretKey) redirect('/login');

  const data = await getAffiliateData(secretKey);

  // ★★★ যদি ইউজার লগইন করা থাকে কিন্তু অ্যাফিলিয়েট না হয় ★★★
  if (!data) {
    return (
      <div className="max-w-3xl mx-auto my-16 px-6">
        <div className="text-center mb-10">
            <h1 className="text-3xl font-bold mb-4 text-[#333]">Become an Affiliate</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
                It looks like you are not registered as an affiliate yet. Join our program to earn commissions by referring customers to GoBike.
            </p>
        </div>

        {/* ★★★ আপডেট: ফর্ম কম্পোনেন্ট বসানো হলো ★★★ */}
        <AffiliateApplicationForm secretKey={secretKey} />

        <div className="mt-10 text-center">
            <Link href="/account" className="text-[#007bff] hover:underline font-medium">
                &larr; Return to My Account
            </Link>
        </div>
      </div>
    );
  }

  // ★★★ যদি অ্যাফিলিয়েট হয়, তাহলে ড্যাশবোর্ড দেখাবে (আগের কোড হুবহু রাখা হয়েছে) ★★★
  return (
    <div className="max-w-[1200px] mx-auto my-8 px-4 md:px-8">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
            <h1 className="text-2xl font-bold text-[#333] mb-1">Affiliate Dashboard</h1>
            <p className="text-sm text-[#666]">
                Status: {getStatusBadge(data.status)} &bull; Rate: <span className="font-bold text-black">{data.commissionRate}</span>
            </p>
        </div>
        <div className="flex gap-3">
             <Link href="/account" className="px-4 py-2 border border-[#ddd] rounded text-sm font-semibold hover:bg-gray-50 transition">
                Back to Account
             </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <AffiliateStats data={data} />

      {/* Link Generator */}
      <LinkGenerator affiliateId={data.affiliateId} referralUrl={data.referralUrl} />

      {/* Recent Referrals & Visits Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Recent Sales/Referrals */}
        <div className="bg-white border border-[#e0e0e0] rounded-lg overflow-hidden shadow-sm">
            <div className="bg-[#f8f9fa] px-6 py-4 border-b border-[#e0e0e0]">
                <h3 className="font-bold text-[#333] m-0 text-base">Recent Referrals</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-white border-b border-[#eee]">
                        <tr>
                            <th className="p-4 font-semibold text-[#555]">Date</th>
                            <th className="p-4 font-semibold text-[#555]">Description</th>
                            <th className="p-4 font-semibold text-[#555]">Amount</th>
                            <th className="p-4 font-semibold text-[#555] text-right">Commission</th>
                            <th className="p-4 font-semibold text-[#555] text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.referrals.length === 0 ? (
                             <tr><td colSpan={5} className="p-6 text-center text-gray-500">No referrals yet.</td></tr>
                        ) : (
                            data.referrals.map((ref: any) => (
                                <tr key={ref.id} className="border-b border-[#f5f5f5] hover:bg-[#fafafa]">
                                    <td className="p-4 text-[#333] whitespace-nowrap">{new Date(ref.date).toLocaleDateString()}</td>
                                    <td className="p-4 text-[#666] max-w-[200px] truncate" title={ref.description}>{ref.description}</td>
                                    <td className="p-4 font-medium text-[#333]">${ref.amount}</td>
                                    <td className="p-4 font-bold text-green-600 text-right">${ref.commission}</td>
                                    <td className="p-4 text-right">{getStatusBadge(ref.status)}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Recent Visits */}
        <div className="bg-white border border-[#e0e0e0] rounded-lg overflow-hidden shadow-sm">
             <div className="bg-[#f8f9fa] px-6 py-4 border-b border-[#e0e0e0]">
                <h3 className="font-bold text-[#333] m-0 text-base">Recent Visits</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-white border-b border-[#eee]">
                        <tr>
                            <th className="p-4 font-semibold text-[#555]">Date</th>
                            <th className="p-4 font-semibold text-[#555]">Source</th>
                            <th className="p-4 font-semibold text-[#555]">Landing Page</th>
                            <th className="p-4 font-semibold text-[#555] text-right">Converted</th>
                        </tr>
                    </thead>
                    <tbody>
                         {data.visits.length === 0 ? (
                             <tr><td colSpan={4} className="p-6 text-center text-gray-500">No visits tracked yet.</td></tr>
                        ) : (
                            data.visits.map((visit: any) => (
                                <tr key={visit.id} className="border-b border-[#f5f5f5] hover:bg-[#fafafa]">
                                    <td className="p-4 text-[#333] whitespace-nowrap">{new Date(visit.date).toLocaleDateString()}</td>
                                    <td className="p-4 text-[#666]">{visit.referrer || 'Direct'}</td>
                                    <td className="p-4 text-[#007bff] truncate max-w-[150px]">
                                        <a href={visit.url} target="_blank" rel="noreferrer">View Page</a>
                                    </td>
                                    <td className="p-4 text-right">
                                        {visit.converted ? (
                                            <span className="text-green-600 font-bold">Yes (Sale)</span>
                                        ) : (
                                            <span className="text-gray-400">No</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>

      </div>
    </div>
  );
}