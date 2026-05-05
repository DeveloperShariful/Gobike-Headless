//app/(backend)/admin/_components/AdminLayoutWrapper.tsx

'use client';

import { useState } from 'react';
import AdminTopBar from './AdminTopBar';
import AdminSidebar from './AdminSidebar';

export default function AdminLayoutWrapper({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f0f0f1] font-sans text-[#3c434a]">
      
      {/* TopBar-এ toggleSidebar ফাংশনটি পাঠানো হলো */}
      <AdminTopBar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex pt-[32px] min-h-screen">
        
        {/* Sidebar-এ ওপেন/ক্লোজ স্টেট পাঠানো হলো */}
        <AdminSidebar isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} />
        
        {/* Main Content Area (Responsive margins) */}
        <main className="flex-1 p-4 sm:p-5 md:ml-64 overflow-auto bg-[#f0f0f1] min-h-screen w-full">
          {children}
        </main>

      </div>
    </div>
  );
}