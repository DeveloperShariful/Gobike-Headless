// components/SourceTracker.tsx

'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Cookies from 'js-cookie';

const SourceTracker = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  // ডাবল API কল রোধ করার জন্য Ref
  const visitTracked = useRef(false);

  useEffect(() => {
    // ---------------------------------------------------------
    // ১. Solid Affiliate Tracking Logic (Fail-Safe & Logging)
    // ---------------------------------------------------------
    const affiliateId = searchParams.get('sld');
    
    if (affiliateId) {
        console.log(`%c[Affiliate] ID Found in URL: ${affiliateId}`, 'color: green; font-weight: bold;');

        // ★★★ CHANGE: API কলের অপেক্ষা না করে আগেই কুকি সেট করা হচ্ছে ★★★
        Cookies.set('solid_affiliate_id', affiliateId, { expires: 30, path: '/' });
        console.log('%c[Affiliate] Cookie "solid_affiliate_id" set immediately.', 'color: blue;');

        // যদি এই সেশনে এখনো API কল না হয়ে থাকে
        if (!visitTracked.current) {
            
            const trackVisit = async () => {
                const apiUrl = `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/gobike/v1/track-visit`;
                console.log(`%c[Affiliate] Calling API for Visit Tracking...`, 'color: orange;', apiUrl);

                try {
                    const response = await fetch(apiUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            affiliate_id: affiliateId,
                            url: window.location.href,
                            referrer: document.referrer || ''
                        }),
                    });

                    console.log('[Affiliate] API Response Status:', response.status);

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    const data = await response.json();
                    console.log('[Affiliate] API Data Received:', data);

                    if (data.success && data.visit_id) {
                        // সফল হলে Visit ID কুকিতে সেভ করা
                        Cookies.set('solid_affiliate_visit_id', data.visit_id.toString(), { expires: 30, path: '/' });
                        console.log(`%c[Affiliate] SUCCESS! Visit ID ${data.visit_id} saved to cookie.`, 'color: green; font-size: 12px; font-weight: bold;');
                        
                        // ফ্ল্যাগ সেট করা যাতে বারবার কল না হয়
                        visitTracked.current = true;
                    } else {
                        console.warn('[Affiliate] API returned success: false or missing visit_id', data);
                    }
                } catch (error) {
                    console.error('%c[Affiliate] Tracking API Failed:', 'color: red; font-weight: bold;', error);
                    // নোট: API ফেইল করলেও সমস্যা নেই, কারণ আমরা শুরুতেই 'solid_affiliate_id' সেভ করেছি।
                }
            };

            trackVisit();
        } else {
            console.log('[Affiliate] API already called in this session, skipping.');
        }
    }

    // ---------------------------------------------------------
    // ২. Visitor Source Tracking Logic (আপনার আগের কোড)
    // ---------------------------------------------------------
    
    if (Cookies.get('visitor_source')) {
      // সোর্স অলরেডি থাকলে রিটার্ন করবে, কিন্তু তার আগে এফিলিয়েট লজিক রান হয়ে গেছে
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