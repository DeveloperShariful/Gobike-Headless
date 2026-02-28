// File: app/api/create-payment-intent/route.ts

import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia" as any, 
  typescript: true,
});

export async function POST(request: Request) {
  try {
    // আমরা বডি থেকে cartItems, customerInfo, shippingInfo রিসিভ করব (যদি পাঠানো হয়)
    const { amount, payment_method_types, metadata: incomingMetadata, orderId, cartItems, customerInfo, shippingInfo } = await request.json();

    if (!amount || amount < 1) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const intentOptions: Stripe.PaymentIntentCreateParams = {
      amount,
      currency: 'aud',
    };

    if (payment_method_types) {
      intentOptions.payment_method_types = payment_method_types;
    } else {
      intentOptions.automatic_payment_methods = { enabled: true };
    }
    
    // ★★★ মেটাডেটা প্রসেসিং লজিক (update-payment-intent এর মতো) ★★★
    const metadata: Record<string, string> = { ...incomingMetadata };

    if (orderId) {
      intentOptions.description = `Order #${orderId} for GOBIKE`;
      metadata.order_id = orderId.toString();
    }

    // কাস্টমার ইনফো সেভ (JSON স্ট্রিং হিসেবে)
    if (customerInfo) {
        metadata.customer_email = customerInfo.email || '';
        metadata.customer_name = `${customerInfo.firstName || ''} ${customerInfo.lastName || ''}`.trim();
        metadata.billing_json = JSON.stringify(customerInfo).substring(0, 499); 
    }

    // শিপিং ইনফো সেভ
    if (shippingInfo) {
        metadata.shipping_json = JSON.stringify(shippingInfo).substring(0, 499);
    }

    // কার্ট আইটেম সেভ
    if (cartItems && Array.isArray(cartItems)) {
        const simplifiedCart = cartItems.map((item: any) => ({
            product_id: item.databaseId || item.id,
            quantity: item.quantity,
            variation_id: item.variationId || 0,
            price: item.price
        }));
        metadata.cart_items_json = JSON.stringify(simplifiedCart).substring(0, 499);
    }

    // ফাইনাল মেটাডেটা যোগ করা
    if (Object.keys(metadata).length > 0) {
      intentOptions.metadata = metadata;
    }

    const paymentIntent = await stripe.paymentIntents.create(intentOptions);
    
    return NextResponse.json({ clientSecret: paymentIntent.client_secret });

  } catch (error: unknown) { 
    console.error("[CREATE_PAYMENT_INTENT_ERROR]:", error);
    
    let errorMessage = "An internal server error occurred.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}