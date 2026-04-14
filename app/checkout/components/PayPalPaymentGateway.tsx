//app/checkout/components/PaypalPaymentGateway.tsx

'use client';

import React, { useRef } from 'react';
import { PayPalButtons } from '@paypal/react-paypal-js';
import toast from 'react-hot-toast';

interface PayPalGatewayProps {
  total: number;
  isPlacingOrder: boolean;
  onPlaceOrder: (paymentData?: any) => void;
  isShippingSelected: boolean;
  cartItems: any[];
  customerInfo: any;
  shippingInfo: any;
  selectedShipping: string;
  shippingRates: any[];
  appliedCoupons: any[];
}

export default function PayPalPaymentGateway({ 
    total, isPlacingOrder, onPlaceOrder, isShippingSelected, cartItems, customerInfo, shippingInfo, selectedShipping, shippingRates, appliedCoupons 
}: PayPalGatewayProps) {
  
  const wcOrderIdRef = useRef<number | null>(null);
  const wcOrderKeyRef = useRef<string | null>(null);

  return (
      <PayPalButtons
        style={{ layout: "vertical", color: 'gold', shape: 'rect', label: 'paypal', height: 48 }}
        disabled={isPlacingOrder || total <= 0 || !isShippingSelected}
        forceReRender={[total]}
        
        // ১. পেমেন্ট উইন্ডো ওপেন হওয়ার আগেই ব্যাকএন্ডে অর্ডার তৈরি
        createOrder={async () => {
          if (!isShippingSelected) {
            toast.error("Please select a shipping method first.");
            throw new Error("Shipping not selected");
          }
          
          toast.loading("Initializing secure payment...", { id: 'paypal-init' });
          
          try {
              const res = await fetch('/api/paypal/create-order', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                      total, cartItems, customerInfo, shippingInfo, 
                      selectedShipping, shippingRates, appliedCoupons
                  })
              });
              
              const data = await res.json();
              toast.dismiss('paypal-init');

              if (!res.ok) throw new Error(data.error || "Failed to create order");
              
              wcOrderIdRef.current = data.wcOrderId;
              wcOrderKeyRef.current = data.wcOrderKey;
              
              return data.id; 
          } catch (err: any) {
              toast.dismiss('paypal-init');
              toast.error(err.message || "Failed to start payment.");
              throw err;
          }
        }}
        
        // ২. পেমেন্ট করার পর ব্যাকএন্ড দিয়ে কনফার্মেশন
        onApprove={async (data) => {
          toast.loading("Verifying payment...", { id: 'paypal-capture' });
          try {
              const res = await fetch('/api/paypal/capture-order', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                      paypalOrderId: data.orderID,
                      wcOrderId: wcOrderIdRef.current
                  })
              });
              
              const captureData = await res.json();
              toast.dismiss('paypal-capture');

              if (captureData.success) {
                  toast.success('Payment successful!');
                  window.location.href = `/order-success?order_id=${wcOrderIdRef.current}&key=${wcOrderKeyRef.current}&clear_cart=true`;
              } else {
                  toast.error(captureData.message || "Payment could not be verified automatically. Check your email.");
              }
          } catch (err) {
              toast.dismiss('paypal-capture');
              toast.error("Network error during verification. We are checking the status.");
              console.error("Capture Catch Error:", err);
          }
        }}
        
        onCancel={() => {
            toast.error("You cancelled the payment.");
        }}

        onError={(err) => {
          toast.dismiss();
          console.error("PayPal transaction failed:", err);
          toast.error("A PayPal error occurred. Please try again.");
        }}
      />
  );
}