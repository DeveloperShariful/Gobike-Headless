// app/order-success/Page.tsx
import { Suspense } from 'react';
import Confirmation from './Confirmation'; // নতুন ক্লায়েন্ট কম্পোনেন্টটি ইমপোর্ট করুন

export default function OrderSuccessPage() {
  return (
    // এটি একটি সার্ভার কম্পোনেন্ট, যা ক্লায়েন্ট কম্পোনেন্ট লোড হওয়ার আগ পর্যন্ত fallback দেখাবে
    <Suspense fallback={
        <div className="max-w-[900px] mx-auto my-12 px-4">
            <div className="flex justify-center items-center h-[200px] text-xl font-medium text-gray-600">
                Loading confirmation...
            </div>
        </div>
    }>
      <Confirmation />
    </Suspense>
  );
}