'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import styles from './Breadcrumbs.module.css'; // <-- আমরা এই CSS ফাইলটি তৈরি করব

// Slug বা টেক্সটকে সুন্দরভাবে ফরম্যাট করার জন্য একটি Helper ফাংশন
const formatBreadcrumb = (str: string) => {
  return str
    .replace(/-/g, ' ') // হাইফেনকে স্পেস দিয়ে পরিবর্তন করা
    .replace(/\b\w/g, l => l.toUpperCase()); // প্রতিটি শব্দের প্রথম অক্ষর বড় হাতের করা
};

export default function Breadcrumbs() {
  const pathname = usePathname();

  // হোমপেজে কোনো ব্রেডক্রাম্ব দেখানো হবে না
  if (pathname === '/') {
    return null;
  }

  // URL পাথকে সেগমেন্টে ভাগ করা
  const pathSegments = pathname.split('/').filter(segment => segment);

  return (
    <nav aria-label="Breadcrumb" className={styles.breadcrumbNav}>
      <ol className={styles.breadcrumbList}>
        <li className={styles.breadcrumbItem}>
          <Link href="/" className={styles.breadcrumbLink}>Home</Link>
        </li>
        
        {pathSegments.map((segment, index) => {
          const isLast = index === pathSegments.length - 1;
          const href = '/' + pathSegments.slice(0, index + 1).join('/');

          return (
            <li key={segment} className={styles.breadcrumbItem}>
              <span className={styles.separator}>/</span>
              {isLast ? (
                <span className={styles.currentPage}>{formatBreadcrumb(segment)}</span>
              ) : (
                <Link href={href} className={styles.breadcrumbLink}>
                  {formatBreadcrumb(segment)}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}