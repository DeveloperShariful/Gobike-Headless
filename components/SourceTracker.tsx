// components/SourceTracker.tsx

'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Cookies from 'js-cookie';

const SourceTracker = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  useEffect(() => {
    // ---------------------------------------------------------
    // ১. Solid Affiliate Tracking Logic (নতুন যুক্ত করা হয়েছে)
    // ---------------------------------------------------------
    // ইউআরএল এ 'sld' প্যারামিটার আছে কিনা চেক করা হচ্ছে
    const affiliateId = searchParams.get('sld');
    
    if (affiliateId) {
      // যদি থাকে, কুকিতে সেভ করা হচ্ছে (৩০ দিনের জন্য)
      // এই আইডি পরবর্তীতে চেকআউট পেজে ব্যবহার করা হবে
      Cookies.set('solid_affiliate_id', affiliateId, { expires: 30, path: '/' });
    }

    // ---------------------------------------------------------
    // ২. Visitor Source Tracking Logic (আপনার আগের কোড)
    // ---------------------------------------------------------
    
    // যদি ভিজিটর সোর্স আগেই সেট করা থাকে, তাহলে নিচের লজিক রান করার দরকার নেই
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
    Cookies.set('visitor_source', source, { expires: 30, path: '/' });

  }, [searchParams]);

  // ---------------------------------------------------------
  // ৩. Page View Tracking Logic (আপনার আগের কোড)
  // ---------------------------------------------------------
  useEffect(() => {
    let count = parseInt(sessionStorage.getItem('pageViews') || '0', 10);
    count++;
    sessionStorage.setItem('pageViews', count.toString());

    Cookies.set('visitor_page_views', count.toString(), { path: '/' });
    
  }, [pathname]);

  return null;
};

export default SourceTracker;