'use client';

import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, ExpressCheckoutElement, useStripe, useElements } from '@stripe/react-stripe-js';
import styles from './PaymentMethods.module.css';
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
interface ExpressCheckoutsProps {
  total: number;
  onOrderPlace: (paymentData: { 
    transaction_id: string; 
    shippingAddress?: Partial<ShippingFormData>; 
  }) => Promise<{ orderId: number; orderKey: string } | void | null>; 
}

const CheckoutForm = ({ onOrderPlace, clientSecret }: { onOrderPlace: ExpressCheckoutsProps['onOrderPlace'], clientSecret: string }) => {
  const stripe = useStripe();
  const elements = useElements(); // এই লাইনটি যোগ করুন

  const onConfirm = async () => {
    // stripe অথবা elements লোড না হলে কিছুই করবেন না
    if (!stripe || !elements) {
      toast.error("Stripe.js has not loaded yet.");
      return;
    }

    // retrievePaymentIntent এর পরিবর্তে confirmPayment ব্যবহার করুন
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {

        return_url: `${window.location.origin}/order-success`,
      },
      redirect: 'if_required',
    });

    if (error) {
      // যদি কোনো তাৎক্ষণিক এরর হয় (যেমন নেটওয়ার্ক সমস্যা)
      toast.error(error.message || 'An unexpected error occurred.');
    } else if (paymentIntent?.status === 'succeeded') {
      // পেমেন্ট সফল হলে!
      toast.success('Payment Successful!');

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
      
      // আপনার সিস্টেমে অর্ডার তৈরি করার জন্য onOrderPlace কল করুন
      await onOrderPlace({ 
        transaction_id: paymentIntent.id,
        shippingAddress: shippingDetails 
      });

    } else if (paymentIntent) {
      // যদি পেমেন্ট অন্য কোনো কারণে ফেইল হয়
      const errorMessage = paymentIntent.last_payment_error?.message || 'Payment failed. Please try another method.';
      toast.error(errorMessage);
    }
  };

  return <ExpressCheckoutElement onConfirm={onConfirm} />;
}
export default function ExpressCheckouts({ total, onOrderPlace }: ExpressCheckoutsProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);

  const [remountKey, setRemountKey] = useState(0);

  useEffect(() => {
    const managePaymentIntent = async () => {
      if (total <= 0) return;

      if (!paymentIntentId) {
        try {
          const res = await fetch('/api/create-payment-intent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: Math.round(total * 100) }),
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
            body: JSON.stringify({ paymentIntentId, amount: total }),
          });
          setRemountKey(prevKey => prevKey + 1);
        } catch (error) {
          console.error("Failed to update Express Payment Intent:", error);
        }
      }
    };

    managePaymentIntent();
  }, [total, paymentIntentId]);

  if (!clientSecret || !stripePromise) {
    return <div className={styles.expressCheckoutLoader}></div>;
  }

  // 👇 START: পরিবর্তন এখানে করা হয়েছে
  const options = {
    clientSecret,
    paymentMethods: {
      googlePay: 'always',
      applePay: 'always',
    },
  };
  // 👆 END: পরিবর্তন শেষ

  return (
    <div className={styles.expressCheckoutContainer}>
      {/* 👇 options অবজেক্টটি এখানে পাস করা হয়েছে */}
      <Elements key={remountKey} options={options} stripe={stripePromise}>
        <CheckoutForm onOrderPlace={onOrderPlace} clientSecret={clientSecret} />
      </Elements>
      <div className={styles.orSeparator}>— OR —</div>
    </div>
  );
}