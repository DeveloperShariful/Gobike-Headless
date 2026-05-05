// app/order-success/Page.tsx
import { Suspense } from 'react';
import Confirmation from './Confirmation'; 

export default function OrderSuccessPage() {
  return (
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