// SourceTracker.tsx

'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Cookies from 'js-cookie'; // js-cookie ইম্পোর্ট করা হলো

// setCookie এবং getCookie ফাংশন দুটির আর প্রয়োজন নেই

const SourceTracker = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  useEffect(() => {
    // এখন Cookies.get() ব্যবহার করে কুকি চেক করা হচ্ছে
    if (Cookies.get('visitor_source')) {
      return;
    }

    let source = 'direct';
    const utmSource = searchParams.get('utm_source');
    
    if (utmSource) {
      source = utmSource;
    } else {
      const referrer = document.referrer;
      if (referrer) {
        try {
          const referrerHost = new URL(referrer).hostname;
          if (referrerHost.includes('google.')) {
            source = 'google_organic';
          } else if (referrerHost.includes('bing.')) {
            source = 'bing_organic';
          } else if (referrerHost.includes('facebook.') || referrerHost.includes('fb.com')) {
            source = 'facebook';
          } else if (referrerHost.includes('instagram.')) {
            source = 'instagram';
          } else if (!referrerHost.includes(window.location.hostname)) {
            source = `${referrerHost}_referral`;
          }
        } catch {}
      }
    }
    
    // Cookies.set() ব্যবহার করে কুকি সেট করা হচ্ছে
    // { expires: 30 } মানে কুকিটি ৩০ দিন পর্যন্ত থাকবে
    Cookies.set('visitor_source', source, { expires: 30, path: '/' });

  }, [searchParams]);

  useEffect(() => {
    let count = parseInt(sessionStorage.getItem('pageViews') || '0', 10);
    count++;
    sessionStorage.setItem('pageViews', count.toString());

    // সেশন কুকি সেট করার জন্য কোনো expires দিন দেওয়া হয় না
    Cookies.set('visitor_page_views', count.toString(), { path: '/' });
    
  }, [pathname]);

  return null;
};

export default SourceTracker;