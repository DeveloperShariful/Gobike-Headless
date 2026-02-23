// app/not-found.tsx

'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { findClosestMatch } from '@/lib/fuzzyMatch';
import Link from 'next/link';

export default function NotFound() {
  const pathname = usePathname();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (pathname) {
      const match = findClosestMatch(pathname);
      if (match && match !== pathname) {
        setIsRedirecting(true);
        const timer = setTimeout(() => {
          router.replace(match);
        }, 800); 

        return () => clearTimeout(timer);
      }
    }
  }, [pathname, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] text-center px-4 font-sans bg-white">
      {isRedirecting ? (
        <div className="animate-in fade-in duration-500">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-800 uppercase tracking-wider">
            Redirecting to the right page...
          </h2>
          <p className="text-gray-500 mt-2">Please wait a moment.</p>
        </div>
      ) : (
        <div className="animate-in fade-in zoom-in duration-500">
          <h1 className="text-9xl font-extrabold text-gray-50 tracking-tighter">404</h1>
          <h2 className="text-3xl font-black mt-[-40px] mb-6 text-gray-900">
            OOPS! PAGE NOT FOUND
          </h2>
          <p className="text-gray-500 text-lg mb-8 max-w-md mx-auto">
            Sorry, we couldn&apos;t find the page you&apos;re looking for.
          </p>
          <Link href="/" className="px-10 py-4 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg">
            BACK TO HOME
          </Link>
        </div>
      )}
    </div>
  );
}