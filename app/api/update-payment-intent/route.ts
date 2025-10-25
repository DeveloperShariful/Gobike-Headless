// app/api/update-payment-intent/route.ts

import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover', 
});

export async function POST(request: Request) {
  try {
    // ★★★ পরিবর্তন: amount এর পাশাপাশি orderId-কেও গ্রহণ করা হচ্ছে ★★★
    const { paymentIntentId, amount, orderId } = await request.json();

    if (!paymentIntentId) {
      return NextResponse.json({ error: 'Missing Payment Intent ID.' }, { status: 400 });
    }

    // ★★★ পরিবর্তন: updateData অবজেক্ট তৈরি এবং শর্তসাপেক্ষে ডেটা যোগ করা হচ্ছে ★★★
    const updateData: Stripe.PaymentIntentUpdateParams = {};

    if (amount && typeof amount === 'number' && amount > 0) {
      updateData.amount = Math.round(amount * 100);
    }
    
    if (orderId) {
      updateData.description = `Order #${orderId} for GOBIKE`;
    }

    // যদি কোনো আপডেট করার ডেটা না থাকে
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid data provided for update.' }, { status: 400 });
    }
    
    await stripe.paymentIntents.update(paymentIntentId, updateData);
    
    return NextResponse.json({ success: true });

  } catch (error: unknown) {
    console.error("[UPDATE_PAYMENT_INTENT_ERROR]:", error);
    const message = error instanceof Error ? error.message : "Internal server error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}