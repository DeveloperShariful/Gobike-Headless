//app/affiliate/visits/page.tsx

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
    return json.data?.affiliateDashboard?.visits || [];
  } catch (error) {
    return [];
  }
}

export default async function VisitsPage() {
  const visits = await getData();

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Visits</h1>
        <p className="text-gray-500 text-sm">See who is clicking on your links.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-semibold">ID</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Landing Page</th>
                <th className="px-6 py-4 font-semibold">Referrer</th>
                <th className="px-6 py-4 font-semibold">Converted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {visits.length > 0 ? (
                visits.map((visit: any) => (
                  <tr key={visit.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-500">#{visit.id}</td>
                    <td className="px-6 py-4 text-gray-800">{new Date(visit.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-blue-600 max-w-[250px] truncate">
                      <a href={visit.url} target="_blank" className="hover:underline">{visit.url}</a>
                    </td>
                    <td className="px-6 py-4 text-gray-600 max-w-[200px] truncate">
                      {visit.referrer || 'Direct'}
                    </td>
                    <td className="px-6 py-4">
                      {visit.converted ? (
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">YES</span>
                      ) : (
                        <span className="text-gray-400 text-xs">No</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    No visits recorded yet.
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