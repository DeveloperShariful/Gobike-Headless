//app/affiliate/landing-pages/page.tsx

import { cookies } from 'next/headers';
import { AUTH_COOKIE_NAME } from '@/lib/constants';
import { GET_AFFILIATE_DASHBOARD } from '@/lib/graphql/affiliateQueries';
import { IoDocumentTextOutline } from "react-icons/io5";

// বর্তমানে আমাদের API তে স্পেসিফিক "Landing Pages List" নেই, 
// তাই আমরা আপাতত এম্পটি স্টেট দেখাবো যা স্ক্রিনশটের সাথে মিলে যায়।
// ভবিষ্যতে ডাটা আসলে এখানে ম্যাপ করা যাবে।

export default async function LandingPagesPage() {
  return (
    <div className="p-1 md:p-1">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Published Affiliate Landing Pages</h1>
        <p className="text-gray-500 text-sm">
            All the pages listed below are your personal landing pages. Any traffic to these pages will be attributed to you.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-semibold w-1/2">Page URL</th>
                <th className="px-6 py-4 font-semibold">Total Visit Count</th>
                <th className="px-6 py-4 font-semibold">Total Referral Count</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {/* Empty State */}
                <tr>
                  <td colSpan={3} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                        <p className="mb-2">There are no landing pages provided for you.</p>
                        <p className="text-xs text-gray-400">
                            If you would like one, work with the site admin to add one for you.
                        </p>
                    </div>
                  </td>
                </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}