//app/(backend)/admin/page.tsx

import { MdPendingActions, MdCheckCircle, MdAssignment } from 'react-icons/md';
import { db } from '@/lib/prisma'; // ডাটাবেস কানেকশন
import Link from 'next/link';

// ড্যাশবোর্ড সবসময় ফ্রেশ ডেটা দেখাবে
export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  
  // ডাটাবেস থেকে রিয়েল-টাইম কাউন্ট নিয়ে আসা হচ্ছে (TRASHED বাদে)
  const totalClaims = await db.warrantyClaim.count({ where: { status: { not: 'TRASHED' } } });
  const pendingClaims = await db.warrantyClaim.count({ where: { status: 'PENDING' } });
  const approvedClaims = await db.warrantyClaim.count({ where: { status: 'APPROVED' } });

  // Recent Activity এর জন্য সর্বশেষ ৫টি ক্লেম আনা হচ্ছে
  const recentClaims = await db.warrantyClaim.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, status: true, createdAt: true }, // শুধু প্রয়োজনীয় ডেটা আনা হচ্ছে স্পিডের জন্য
  });

  return (
    <div className="max-w-[1200px]">
      
      {/* Page Header (WordPress Style) */}
      <div className="mb-6">
        <h1 className="text-[23px] font-normal text-[#1d2327]">Dashboard</h1>
      </div>

      {/* Welcome Message (WordPress Style Notice) */}
      <div className="bg-white border-l-4 border-[#2271b1] p-4 mb-6 shadow-sm">
        <h2 className="text-[16px] font-semibold text-[#1d2327] mb-1">Welcome to GoBike Support Dashboard!</h2>
        <p className="text-[13px] text-[#50575e]">
          We’ve assembled some links to get you started. Check your pending warranty claims to keep the customers happy.
        </p>
      </div>

      {/* At a Glance (Stats Cards) */}
      <h2 className="text-[14px] font-semibold text-[#1d2327] mb-3">At a Glance (Warranty Claims)</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        
        {/* Total Claims Card */}
        <Link href="/admin/warranty-claims" className="bg-white border border-[#c3c4c7] p-4 shadow-sm flex items-center gap-4 hover:border-[#2271b1] hover:shadow-md transition-all group">
          <div className="p-3 bg-gray-50 text-gray-500 rounded-full group-hover:bg-[#f0f6fc] group-hover:text-[#2271b1] transition-colors">
            <MdAssignment className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[20px] font-semibold text-[#2271b1]">{totalClaims}</p>
            <p className="text-[13px] text-[#50575e]">Total Claims</p>
          </div>
        </Link>

        {/* Pending Claims Card (Action Needed) */}
        <Link href="/admin/warranty-claims?status=PENDING" className="bg-white border border-[#c3c4c7] p-4 shadow-sm flex items-center gap-4 border-l-4 border-l-orange-400 hover:border-[#2271b1] hover:shadow-md transition-all group">
          <div className="p-3 bg-orange-50 text-orange-500 rounded-full group-hover:bg-orange-100 transition-colors">
            <MdPendingActions className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[20px] font-semibold text-[#2271b1]">{pendingClaims}</p>
            <p className="text-[13px] text-[#50575e]">Pending (Action Needed)</p>
          </div>
        </Link>

        {/* Approved Claims Card */}
        <Link href="/admin/warranty-claims?status=APPROVED" className="bg-white border border-[#c3c4c7] p-4 shadow-sm flex items-center gap-4 border-l-4 border-l-green-500 hover:border-[#2271b1] hover:shadow-md transition-all group">
          <div className="p-3 bg-green-50 text-green-500 rounded-full group-hover:bg-green-100 transition-colors">
            <MdCheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[20px] font-semibold text-[#2271b1]">{approvedClaims}</p>
            <p className="text-[13px] text-[#50575e]">Approved & Shipped</p>
          </div>
        </Link>

      </div>

      {/* Quick Activity Box (WordPress Metabox Style) */}
      <div className="bg-white border border-[#c3c4c7] shadow-sm max-w-2xl">
        <h2 className="px-4 py-2 border-b border-[#c3c4c7] text-[14px] font-semibold text-[#1d2327] bg-[#f6f7f7]">
          Recent Activity
        </h2>
        <div className="p-0">
          {recentClaims.length === 0 ? (
            <p className="text-[13px] text-[#50575e] italic p-4">
              Waiting for new warranty claims to be submitted...
            </p>
          ) : (
            <ul className="divide-y divide-[#f0f0f1]">
              {recentClaims.map((claim) => (
                <li key={claim.id} className="p-3 hover:bg-[#f6f7f7] transition-colors flex justify-between items-center text-[13px]">
                  <div>
                    <span className="text-[#8c8f94] mr-2">
                      {new Date(claim.createdAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}, {new Date(claim.createdAt).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <Link href={`/admin/warranty-claims/${claim.id}`} className="text-[#2271b1] font-semibold hover:underline">
                      {claim.name}
                    </Link> submitted a new warranty claim.
                  </div>
                  
                  {/* Status Badge */}
                  <div>
                    {claim.status === 'PENDING' && <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-[11px] font-bold">Pending</span>}
                    {claim.status === 'APPROVED' && <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[11px] font-bold">Approved</span>}
                    {claim.status === 'REJECTED' && <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded text-[11px] font-bold">Rejected</span>}
                  </div>
                </li>
              ))}
            </ul>
          )}
          
          {/* View All Link */}
          {recentClaims.length > 0 && (
            <div className="p-3 border-t border-[#f0f0f1] text-[13px]">
              <Link href="/admin/warranty-claims" className="text-[#2271b1] hover:underline">
                View all claims →
              </Link>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}