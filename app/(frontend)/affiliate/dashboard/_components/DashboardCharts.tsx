//app/affiliate/dashboard/_components/DashboardCharts.tsx

'use client';

import { useState, useEffect } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

type ChartProps = {
  visitsData: { date: string; value: number }[];
  referralsData: { date: string; value: number }[];
};

export default function DashboardCharts({ visitsData, referralsData }: ChartProps) {
  // ১. মাউন্ট চেক করার জন্য স্টেট
  const [isMounted, setIsMounted] = useState(false);

  // ২. পেজ ব্রাউজারে লোড হলেই কেবল মাউন্ট হবে
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // ৩. যদি মাউন্ট না হয় (সার্ভার সাইড), তবে লোডিং স্কেলেটন দেখাও (চার্ট রেন্ডার করো না)
  if (!isMounted) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm h-[380px] animate-pulse">
            <div className="h-6 w-1/3 bg-gray-200 rounded mb-4"></div>
            <div className="h-full bg-gray-100 rounded"></div>
        </div>
        <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm h-[380px] animate-pulse">
            <div className="h-6 w-1/3 bg-gray-200 rounded mb-4"></div>
            <div className="h-full bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  // ৪. ব্রাউজারে লোড হওয়ার পর আসল চার্ট দেখাবে
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      
      {/* Visits Chart */}
      <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
        <h3 className="text-gray-700 font-bold mb-4">Visits — Daily last 7 days</h3>
        
        <div className="h-[300px] w-full"> 
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={visitsData}>
              <defs>
                <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#999' }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#999' }} 
                allowDecimals={false}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                cursor={{ stroke: '#8884d8', strokeWidth: 1 }}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#8884d8" 
                fillOpacity={1} 
                fill="url(#colorVisits)" 
                strokeWidth={2}
                name="Visits"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Referrals Chart */}
      <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
        <h3 className="text-gray-700 font-bold mb-4">Referrals — Daily last 7 days</h3>
        
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={referralsData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#999' }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#999' }} 
                allowDecimals={false}
              />
              <Tooltip 
                cursor={{ fill: '#f9fafb' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Bar 
                dataKey="value" 
                fill="#1cc8b6" 
                radius={[4, 4, 0, 0]} 
                barSize={30}
                name="Referrals"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}