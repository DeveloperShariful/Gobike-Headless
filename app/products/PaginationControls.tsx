// app/products/PaginationControls.tsx
'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
// import styles from './pagination.module.css'; // CSS Module সরানো হয়েছে

interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
}

interface PaginationControlsProps {
  pageInfo: PageInfo;
  basePath: string;
}

export default function PaginationControls({ pageInfo }: PaginationControlsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createNextPageUrl = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('before');
    if (pageInfo.endCursor) {
      params.set('after', pageInfo.endCursor);
    }
    return `${pathname}?${params.toString()}`;
  };

  const createPrevPageUrl = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('after');
    if (pageInfo.startCursor) {
      params.set('before', pageInfo.startCursor);
    }
    return `${pathname}?${params.toString()}`;
  };

  return (
    // .paginationContainer replaced
    <div className="flex justify-center items-center gap-4 mt-10 mb-8">
      {pageInfo.hasPreviousPage ? (
        <Link 
            href={createPrevPageUrl()} 
            // .button replaced
            className="px-6 py-3 border border-gray-200 bg-white rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
        >
          &larr; Previous
        </Link>
      ) : (
        <button 
            className="px-6 py-3 border border-gray-200 bg-white rounded-lg text-gray-400 font-medium cursor-not-allowed opacity-60" 
            disabled
        >
          &larr; Previous
        </button>
      )}

      {pageInfo.hasNextPage ? (
        <Link 
            href={createNextPageUrl()} 
            className="px-6 py-3 border border-gray-200 bg-white rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
        >
          Next &rarr;
        </Link>
      ) : (
        <button 
            className="px-6 py-3 border border-gray-200 bg-white rounded-lg text-gray-400 font-medium cursor-not-allowed opacity-60" 
            disabled
        >
          Next &rarr;
        </button>
      )}
    </div>
  );
}