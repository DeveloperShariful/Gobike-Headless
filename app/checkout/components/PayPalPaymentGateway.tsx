//app/checkout/components/PaypalPaymentGateway.tsx

'use client';

import React from 'react';
import { PayPalButtons } from '@paypal/react-paypal-js';
import toast from 'react-hot-toast';

interface PayPalGatewayProps {
  total: number;
  isPlacingOrder: boolean;
  onPlaceOrder: (paymentData: { transaction_id: string }) => Promise<{ orderId: number; orderKey: string } | void | null>;
  // ★★★ পরিবর্তন: isShippingSelected prop-টি এখানে যোগ করা হয়েছে ★★★
  isShippingSelected: boolean;
}

// ★★★ পরিবর্তন: props গুলোকে destructure করা হয়েছে ★★★
export default function PayPalPaymentGateway({ total, isPlacingOrder, onPlaceOrder, isShippingSelected }: PayPalGatewayProps) {
  return (
    
      <PayPalButtons
        style={{ layout: "vertical", color: 'gold', shape: 'rect', label: 'paypal', height: 48 }}
        // ★★★ পরিবর্তন: !isShippingSelected শর্তটি এখানে যোগ করা হয়েছে ★★★
        disabled={isPlacingOrder || total <= 0 || !isShippingSelected}
        forceReRender={[total]}
        createOrder={(_, actions) => {
          if (!isShippingSelected) {
            toast.error("Please select a shipping method first.");
            return Promise.reject(new Error("Shipping not selected"));
          }
          return actions.order.create({
            intent: 'CAPTURE',
            purchase_units: [{
              amount: {
                currency_code: "AUD",
                value: total.toFixed(2),
              }
            }]
          });
        }}
        onApprove={async (_, actions) => {
          if (actions.order) {
            const details = await actions.order.capture();
            toast.success('Payment completed!');
            if (details && details.id) {
              await onPlaceOrder({ transaction_id: details.id });
            } else {
              toast.error("Could not verify the transaction. Please contact support.");
            }
            
          } else {
            toast.error("Could not capture the PayPal order.");
          }
        }}
        onError={(err) => {
          console.error("PayPal transaction failed:", err);
          toast.error("A PayPal error occurred. Please try again.");
        }}
      />
    
  );
}