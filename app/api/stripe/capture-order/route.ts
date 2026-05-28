// app/api/stripe/capture-order/route.ts

import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";

// ১. Stripe ইনিশিয়ালাইজ করা (নিরাপত্তার জন্য লাইভ বা টেস্ট সিক্রেট কী .env থেকে আসবে)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia" as any, 
  typescript: true,
});

// ২. WooCommerce REST API ইনিশিয়ালাইজ করা
const wooCommerceApi = new WooCommerceRestApi({
  url: process.env.NEXT_PUBLIC_WORDPRESS_URL!,
  consumerKey: process.env.WC_CONSUMER_KEY!,
  consumerSecret: process.env.WC_CONSUMER_SECRET!,
  version: "wc/v3"
});

export async function POST(request: Request) {
  try {
    // ফ্রন্টএন্ড থেকে আসা ডেটা রিসিভ করা
    const body = await request.json();
    const { orderId, paymentIntentId } = body;

    // ভ্যালিডেশন: যদি Order ID বা Payment Intent ID না থাকে তবে শুরুতেই ব্লক করে দেওয়া
    if (!orderId || !paymentIntentId) {
      console.error('❌ [Stripe Capture Order] Missing parameters:', body);
      return NextResponse.json(
        { success: false, message: 'Missing required parameters (orderId or paymentIntentId).' }, 
        { status: 400 }
      );
    }

    console.log(`🔍 [Stripe Capture Order] Verifying Payment Intent: ${paymentIntentId} for Order: ${orderId}`);

    // ৩. Stripe থেকে Payment Intent এর লেটেস্ট স্ট্যাটাস আনা
    let paymentIntent;
    try {
      paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (stripeError: any) {
      console.error(`❌ [Stripe Error] Failed to retrieve Payment Intent: ${stripeError.message}`);
      return NextResponse.json(
        { success: false, message: `Stripe Error: ${stripeError.message}` }, 
        { status: 400 }
      );
    }

    // ৪. পেমেন্ট সাকসেস হয়েছে কিনা তা চেক করা
    // 'succeeded' মানে টাকা একাউন্টে ঢুকেছে। 'requires_action' বা 'requires_payment_method' মানে ফেইল করেছে বা আটকে আছে।
    if (paymentIntent.status !== 'succeeded') {
      console.error(`❌ [Stripe Capture Order] Payment not successful. Current Status: ${paymentIntent.status}`);
      return NextResponse.json(
        { success: false, message: `Payment was not successful. Status is '${paymentIntent.status}'.` }, 
        { status: 402 } // 402 Payment Required
      );
    }
    
    // ৫. সিকিউরিটি চেক: Metadata-তে থাকা Order ID এর সাথে ফ্রন্টএন্ডের Order ID মিলছে কিনা যাচাই করা
    const metadataOrderId = paymentIntent.metadata?.order_id;
    
    if (metadataOrderId && String(metadataOrderId) !== String(orderId)) {
        console.error(`🚨 [SECURITY ALERT] Order ID mismatch! Requested: ${orderId}, Metadata: ${metadataOrderId}`);
        return NextResponse.json(
            { success: false, message: 'Security check failed: Order ID mismatch.' }, 
            { status: 403 } // 403 Forbidden
        );
    } else if (!metadataOrderId) {
        console.warn(`⚠️ [Warning] No order_id found in Stripe metadata for PaymentIntent: ${paymentIntentId}. Proceeding carefully...`);
        // যদি মেটাডেটা মিসিং থাকে (খুব রেয়ার কেস), আমরা Order ID দিয়ে WooCommerce-এ চেক করবো অর্ডারটি আসলেই আছে কিনা।
    }

    // ৬. WooCommerce থেকে বর্তমান অর্ডারের স্ট্যাটাস চেক করা (যাতে ডাবল আপডেট না হয়)
    let currentOrder;
    try {
        const { data } = await wooCommerceApi.get(`orders/${orderId}`);
        currentOrder = data;
    } catch (wcError: any) {
        console.error(`❌ [WooCommerce Error] Could not find Order ${orderId}: ${wcError.message}`);
        return NextResponse.json(
            { success: false, message: 'Order not found in the database.' }, 
            { status: 404 }
        );
    }

    // যদি অর্ডারটি আগে থেকেই ওয়েবহুক বা অন্য কোনোভাবে 'processing' বা 'completed' হয়ে থাকে, তবে শুধু সাকসেস রিটার্ন করবো।
    if (currentOrder.status === 'processing' || currentOrder.status === 'completed') {
        console.log(`✅ [Stripe Capture Order] Order ${orderId} is already marked as ${currentOrder.status}. Skipping update.`);
        return NextResponse.json({ success: true, orderId: currentOrder.id, message: 'Already processed' });
    }

    // ৭. 최종 (Final) ধাপ: পেমেন্ট সফল হওয়ায় WooCommerce অর্ডারটি আপডেট করা
    const orderUpdateData = {
      status: 'processing', // পেমেন্ট হয়ে গেছে, এখন প্রসেসিংয়ে যাবে
      transaction_id: paymentIntent.id, // Stripe-এর ট্রানজেকশন আইডি সেভ করে রাখা
      set_paid: true, // এটি অর্ডারটিকে Paid হিসেবে মার্ক করবে
      meta_data: [
          {
              key: '_stripe_capture_time',
              value: new Date().toISOString()
          }
      ]
    };

    console.log(`🔄 [Stripe Capture Order] Updating WooCommerce Order ${orderId} to 'processing'...`);

    try {
        const { data: updatedOrder } = await wooCommerceApi.put(`orders/${orderId}`, orderUpdateData);

        if (updatedOrder && updatedOrder.id) {
            console.log(`🎉 [Stripe Capture Order] Success! Order ${updatedOrder.id} is now 'processing'.`);
            return NextResponse.json({ 
                success: true, 
                orderId: updatedOrder.id 
            });
        } else {
            throw new Error('WooCommerce returned success, but missing Order ID in response.');
        }
    } catch (updateError: any) {
        console.error(`❌ [WooCommerce Update Error] Failed to update Order ${orderId}:`, updateError.response?.data || updateError.message);
        throw new Error('Failed to update WooCommerce order status.');
    }

  } catch (error: unknown) {
    console.error('🔥 [Stripe Capture Order Critical Error]:', error);
    const message = error instanceof Error ? error.message : 'An internal server error occurred while capturing the order.';
    return NextResponse.json(
        { success: false, message: message }, 
        { status: 500 }
    );
  }
}