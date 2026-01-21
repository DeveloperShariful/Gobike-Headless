// components/ProgressBar.tsx

'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

export default function ProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // পেজ লোড শেষ হলে বার বন্ধ হবে
  useEffect(() => {
    NProgress.done();
  }, [pathname, searchParams]);

  // লিঙ্কে ক্লিক করলে বার শুরু হবে
  useEffect(() => {
    const handleAnchorClick = (event: MouseEvent) => {
      try {
        const target = (event.target as HTMLElement).closest('a');
        if (!target) return;

        const targetUrl = target.href;
        const targetTarget = target.target;

        // যদি লিঙ্ক না থাকে বা নতুন ট্যাবে (_blank) ওপেন হয়, তাহলে বার দেখাবে না
        if (!targetUrl || targetTarget === '_blank') return;
        
        // যদি Ctrl/Cmd চেপে ক্লিক করা হয় (নতুন ট্যাব), তাহলেও বার দেখাবে না
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;

        const currentUrl = new URL(window.location.href);
        const newUrl = new URL(targetUrl);

        // যদি একই ডোমেইন হয় এবং একই পেজ না হয়, তবেই লোডিং শুরু হবে
        if (newUrl.origin === currentUrl.origin && newUrl.href !== currentUrl.href) {
           NProgress.start();
        }
      } catch (err) {
        // URL পার্সিং এরর ইগনোর করা হচ্ছে
      }
    };

    document.body.addEventListener('click', handleAnchorClick);
    return () => {
      document.body.removeEventListener('click', handleAnchorClick);
    };
  }, []);

  return null;
}