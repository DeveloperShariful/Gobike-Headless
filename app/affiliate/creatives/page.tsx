//app/affiliate/creatives/page.tsx

import { cookies } from 'next/headers';
import { AUTH_COOKIE_NAME } from '@/lib/constants';
import { GET_AFFILIATE_DASHBOARD } from '@/lib/graphql/affiliateQueries';
import { IoImagesOutline, IoCodeSlashOutline } from "react-icons/io5";

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
    return json.data?.affiliateDashboard?.creatives || [];
  } catch (error) {
    return [];
  }
}

export default async function CreativesPage() {
  const creatives = await getData();

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Creatives</h1>
        <p className="text-gray-500 text-sm">Download banners and assets to promote on your website.</p>
      </div>

      {creatives.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {creatives.map((creative: any) => (
            <div key={creative.id} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
              <div className="mb-4 bg-gray-50 border border-gray-100 rounded-lg p-2 flex items-center justify-center min-h-[150px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                    src={creative.image} 
                    alt={creative.name} 
                    className="max-w-full h-auto max-h-[200px] object-contain"
                />
              </div>
              
              <h3 className="font-bold text-gray-800 mb-2">{creative.name}</h3>
              <p className="text-xs text-gray-500 mb-4">{creative.description}</p>
              
              <div className="bg-gray-900 rounded-md p-3">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-400 font-mono flex items-center gap-1">
                        <IoCodeSlashOutline /> HTML Code
                    </span>
                    <span className="text-[10px] text-gray-500">Copy to embed</span>
                </div>
                <textarea 
                    readOnly
                    className="w-full bg-transparent text-gray-300 text-xs font-mono h-20 resize-none focus:outline-none"
                    value={`<a href="${creative.url}"><img src="${creative.image}" alt="${creative.name}"></a>`}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <div className="flex flex-col items-center justify-center text-gray-400">
                <IoImagesOutline size={48} className="mb-3 opacity-50" />
                <p className="text-lg font-medium text-gray-600">No creatives available</p>
                <p className="text-sm">Check back later for marketing assets.</p>
            </div>
        </div>
      )}
    </div>
  );
}