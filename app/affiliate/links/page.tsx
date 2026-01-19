//app/affiliate/links/page.tsx

import { cookies } from 'next/headers';
import { AUTH_COOKIE_NAME } from '@/lib/constants';
import { GET_AFFILIATE_DASHBOARD } from '@/lib/graphql/affiliateQueries';
import LinkGenerator from './_components/LinkGenerator';
import { IoLinkOutline } from "react-icons/io5";

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

export default async function AffiliateLinksPage() {
  const data = await getData();

  if (!data) return null;

  return (
    <div className="p-1 md:p-1">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Affiliate Links</h1>
        <p className="text-gray-500 text-sm">Generate and manage your affiliate links.</p>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-8">
         <div className="flex gap-3">
            <div className="mt-1 text-blue-600">
                <IoLinkOutline size={24} />
            </div>
            <div>
                <h3 className="font-bold text-blue-800 text-sm">Your Default Affiliate Link</h3>
                <p className="text-xs text-blue-600 mb-2">
                    Your default Affiliate URL provided by the site admin. Use this to link to the homepage.
                </p>
                <div className="bg-white px-3 py-1.5 rounded border border-blue-200 inline-block font-mono text-sm text-gray-600 select-all">
                    {data.referralUrl}
                </div>
            </div>
         </div>
      </div>

      {/* Generator Component */}
      <LinkGenerator 
        affiliateId={data.affiliateId} 
        referralUrl={data.referralUrl} 
      />

      {/* Custom Slugs (Optional Placeholder - as per screenshot UI) */}
      <div className="mt-8 pt-8 border-t border-gray-100">
         <h3 className="text-lg font-bold text-gray-800 mb-2">Custom Slugs</h3>
         <p className="text-sm text-gray-500 mb-4">
            If enabled by admin, you can create custom slugs for your links (e.g. <code>mysite.com/ref/myname</code>).
         </p>
         
         <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
             <p className="text-gray-400 text-sm italic">You do not have any custom slugs active.</p>
         </div>
      </div>
    </div>
  );
}