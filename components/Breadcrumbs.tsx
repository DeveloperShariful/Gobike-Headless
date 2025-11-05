'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import styles from './Breadcrumbs.module.css';

interface BreadcrumbsProps {
  pageTitle?: string;
}

const formatBreadcrumb = (str: string) => {
  return str.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export default function Breadcrumbs({ pageTitle }: BreadcrumbsProps) {
  const pathname = usePathname();
  if (pathname === '/') return null;

  const pathSegments = pathname.split('/').filter(segment => segment);

  return (
    <nav aria-label="Breadcrumb" className={styles.breadcrumbNav}>
      <ol className={styles.breadcrumbList}>
        <li className={styles.breadcrumbItem}>
          <Link href="/" className={styles.breadcrumbLink}>Home</Link>
        </li>
        
        {pathSegments.map((segment, index) => {
          const isLast = index === pathSegments.length - 1;
          let href = '/' + pathSegments.slice(0, index + 1).join('/');

          // ★★★ সমাধান: 'product' সেগমেন্টের জন্য লিঙ্ক পরিবর্তন করা হয়েছে ★★★
          // যদি URL-এর অংশ 'product' হয়, তাহলে লিঙ্কটি '/products' করে দাও।
          // আপনার প্রোডাক্ট পেজের লিঙ্ক যদি অন্য কিছু হয় (যেমন /shop), তাহলে সেটি এখানে দিন।
          if (segment === 'product') {
            href = '/products'; 
          }
          // ---------------------------------------------------------------

          let title = formatBreadcrumb(segment);
          if (isLast && pageTitle) {
            title = pageTitle;
          }

          return (
            <li key={segment} className={styles.breadcrumbItem}>
              <span className={styles.separator}>/</span>
              {isLast ? (
                <span className={styles.currentPage}>{title}</span>
              ) : (
                <Link href={href} className={styles.breadcrumbLink}>
                  {title}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}