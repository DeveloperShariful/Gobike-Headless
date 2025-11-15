// app/account/AccountSidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './AccountSidebar.module.css';

const navLinks = [
  { href: '/account', name: 'Dashboard' },
  { href: '/account/orders', name: 'Orders' },
  { href: '/account/addresses', name: 'Addresses' },
  { href: '/account/details', name: 'Account Details' },
];

export default function AccountSidebar({
  logoutAction,
}: {
  logoutAction: () => Promise<void>;
}) {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <h3>My Account</h3>
      <ul>
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <li key={link.name}>
              {/* ★★★ সমাধান: className সঠিকভাবে সেট করা হয়েছে ★★★ */}
              <Link
                href={link.href}
                className={`${styles.navLink} ${isActive ? styles.active : ''}`}
              >
                {link.name}
              </Link>
            </li>
          );
        })}

        <li>
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