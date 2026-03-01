// app/checkout/components/ExpressCheckouts.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, ExpressCheckoutElement, useStripe, useElements } from '@stripe/react-stripe-js';
import toast from 'react-hot-toast';

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY 
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) 
  : null;

interface ShippingFormData {
  firstName: string;
  lastName: string;
  address1: string;
  city: string;
  state: string;
  postcode: string;
  email: string;
  phone: string;
}

// ★★★ পরিবর্তন ১: নতুন প্রপসগুলো ইন্টারফেসে যোগ করা হলো ★★★
interface ShippingRate {
  id: string;
  label: string;
  cost: string;
}

interface ExpressCheckoutsProps {
  total: number;
  onOrderPlace: (paymentData: { 
    transaction_id: string; 
    shippingAddress?: Partial<ShippingFormData>;
    paymentMethodId?: string; 
  }) => Promise<{ orderId: number; orderKey: string } | void | null>;
  isShippingSelected: boolean;
  // নতুন প্রপস
  cartItems: any[];
  customerInfo: Partial<ShippingFormData>;
  selectedShipping: string;
  shippingRates: ShippingRate[];
}

const CheckoutForm = ({ onOrderPlace, clientSecret }: { onOrderPlace: ExpressCheckoutsProps['onOrderPlace'], clientSecret: string }) => {
  const stripe = useStripe();
  const elements = useElements();

  const onConfirm = async () => {
    if (!stripe || !elements) {
      toast.error("Stripe.js has not loaded yet.");
      return;
    }

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: `${window.location.origin}/order-success`,
      },
      redirect: 'if_required',
    });

    if (error) {
      toast.error(error.message || 'An unexpected error occurred.');
    } else if (paymentIntent?.status === 'succeeded') {
      toast.success('Payment Successful!');

      // Apple Pay/Google Pay থেকে পাওয়া আসল শিপিং অ্যাড্রেস
      const stripeAddress = paymentIntent.shipping;
      const names = stripeAddress?.name?.split(' ') || [];
      const shippingDetails = {
        firstName: names[0] || '',
        lastName: names.slice(1).join(' ') || '',
        address1: stripeAddress?.address?.line1 || '',
        city: stripeAddress?.address?.city || '',
        state: stripeAddress?.address?.state || '',
        postcode: stripeAddress?.address?.postal_code || '',
        email: paymentIntent.receipt_email || '', 
      };
      
      await onOrderPlace({ 
        transaction_id: paymentIntent.id,
        shippingAddress: shippingDetails,
        paymentMethodId: 'stripe'
      });

    } else if (paymentIntent) {
      const errorMessage = paymentIntent.last_payment_error?.message || 'Payment failed. Please try another method.';
      toast.error(errorMessage);
    }
  };

  return <ExpressCheckoutElement onConfirm={onConfirm} />;
}

export default function ExpressCheckouts({ 
  total, 
  onOrderPlace, 
  isShippingSelected,
  // ★★★ প্রপসগুলো রিসিভ করা হলো ★★★
  cartItems,
  customerInfo,
  selectedShipping,
  shippingRates
}: ExpressCheckoutsProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [remountKey, setRemountKey] = useState(0);

  // ★★★ পরিবর্তন ২: শিপিং মেথডের বিস্তারিত তথ্য বের করা ★★★
  const selectedRate = shippingRates.find(rate => rate.id === selectedShipping);

  useEffect(() => {
    const managePaymentIntent = async () => {
      if (total <= 0) return;

      // ★★★ পরিবর্তন ৩: মেটাডেটা সহ পेलोড তৈরি করা ★★★
      const metadataInfo = {
        shipping_method_id: selectedShipping || '',
        shipping_method_title: selectedRate?.label || 'Standard Shipping',
        shipping_cost: selectedRate?.cost || '0'
      };

      if (!paymentIntentId) {
        try {
          const res = await fetch('/api/create-payment-intent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              amount: Math.round(total * 100), // Create API expects cents
              cartItems,
              customerInfo,
              metadata: metadataInfo
            }),
          });
          const data = await res.json();
          if (data.clientSecret) {
            setClientSecret(data.clientSecret);
            setPaymentIntentId(data.clientSecret.split('_secret_')[0]);
            setRemountKey(prevKey => prevKey + 1);
          }
        } catch (error) {
          console.error("Failed to create Express Payment Intent:", error);
          toast.error("Could not initialize Express Checkout.");
        }
      } else {
        try {
          await fetch('/api/update-payment-intent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              paymentIntentId, 
              amount: total, // Update API handles the math (* 100) inside
              cartItems,
              customerInfo,
              metadata: metadataInfo
            }),
          });
          setRemountKey(prevKey => prevKey + 1);
        } catch (error) {
          console.error("Failed to update Express Payment Intent:", error);
        }
      }
    };

    managePaymentIntent();
    // ★★★ পরিবর্তন ৪: Dependency array তে প্রয়োজনীয় ভ্যালু যোগ করা হলো ★★★
  },[total, paymentIntentId, selectedShipping, cartItems.length]);

  if (!clientSecret || !stripePromise) {
    return <div className="h-12 w-full bg-[#f0f0f0] rounded-lg animate-pulse"></div>;
  }

  const options = {
    clientSecret,
    paymentMethods: {
      googlePay: 'always',
      applePay: 'always',
    },
    layout: {
      wallets: {
        layout: 'grid', 
      },
    },
  };

  return (
    <div className="w-full relative">
      {!isShippingSelected && (
        <div
          onClick={() => toast.error('Please select a shipping option first.')}
          className="absolute top-0 left-0 w-full h-full z-10 cursor-not-allowed"
        />
      )}
      <Elements key={remountKey} options={options as any} stripe={stripePromise}>
        <CheckoutForm onOrderPlace={onOrderPlace} clientSecret={clientSecret} />
      </Elements>
      <div className="text-center text-[#6b7280] font-medium text-sm mt-2.5">— OR —</div>
    </div>
  );
}