// app/account/AccountSidebar.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  IoBagHandleOutline, 
  IoLocationOutline, 
  IoSettingsOutline, 
  IoLogOutOutline, 
  IoMenu, 
  IoClose,
  IoSpeedometerOutline,
  IoPersonOutline
} from "react-icons/io5";
import { useAuth } from '@/app/providers/AuthProvider';

export default function AccountSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { logout, user } = useAuth();

  // ইউজার অ্যাফিলিয়েট কিনা চেক করা
  const status = user?.affiliateStatus?.toLowerCase();
  const isAffiliate = status === 'active' || status === 'pending' || status === 'approved';

  // লিংকগুলোর তালিকা
  const navLinks = [
    { name: 'Dashboard', href: '/account', icon: <IoPersonOutline size={20} /> },
    { name: 'My Orders', href: '/account/orders', icon: <IoBagHandleOutline size={20} /> },
    { name: 'Addresses', href: '/account/addresses', icon: <IoLocationOutline size={20} /> },
    { name: 'Account Details', href: '/account/details', icon: <IoSettingsOutline size={20} /> },
  ];

  // মেনু বন্ধ করার ফাংশন (লিংকে ক্লিক করলে অটো বন্ধ হবে)
  const closeMenu = () => setIsOpen(false);

  return (
    <>
      {/* ★★★ মোবাইল টোগল বাটন (শুধুমাত্র মোবাইলে দেখাবে) ★★★ */}
      <div className="lg:hidden mb-6">
        <button 
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 bg-black text-white px-4 py-3 rounded-md w-full font-medium"
        >
          <IoMenu size={24} />
          <span>Account Menu</span>
        </button>
      </div>

      {/* ★★★ সাইডবার কন্টেইনার ★★★ */}
      <div className={`
        fixed inset-y-0 left-0 z-[1002] w-[280px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out p-6
        lg:translate-x-0 lg:static lg:z-auto lg:shadow-none lg:w-full lg:p-0 lg:bg-transparent
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        
        {/* মোবাইল ক্লোজ বাটন */}
        <div className="flex justify-between items-center mb-6 lg:hidden border-b pb-4">
          <span className="text-lg font-bold">My Account</span>
          <button onClick={closeMenu} className="p-2 text-gray-600">
            <IoClose size={28} />
          </button>
        </div>

        {/* নেভিগেশন লিংকস */}
        <nav className="flex flex-col gap-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                  isActive 
                    ? 'bg-black text-white font-medium' 
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-100'
                }`}
              >
                {link.icon}
                {link.name}
              </Link>
            );
          })}

          {/* অ্যাফিলিয়েট লিংক (কন্ডিশনাল) */}
          {isAffiliate && (
            <Link
              href="/affiliate/dashboard"
              onClick={closeMenu}
              className="flex items-center gap-3 px-4 py-3 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100 mt-2 font-medium"
            >
              <IoSpeedometerOutline size={20} />
              Affiliate Portal
            </Link>
          )}

          {/* লগআউট বাটন */}
          <button
            onClick={() => {
              closeMenu();
              logout();
            }}
            className="flex items-center gap-3 px-4 py-3 rounded-md bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 mt-4 font-medium text-left w-full"
          >
            <IoLogOutOutline size={20} />
            Logout
          </button>
        </nav>
      </div>

      {/* ★★★ ব্যাকগ্রাউন্ড ওভারলে (শুধুমাত্র মোবাইলে মেনু ওপেন থাকলে) ★★★ */}
      {isOpen && (
        <div 
          onClick={closeMenu}
          className="fixed inset-0 bg-black/50 z-[1001] lg:hidden"
        />
      )}
    </>
  );
}