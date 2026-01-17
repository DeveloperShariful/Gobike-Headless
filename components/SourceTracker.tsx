// components/SourceTracker.tsx

'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Cookies from 'js-cookie';

const SourceTracker = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  // ডাবল API কল রোধ করার জন্য একটি Ref ব্যবহার করা হলো
  const visitTracked = useRef(false);

  useEffect(() => {
    // ---------------------------------------------------------
    // ১. Solid Affiliate Real Visit Tracking (New API Logic)
    // ---------------------------------------------------------
    const affiliateId = searchParams.get('sld');
    
    // যদি এফিলিয়েট আইডি থাকে এবং এই সেশনে এখনো ট্র্যাক না হয়ে থাকে
    if (affiliateId && !visitTracked.current) {
        
        const trackVisit = async () => {
            try {
                // আমরা ব্যাকএন্ডে একটি কাস্টম এন্ডপয়েন্টে ডেটা পাঠাচ্ছি
                // নোট: এই এন্ডপয়েন্টটি আমরা পরের ধাপে ব্যাকএন্ডে তৈরি করব
                const apiUrl = `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/gobike/v1/track-visit`;
                
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        affiliate_id: affiliateId,
                        url: window.location.href, // ভিজিটর কোন পেজে ল্যান্ড করেছে
                        referrer: document.referrer || '' // ভিজিটর কোথা থেকে এসেছে (Facebook/Google etc.)
                    }),
                });

                const data = await response.json();

                if (data.success && data.visit_id) {
                    // সফল হলে কুকিতে Visit ID এবং Affiliate ID সেভ করা
                    Cookies.set('solid_affiliate_visit_id', data.visit_id.toString(), { expires: 30, path: '/' });
                    Cookies.set('solid_affiliate_id', affiliateId, { expires: 30, path: '/' });
                    
                    // ফ্ল্যাগ সেট করা যাতে বারবার কল না হয়
                    visitTracked.current = true;
                }
            } catch (error) {
                console.error('Affiliate visit tracking failed:', error);
                // ফেইল করলেও অন্তত আইডিটা সেভ রাখা (ব্যাকআপ হিসেবে)
                Cookies.set('solid_affiliate_id', affiliateId, { expires: 30, path: '/' });
            }
        };

        trackVisit();
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