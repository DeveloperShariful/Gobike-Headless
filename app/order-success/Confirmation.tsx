//app/order-success/Comfirmation.tsx
'use client'; 

import { useSearchParams } from 'next/navigation';
import OrderSuccessClient from './OrderSuccessClient';

export default function Confirmation() {
  const searchParams = useSearchParams();
  const order_id = searchParams.get('order_id');
  const key = searchParams.get('key');

  if (!order_id || !key) {
    return (
      // .container replaced
      <div className="max-w-[900px] mx-auto my-12 px-4">
        {/* .errorBox replaced */}
        <div className="bg-[#f8d7da] border border-[#f5c6cb] text-[#721c24] p-8 rounded-lg text-center">
          {/* .errorBox h1 replaced */}
          <h1 className="mt-0 text-2xl font-bold mb-4">Invalid Order Confirmation URL</h1>
          <p className="text-lg">We could not find the order you are looking for. Please check the link or contact our support.</p>
        </div>
      </div>
    );
  }

  return (
    // .container replaced
    <div className="max-w-[900px] mx-auto my-12 px-4">
      <OrderSuccessClient orderId={order_id} orderKey={key} />
    </div>
  );
}