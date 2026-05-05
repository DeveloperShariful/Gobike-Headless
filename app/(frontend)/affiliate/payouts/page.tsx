//app/affiliate/payouts/page.tsx

import { cookies } from 'next/headers';
import { AUTH_COOKIE_NAME } from '@/lib/constants';
import { GET_AFFILIATE_DASHBOARD } from '@/lib/graphql/affiliateQueries';

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
    return json.data?.affiliateDashboard?.payouts || [];
  } catch (error) {
    return [];
  }
}

export default async function PayoutsPage() {
  const payouts = await getData();

  return (
    <div className="p-1 md:p-1">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Payouts</h1>
        <p className="text-gray-500 text-sm">History of payments sent to you.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-semibold">ID</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Method</th>
                <th className="px-6 py-4 font-semibold">Amount</th>
                <th className="px-6 py-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payouts.length > 0 ? (
                payouts.map((pay: any) => (
                  <tr key={pay.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-500">#{pay.id}</td>
                    <td className="px-6 py-4 text-gray-800">{new Date(pay.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-gray-600 capitalize">{pay.method || 'Bank Transfer'}</td>
                    <td className="px-6 py-4 text-gray-900 font-bold text-lg">${pay.amount}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                        pay.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {pay.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    No payout history found.
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