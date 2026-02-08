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
      
      // যদি ম্যাচ পাওয়া যায় এবং সেটি বর্তমান পেজ না হয়
      if (match && match !== pathname) {
        setIsRedirecting(true);
        
        // ১ সেকেন্ডের একটি ছোট বিরতি দেওয়া হয়েছে যাতে ইউজার বুঝতে পারে রিডাইরেক্ট হচ্ছে
        // আপনি চাইলে ০ মিলি-সেকেন্ডও করে দিতে পারেন
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
        // রিডাইরেক্ট হওয়ার সময় এই সুন্দর লোডিং মেসেজটি দেখাবে
        <div className="animate-in fade-in duration-500">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-800 uppercase tracking-wider">
            Redirecting to the right page...
          </h2>
          <p className="text-gray-500 mt-2">Please wait a moment.</p>
        </div>
      ) : (
        // যদি কোনো ম্যাচ না পাওয়া যায় তবেই কেবল এই অংশটি দেখাবে
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