// File: app/api/webhook/stripe/route.ts

import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia" as any,
  typescript: true,
});

const api = new WooCommerceRestApi({
  url: process.env.NEXT_PUBLIC_WORDPRESS_URL!,
  consumerKey: process.env.WC_CONSUMER_KEY!,
  consumerSecret: process.env.WC_CONSUMER_SECRET!,
  version: "wc/v3"
});

// স্ট্রাইপ ওয়েবহুক সিক্রেট (Stripe Dashboard -> Developers -> Webhooks থেকে পাবেন)
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  const body = await request.text();
  const headerList = await headers();
  const sig = headerList.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: any) {
    console.error(`Webhook Signature Verification Failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // পেমেন্ট সফল হলে এই ব্লকটি রান করবে
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const metadata = paymentIntent.metadata;

    console.log(`💰 Payment succeeded for PI: ${paymentIntent.id}`);

    try {
      // ১. চেক করা যাক এই পেমেন্ট আইডি দিয়ে ইতিমধ্যে অর্ডার আছে কি না
      // WooCommerce এ সার্চ করছি transaction_id দিয়ে
      // (দ্রষ্টব্য: আপনার WooCommerce এ সার্চ করার জন্য এটি কাস্টম কোয়েরি বা লুপ হতে পারে, 
      // তবে এখানে আমরা সরাসরি অর্ডার তৈরির চেষ্টা করব এবং ডুপ্লিকেট হ্যান্ডেল করব)
      
      // ডুপ্লিকেট চেক করার একটি সহজ উপায় হলো মেটাডেটা চেক করা
      // যদি ফ্রন্টএন্ড থেকে অর্ডার হয়ে থাকে, আমরা ধরে নিচ্ছি সেখানে order_id সেট করা ছিল
      if (metadata.order_id) {
          console.log(`✅ Order #${metadata.order_id} already exists (handled by Frontend). Updating status...`);
          
          // অর্ডার স্ট্যাটাস প্রসেসিং করে দেওয়া (যদি না হয়ে থাকে)
          await api.put(`orders/${metadata.order_id}`, {
              status: 'processing',
              set_paid: true,
              transaction_id: paymentIntent.id
          });
          
          return NextResponse.json({ received: true, message: "Order updated" });
      }

      // ২. যদি order_id না থাকে, তার মানে ফ্রন্টএন্ড ফেইল করেছে। এখন Webhook অর্ডার বানাবে।
      console.warn(`⚠️ No Order ID found in metadata. Frontend likely failed. Creating fallback order...`);

      if (!metadata.cart_items_json || !metadata.billing_json) {
          throw new Error("Missing necessary metadata to create fallback order.");
      }

      const cartItems = JSON.parse(metadata.cart_items_json);
      const billingInfo = JSON.parse(metadata.billing_json);
      const shippingInfo = metadata.shipping_json ? JSON.parse(metadata.shipping_json) : billingInfo;

      // WooCommerce অর্ডারের ডেটা তৈরি
      const orderData = {
        payment_method: 'stripe',
        payment_method_title: 'Credit Card (Stripe Fallback)',
        set_paid: true,
        transaction_id: paymentIntent.id,
        status: 'processing',
        billing: {
            first_name: billingInfo.firstName,
            last_name: billingInfo.lastName,
            address_1: billingInfo.address1,
            city: billingInfo.city,
            state: billingInfo.state,
            postcode: billingInfo.postcode,
            country: 'AU',
            email: billingInfo.email || metadata.customer_email,
            phone: billingInfo.phone,
        },
        shipping: {
            first_name: shippingInfo.firstName,
            last_name: shippingInfo.lastName,
            address_1: shippingInfo.address1,
            city: shippingInfo.city,
            state: shippingInfo.state,
            postcode: shippingInfo.postcode,
            country: 'AU',
        },
        line_items: cartItems.map((item: any) => ({
            product_id: item.product_id,
            quantity: item.quantity,
            variation_id: item.variation_id || 0
        })),
        meta_data: [
            { key: '_is_webhook_created', value: 'yes' }, // ডিবাগিং এর জন্য
            { key: 'stripe_payment_intent', value: paymentIntent.id }
        ]
      };

      // ৩. নতুন অর্ডার তৈরি করা
      const response = await api.post("orders", orderData);
      const newOrder = response.data;

      console.log(`🎉 Fallback Order Created Successfully: #${newOrder.id}`);

      // ৪. স্ট্রাইপে ফিরে গিয়ে মেটাডেটা আপডেট করে দেওয়া (যাতে ভবিষ্যতে ডুপ্লিকেট না হয়)
      await stripe.paymentIntents.update(paymentIntent.id, {
          metadata: {
              order_id: newOrder.id.toString(),
              is_fallback: 'true'
          },
          description: `Order #${newOrder.id} (Created via Webhook)`
      });

    } catch (error: any) {
      console.error("❌ Failed to create fallback order:", error.response?.data || error.message);
      // আমরা এখানে 200 রিটার্ন করছি যাতে স্ট্রাইপ বারবার রিট্রাই না করে, কিন্তু এরর লগ রাখছি
      return NextResponse.json({ error: "Failed to process order" }, { status: 200 });
    }
  }

  return NextResponse.json({ received: true });
}