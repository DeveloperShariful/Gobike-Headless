//app/affiliate/store-credit/page.tsx

import { cookies } from 'next/headers';
import { AUTH_COOKIE_NAME } from '@/lib/constants';
import { GET_AFFILIATE_DASHBOARD } from '@/lib/graphql/affiliateQueries';
import { IoStorefrontOutline, IoWalletOutline } from "react-icons/io5";

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
    return json.data?.affiliateDashboard;
  } catch (error) {
    return null;
  }
}

export default async function StoreCreditPage() {
  const data = await getData();
  const balance = data?.storeCredit || "0.00";

  // বর্তমানে আমাদের API তে "Transactions List" নেই, তাই শুধু ব্যালেন্স দেখাচ্ছি
  // এবং টেবিলটি এম্পটি রাখছি (স্ক্রিনশটের মতো)

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Store Credit</h1>
        <p className="text-gray-500 text-sm">
            Here is where you can see your store credit balance and transactions.
        </p>
      </div>

      {/* Balance Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8 w-full md:w-1/3 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-50 text-yellow-600 rounded-md">
                <IoWalletOutline size={20} />
            </div>
            <h3 className="font-semibold text-gray-700">Total Outstanding</h3>
        </div>
        <p className="text-3xl font-bold text-gray-900 mt-2">${balance}</p>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600">
            You can redeem your store credit at checkout. Simply add products to your cart, and at checkout you will see an option to apply store credit.
        </p>
      </div>

      {/* Transactions Table */}
      <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Past Store Credit Transactions</h2>
          
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                <tr>
                    <th className="px-6 py-4 font-semibold">Amount</th>
                    <th className="px-6 py-4 font-semibold w-1/2">Description</th>
                    <th className="px-6 py-4 font-semibold">Date</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {/* Empty State matching screenshot */}
                    <tr>
                        <td colSpan={3} className="px-6 py-12 text-center text-gray-400">
                            No data to display.
                        </td>
                    </tr>
                </tbody>
            </table>
            </div>
        </div>
      </div>
    </div>
  );
}