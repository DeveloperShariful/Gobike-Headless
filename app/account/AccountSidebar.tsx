// app/account/AccountSidebar.tsx
'use client'; // এটি ক্লায়েন্ট কম্পোনেন্ট থাকবে

import Link from 'next/link';
import { usePathname } from 'next/navigation'; 
import styles from './layout.module.css';

const navLinks = [
  { href: '/account', name: 'Dashboard' },
  { href: '/account/orders', name: 'Orders' },
  { href: '/account/addresses', name: 'Addresses' },
  { href: '/account/details', name: 'Account Details' },
];

// ★★★ সমাধান: logoutAction ফাংশনটি prop হিসেবে গ্রহণ করা ★★★
export default function AccountSidebar({ 
  logoutAction 
}: { 
  logoutAction: () => Promise<void>; // সার্ভার অ্যাকশনের টাইপ
}) {
  const pathname = usePathname();

  // ★★★ সমাধান: async function logoutAction() {...} কোডটি এখান থেকে মুছে ফেলা হয়েছে ★★★

  return (
    <aside className={styles.sidebar}>
      <h3>My Account</h3>
      <ul>
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <li key={link.name}>
              <Link 
                href={link.href}
                className={isActive ? styles.active : ''}
              >
                {link.name}
              </Link>
            </li>
          );
        })}

        <li>
          {/* ★★★ সমাধান: prop-টি action হিসেবে ব্যবহার করা ★★★ */}
          <form action={logoutAction}>
            <button type="submit" className={styles.logoutButton}>
              Logout
            </button>
          </form>
        </li>
      </ul>
    </aside>
  );
}