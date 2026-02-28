// File: app/api/update-payment-intent/route.ts

import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia" as any, 
  typescript: true,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { paymentIntentId, amount, orderId, cartItems, customerInfo, shippingInfo } = body;

    if (!paymentIntentId) {
      return NextResponse.json({ error: 'Missing Payment Intent ID.' }, { status: 400 });
    }

    const updateData: Stripe.PaymentIntentUpdateParams = {};

    if (amount && typeof amount === 'number' && amount > 0) {
      updateData.amount = Math.round(amount * 100);
    }
    
    // ★★★ নতুন লজিক: মেটাডেটা প্রিপারেশন ★★★
    // স্ট্রাইপ মেটাডেটা শুধু স্ট্রিং সাপোর্ট করে এবং লিমিট আছে। তাই আমরা JSON.stringify করব।
    const metadata: Record<string, string> = {};

    if (orderId) {
      metadata.order_id = orderId.toString();
      updateData.description = `Order #${orderId} for GOBIKE`; 
    }

    // কাস্টমার ইনফো সেভ করা (যদি থাকে)
    if (customerInfo) {
        metadata.customer_email = customerInfo.email || '';
        metadata.customer_name = `${customerInfo.firstName || ''} ${customerInfo.lastName || ''}`.trim();
        metadata.billing_json = JSON.stringify(customerInfo).substring(0, 499); // Limit check
    }

    // শিপিং ইনফো সেভ করা (যদি থাকে)
    if (shippingInfo) {
        metadata.shipping_json = JSON.stringify(shippingInfo).substring(0, 499);
    }

    // কার্ট আইটেম সেভ করা (Webhook যাতে প্রোডাক্ট চিনতে পারে)
    if (cartItems && Array.isArray(cartItems)) {
        // আমরা শুধু আইডি এবং কোয়ান্টিটি রাখব সাইজ কমানোর জন্য
        const simplifiedCart = cartItems.map((item: any) => ({
            product_id: item.databaseId || item.id,
            quantity: item.quantity,
            variation_id: item.variationId || 0 // যদি ভেরিয়েশন থাকে
        }));
        metadata.cart_items_json = JSON.stringify(simplifiedCart).substring(0, 499);
    }

    // মেটাডেটা আপডেট করা
    if (Object.keys(metadata).length > 0) {
        updateData.metadata = metadata;
    }

    // যদি কোনো আপডেট করার ডেটা না থাকে
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: 'No valid data to update.' });
    }
    
    await stripe.paymentIntents.update(paymentIntentId, updateData);
    
    return NextResponse.json({ success: true });

  } catch (error: unknown) {
    console.error("[UPDATE_PAYMENT_INTENT_ERROR]:", error);
    const message = error instanceof Error ? error.message : "Internal server error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}