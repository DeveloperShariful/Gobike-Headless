// components/ProgressBar.tsx

'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

export default function ProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    NProgress.done();
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleAnchorClick = (event: MouseEvent) => {
      try {
        const target = (event.target as HTMLElement).closest('a');
        if (!target) return;

        const targetUrl = target.href;
        if (!targetUrl) return;

        const currentUrl = new URL(window.location.href);
        const newUrl = new URL(targetUrl);

        if (newUrl.origin === currentUrl.origin && newUrl.pathname !== currentUrl.pathname) {
          const dynamicRoutes = ['/bikes', '/products', '/product/', '/spare-parts', '/checkout', '/cart', '/apparel'];
          if (dynamicRoutes.some(route => newUrl.pathname.startsWith(route))) {
            NProgress.start();
          }
        }
      } catch (err) {
        console.warn("Could not parse URL, ignoring NProgress.", err);
      }
    };
    document.body.addEventListener('click', handleAnchorClick);
    return () => {
      document.body.removeEventListener('click', handleAnchorClick);
    };
  }, []);

  return null;
}