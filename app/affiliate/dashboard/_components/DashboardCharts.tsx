//app/affiliate/dashboard/_components/DashboardCharts.tsx

'use client';

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

type ChartData = {
  date: string;
  value: number;
};

export default function DashboardCharts({ 
  visitsData, 
  referralsData 
}: { 
  visitsData: ChartData[]; 
  referralsData: ChartData[]; 
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-5">
      
      {/* Visits Chart */}
      <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
        <h3 className="text-gray-600 font-medium mb-1">Visits — Daily last 7 days</h3>
        <div className="h-[300px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={visitsData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#9ca3af', fontSize: 12 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#9ca3af', fontSize: 12 }} 
              />
              <Tooltip 
                cursor={{ fill: '#f3f4f6' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="value" fill="#c084fc" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Referrals Chart */}
      <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
        <h3 className="text-gray-600 font-medium mb-1">Referrals — Daily last 7 days</h3>
        <div className="h-[300px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={referralsData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#9ca3af', fontSize: 12 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#9ca3af', fontSize: 12 }} 
              />
              <Tooltip 
                 cursor={{ fill: '#f3f4f6' }}
                 contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="value" fill="#2dd4bf" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}