//app/affiliate/coupons/page.tsx

import { cookies } from 'next/headers';
import { AUTH_COOKIE_NAME } from '@/lib/constants';
import { GET_AFFILIATE_DASHBOARD } from '@/lib/graphql/affiliateQueries';
import { IoTicketOutline } from "react-icons/io5";

async function getData() {
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
    return json.data?.affiliateDashboard?.coupons || [];
  } catch (error) {
    return [];
  }
}

export default async function CouponsPage() {
  const coupons = await getData();

  return (
    <div className="p-1 md:p-1">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Coupons</h1>
        <p className="text-gray-500 text-sm">Coupons assigned to your account. Share these to track referrals.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Code</th>
                <th className="px-6 py-4 font-semibold">Discount Amount</th>
                <th className="px-6 py-4 font-semibold">Discount Type</th>
                <th className="px-6 py-4 font-semibold">Usage Count</th>
                <th className="px-6 py-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {coupons.length > 0 ? (
                coupons.map((coupon: any) => (
                  <tr key={coupon.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                            <IoTicketOutline className="text-blue-500" size={18} />
                            <span className="font-mono font-bold text-gray-800 bg-gray-100 px-2 py-1 rounded border border-gray-200">
                                {coupon.code}
                            </span>
                        </div>
                    </td>
                    <td className="px-6 py-4 text-gray-800 font-medium">
                        {coupon.discountType === 'percent' ? `${coupon.amount}%` : `$${coupon.amount}`}
                    </td>
                    <td className="px-6 py-4 text-gray-600 capitalize">
                        {coupon.discountType.replace('_', ' ')}
                    </td>
                    <td className="px-6 py-4 text-gray-800 font-bold pl-10">
                        {coupon.usageCount}
                    </td>
                    <td className="px-6 py-4">
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-bold">Active</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                        <IoTicketOutline size={40} className="mb-2 opacity-50" />
                        <p>No coupons found assigned to your account.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}