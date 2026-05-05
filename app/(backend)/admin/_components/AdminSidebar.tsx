//app/(backend)/admin/_components/AdminSidebar.tsx

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MdDashboard, MdBuild, MdPeople, MdSettings, MdClose } from 'react-icons/md';

export default function AdminSidebar({ isOpen, closeSidebar }: { isOpen: boolean, closeSidebar: () => void }) {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: <MdDashboard className="w-[18px] h-[18px]" /> },
    { name: 'Warranty Claims', path: '/admin/warranty-claims', icon: <MdBuild className="w-[18px] h-[18px]" /> },
    { name: 'Users', path: '/admin/users', icon: <MdPeople className="w-[18px] h-[18px]" /> },
    { name: 'Settings', path: '/admin/settings', icon: <MdSettings className="w-[18px] h-[18px]" /> },
  ];

  return (
    <>
      {/* Mobile Dark Overlay (Background) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={closeSidebar}
        ></div>
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed left-0 top-[32px] w-64 bg-[#1d2327] text-[#c3c4c7] min-h-[calc(100vh-32px)] flex-shrink-0 z-50 overflow-y-auto transform transition-transform duration-300 ease-in-out 
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Mobile Close Button */}
        <div className="md:hidden flex justify-end p-4 border-b border-[#2c3338]">
          <button onClick={closeSidebar} className="text-[#a7aaad] hover:text-white flex items-center gap-2">
            <span className="text-sm">Close</span>
            <MdClose className="w-6 h-6" />
          </button>
        </div>

        <div className="py-2 md:mt-6">
          <ul className="space-y-0.5">
            {menuItems.map((item) => {
              const isActive = item.path === '/admin' ? pathname === '/admin' : pathname.startsWith(item.path);
              
              return (
                <li key={item.name}>
                  <Link
                    href={item.path}
                    onClick={() => closeSidebar()} // মোবাইলে লিংকে ক্লিক করলে মেনু বন্ধ হবে
                    className={`flex items-center gap-3 px-4 py-2 transition-colors duration-150 ${
                      isActive ? 'bg-[#2271b1] text-white font-medium' : 'hover:text-[#72aee6] hover:bg-transparent'
                    }`}
                  >
                    <span className={`${isActive ? 'text-white' : 'text-[#a7aaad]'}`}>{item.icon}</span>
                    <span className="text-[14px]">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>
    </>
  );
}