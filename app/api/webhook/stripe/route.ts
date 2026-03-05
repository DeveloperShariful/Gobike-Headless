// File: app/api/webhook/stripe/route.ts

import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { wooCommerceRequest } from '@/lib/woocommerce';

export const maxDuration = 60; 

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia" as any,
  typescript: true,
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Delay তৈরি করার জন্য Helper Function
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const initialMetadata = paymentIntent.metadata;

    console.log(`💰 Payment succeeded for PI: ${paymentIntent.id}`);

    try {
      // ১. প্রথম চেক: ফ্রন্টএন্ড কি এতো দ্রুত কাজ শেষ করেছে?
      if (initialMetadata.order_id) {
          console.log(`✅ Order #${initialMetadata.order_id} already exists (handled by Frontend instantly). Updating status...`);
          
          await wooCommerceRequest(`orders/${initialMetadata.order_id}`, 'PUT', {
              status: 'processing',
              set_paid: true,
              transaction_id: paymentIntent.id
          });
          
          return NextResponse.json({ received: true, message: "Order updated instantly" });
      }

      // ২. যদি প্রথম চেকে Order ID না পাওয়া যায়, তবে গতির প্রতিযোগিতা (Race Condition) চলছে।
      console.warn(`⏳ No Order ID found immediately. Waiting 8 seconds for frontend to finish...`);
      
      // ৮ সেকেন্ড অপেক্ষা করা হচ্ছে (Delay)
      await sleep(9000);

      // ৩. ৮ সেকেন্ড পর Stripe থেকে লেটেস্ট মেটাডেটা Re-fetch করা
      console.log(`🔄 Re-fetching Payment Intent data from Stripe...`);
      const freshPaymentIntent = await stripe.paymentIntents.retrieve(paymentIntent.id);
      const freshMetadata = freshPaymentIntent.metadata;

      // ৪. দ্বিতীয় চেক: ফ্রন্টএন্ড কি এই ৮ সেকেন্ডের মধ্যে মেটাডেটা আপডেট করেছে?
      if (freshMetadata.order_id) {
          console.log(`✅ Order #${freshMetadata.order_id} found after delay (Frontend won). Updating status...`);
          
          await wooCommerceRequest(`orders/${freshMetadata.order_id}`, 'PUT', {
              status: 'processing',
              set_paid: true,
              transaction_id: paymentIntent.id
          });
          
          return NextResponse.json({ received: true, message: "Order updated after delay" });
      }

      // ৫. ৮ সেকেন্ড পরও যদি Order ID না থাকে, তার মানে ফ্রন্টএন্ড আসলেই ফেইল করেছে (ইউজার ট্যাব কেটে দিয়েছে)।
      console.warn(`⚠️ Frontend officially failed. Creating fallback order via Webhook...`);

      if (!freshMetadata.cart_items_json || !freshMetadata.billing_json) {
          throw new Error("Missing necessary metadata to create fallback order.");
      }

      const cartItems = JSON.parse(freshMetadata.cart_items_json);
      const billingInfo = JSON.parse(freshMetadata.billing_json);
      const shippingInfo = freshMetadata.shipping_json ? JSON.parse(freshMetadata.shipping_json) : billingInfo;
      const shippingMethodId = freshMetadata.shipping_method_id || 'flat_rate';
      const shippingMethodTitle = freshMetadata.shipping_method_title || 'Standard Shipping';
      const shippingCost = freshMetadata.shipping_cost || '0';

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
            email: billingInfo.email || freshMetadata.customer_email,
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
        shipping_lines:[
            {
                method_id: shippingMethodId,
                method_title: shippingMethodTitle,
                total: shippingCost.toString()
            }
        ],
        meta_data:[
            { key: '_is_webhook_created', value: 'yes' }, 
            { key: 'stripe_payment_intent', value: paymentIntent.id }
        ]
      };

      // ৬. Fallback অর্ডার তৈরি করা
      const newOrder = await wooCommerceRequest<any>("orders", "POST", orderData);

      console.log(`🎉 Fallback Order Created Successfully: #${newOrder.id}`);
      
      // ৭. স্ট্রাইপে মেটাডেটা আপডেট করা (যাতে ভবিষ্যতে কনফিউশন না হয়)
      await stripe.paymentIntents.update(paymentIntent.id, {
          metadata: {
              order_id: newOrder.id.toString(),
              is_fallback: 'true'
          },
          description: `Order #${newOrder.id} (Created via Webhook)`
      });

    } catch (error: any) {
      console.error("❌ Failed to process webhook order:", error.message);
      return NextResponse.json({ error: "Failed to process order" }, { status: 200 });
    }
  }

  return NextResponse.json({ received: true });
}