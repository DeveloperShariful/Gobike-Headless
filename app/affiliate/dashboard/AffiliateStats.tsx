//app/affiliate/dashboard/AffiliateStats.tsx

import { IoCashOutline, IoPeopleOutline, IoCartOutline, IoWalletOutline } from "react-icons/io5";

export default function AffiliateStats({ data }: { data: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Card 1: Total Earnings */}
      <div className="bg-white p-5 rounded-lg border border-[#e0e0e0] shadow-sm flex items-center gap-4">
        <div className="bg-[#d4edda] p-3 rounded-full text-[#155724]">
            <IoCashOutline size={28} />
        </div>
        <div>
            <p className="text-sm text-[#666] mb-1 font-medium">Total Earnings</p>
            <h3 className="text-2xl font-bold text-[#333] m-0">${data.totalEarnings}</h3>
        </div>
      </div>

      {/* Card 2: Unpaid Earnings */}
      <div className="bg-white p-5 rounded-lg border border-[#e0e0e0] shadow-sm flex items-center gap-4">
        <div className="bg-[#fff3cd] p-3 rounded-full text-[#856404]">
            <IoWalletOutline size={28} />
        </div>
        <div>
            <p className="text-sm text-[#666] mb-1 font-medium">Unpaid / Due</p>
            <h3 className="text-2xl font-bold text-[#333] m-0">${data.unpaidEarnings}</h3>
        </div>
      </div>

      {/* Card 3: Total Sales */}
      <div className="bg-white p-5 rounded-lg border border-[#e0e0e0] shadow-sm flex items-center gap-4">
        <div className="bg-[#d1ecf1] p-3 rounded-full text-[#0c5460]">
            <IoCartOutline size={28} />
        </div>
        <div>
            <p className="text-sm text-[#666] mb-1 font-medium">Total Referrals</p>
            <h3 className="text-2xl font-bold text-[#333] m-0">{data.totalReferrals}</h3>
        </div>
      </div>

      {/* Card 4: Total Visits */}
      <div className="bg-white p-5 rounded-lg border border-[#e0e0e0] shadow-sm flex items-center gap-4">
        <div className="bg-[#e2e3e5] p-3 rounded-full text-[#383d41]">
            <IoPeopleOutline size={28} />
        </div>
        <div>
            <p className="text-sm text-[#666] mb-1 font-medium">Total Visits</p>
            <h3 className="text-2xl font-bold text-[#333] m-0">{data.totalVisits}</h3>
        </div>
      </div>
    </div>
  );
}