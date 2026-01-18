// app/account/AccountSidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/app/providers/AuthProvider';

const navLinks = [
  { href: '/account', name: 'Dashboard' },
  { href: '/account/orders', name: 'Orders' },
  { href: '/account/addresses', name: 'Addresses' },
  { href: '/account/details', name: 'Account Details' },
];

export default function AccountSidebar() {
  const pathname = usePathname();
  const { logout, isLoading } = useAuth();

  return (
    <aside className="w-full lg:w-[280px] shrink-0 bg-white p-6 lg:p-8 rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
      <h3 className="text-[1.4rem] lg:text-[1.5rem] font-bold mt-0 mb-4 lg:mb-6">My Account</h3>
      <ul className="list-none p-0 m-0">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <li key={link.name} className="mb-2">
              <Link
                href={link.href}
                className={`block py-[0.8rem] px-[1.2rem] no-underline rounded-md transition-colors duration-200 ${
                  isActive 
                    ? 'bg-[#e6f2ff] text-[#007bff] font-semibold' 
                    : 'text-[#333] font-medium hover:bg-[#f0f0f0]'
                }`}
              >
                {link.name}
              </Link>
            </li>
          );
        })}

        <li>
          <button 
            onClick={logout}
            disabled={isLoading}
            className="w-full py-[0.8rem] px-[1.2rem] mt-4 border-none bg-transparent text-[#d9534f] text-left text-[1rem] font-semibold cursor-pointer rounded-md transition-colors duration-200 hover:bg-[#f8d7da] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Logging out...' : 'Logout'}
          </button>
        </li>
      </ul>
    </aside>
  );
}