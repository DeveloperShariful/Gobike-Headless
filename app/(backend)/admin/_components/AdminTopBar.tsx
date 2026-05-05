//app/(backend)/admin/_components/AdminTopBar.tsx

'use client';

import Link from 'next/link';
import { FaHome, FaUserCircle, FaBars } from 'react-icons/fa';
import { useAuth } from '@/app/providers'; 

export default function AdminTopBar({ toggleSidebar }: { toggleSidebar: () => void }) {
  const { user, logout } = useAuth();

  return (
    <div className="fixed top-0 left-0 right-0 h-[32px] bg-[#1d2327] text-[#c3c4c7] z-50 flex justify-between items-center px-2 sm:px-4 text-[13px]">
      
      <div className="flex items-center h-full">
        {/* Mobile Hamburger Button */}
        <button 
          onClick={toggleSidebar} 
          className="md:hidden text-[#a7aaad] hover:text-white px-3 h-full flex items-center"
        >
          <FaBars className="w-4 h-4" />
        </button>

        <Link 
          href="/" 
          target="_blank" 
          className="flex items-center gap-2 hover:text-[#72aee6] transition-colors h-full px-2"
        >
          <FaHome className="w-4 h-4 text-[#a7aaad]" />
          <span className="hidden sm:inline">GoBike Australia</span>
        </Link>
      </div>

      <div className="flex items-center h-full gap-2">
        <div className="flex items-center gap-2 hover:bg-[#2c3338] h-full px-2 sm:px-3 cursor-pointer transition-colors group">
          <span className="hidden sm:inline">Howdy, {user?.firstName || 'Admin'}</span>
          <FaUserCircle className="w-[18px] h-[18px] text-[#a7aaad] group-hover:text-white" />
        </div>
        
        <button 
          onClick={logout} 
          className="hover:text-red-400 transition-colors h-full px-2 border-l border-[#2c3338] ml-1"
        >
          Log Out
        </button>
      </div>
    </div>
  );
}