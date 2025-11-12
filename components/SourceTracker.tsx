'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

function setCookie(name: string, value: string, days: number) {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

function getCookie(name: string): string | null {
  const nameEQ = name + "=";
  if (typeof document === 'undefined') {
    return null;
  }
  const ca = document.cookie.split(';');
  for(let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

const SourceTracker = () => {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (getCookie('visitor_source')) {
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
          } else if (referrerHost.includes('facebook.')) {
            source = 'facebook_referral';
          } else if (referrerHost.includes('instagram.')) {
            source = 'instagram_referral';
          } else if (!referrerHost.includes(window.location.hostname)) {
            source = `${referrerHost}_referral`;
          }
        } catch {

        }
      }
    }
    
    setCookie('visitor_source', source, 30);

  }, [searchParams]);

  return null;
};

export default SourceTracker;