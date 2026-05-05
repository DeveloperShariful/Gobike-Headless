//app/affiliate/dashboard/_components/AffiliateSidebar.tsx

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  IoGridOutline, 
  IoCartOutline, 
  IoEyeOutline, 
  IoWalletOutline, 
  IoTicketOutline, 
  IoImagesOutline, 
  IoLinkOutline, 
  IoSettingsOutline, 
  IoDocumentTextOutline, 
  IoStorefrontOutline,
  IoMenu,
  IoClose,
  IoLogOutOutline
} from "react-icons/io5";

export default function AffiliateSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { name: 'Dashboard', href: '/affiliate/dashboard', icon: <IoGridOutline size={20} /> },
    { name: 'Referrals', href: '/affiliate/referrals', icon: <IoCartOutline size={20} /> },
    { name: 'Visits', href: '/affiliate/visits', icon: <IoEyeOutline size={20} /> },
    { name: 'Payouts', href: '/affiliate/payouts', icon: <IoWalletOutline size={20} /> },
    { name: 'Coupons', href: '/affiliate/coupons', icon: <IoTicketOutline size={20} /> },
    { name: 'Creatives', href: '/affiliate/creatives', icon: <IoImagesOutline size={20} /> },
    { name: 'Affiliate Links', href: '/affiliate/links', icon: <IoLinkOutline size={20} /> },
    { name: 'Settings', href: '/affiliate/settings', icon: <IoSettingsOutline size={20} /> },
    { name: 'Landing Pages', href: '/affiliate/landing-pages', icon: <IoDocumentTextOutline size={20} /> },
    { name: 'Store Credit', href: '/affiliate/store-credit', icon: <IoStorefrontOutline size={20} /> },
  ];

  const closeMenu = () => setIsOpen(false);

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="lg:hidden mb-6">
        <button 
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 bg-black text-white px-4 py-3 rounded-md w-full font-medium"
        >
          <IoMenu size={24} />
          <span>Affiliate Menu</span>
        </button>
      </div>

      {/* Sidebar Container */}
      <div className={`
        fixed inset-y-0 left-0 z-[1002] w-[280px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out p-6 border-r border-gray-100
        lg:translate-x-0 lg:static lg:z-auto lg:shadow-none lg:w-full lg:p-0 lg:bg-transparent lg:border-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        
        <div className="flex justify-between items-center mb-8 lg:hidden border-b pb-4">
          <span className="text-lg font-bold">Affiliate Portal</span>
          <button onClick={closeMenu} className="p-2 text-gray-600">
            <IoClose size={28} />
          </button>
        </div>

        <div className="mb-6 hidden lg:block">
           <h2 className="text-xl font-bold text-gray-800">Affiliate Portal</h2>
           <p className="text-xs text-gray-500">Manage your earnings</p>
        </div>

        <nav className="flex flex-col gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className={`flex items-center gap-3 px-4 py-3 rounded-md transition-all font-medium text-sm ${
                  isActive 
                    ? 'bg-black text-white shadow-md' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-black'
                }`}
              >
                {link.icon}
                {link.name}
              </Link>
            );
          })}

          <Link
            href="/account"
            className="flex items-center gap-3 px-4 py-3 rounded-md text-gray-600 hover:bg-gray-50 hover:text-black mt-4 font-medium text-sm border-t border-gray-100"
          >
            <IoLogOutOutline size={20} />
            Back to My Account
          </Link>
        </nav>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          onClick={closeMenu}
          className="fixed inset-0 bg-black/50 z-[1001] lg:hidden"
        />
      )}
    </>
  );
}