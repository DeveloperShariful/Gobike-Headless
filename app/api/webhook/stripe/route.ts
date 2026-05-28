// File: app/api/webhook/stripe/route.ts

import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { wooCommerceRequest } from '@/lib/woocommerce';

export const maxDuration = 60; // Vercel Timeout Extension (Optional but helpful)

// Stripe Initialized
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia" as any,
  typescript: true,
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Helper function to delay execution (if needed for DB sync)
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(request: Request) {
  const body = await request.text();
  const headerList = await headers();
  const sig = headerList.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    // 1. Verify the Webhook Signature
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: any) {
    console.error(`❌ [Stripe Webhook Error] Signature Verification Failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // 2. Handle the 'payment_intent.succeeded' event
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const metadata = paymentIntent.metadata;

    console.log(`💰 [Stripe Webhook] Payment Succeeded for PI: ${paymentIntent.id}`);

    try {
      const orderId = metadata.order_id;

      if (!orderId) {
          console.warn(`⚠️ [Stripe Webhook] No Order ID found in metadata for PI: ${paymentIntent.id}. This is highly unusual for the new architecture.`);
          // (Optionally) You could search WooCommerce by Transaction ID here, but in the new flow, Metadata should always have it.
          return NextResponse.json({ received: true, message: "No Order ID in metadata. Webhook ignoring." });
      }

      console.log(`🔍 [Stripe Webhook] Verifying status for Order #${orderId}...`);

      // 3. Fetch current order status from WooCommerce
      const currentOrder = await wooCommerceRequest<any>(`orders/${orderId}`, "GET");

      if (!currentOrder) {
          console.error(`❌ [Stripe Webhook] Order #${orderId} not found in WooCommerce!`);
          return NextResponse.json({ received: true, error: "Order not found in WC" });
      }

      // 4. Check if Frontend already processed it
      if (currentOrder.status === 'processing' || currentOrder.status === 'completed') {
          console.log(`✅ [Stripe Webhook] Order #${orderId} is already marked as ${currentOrder.status} (Frontend was faster).`);
          return NextResponse.json({ received: true, message: "Already processed by frontend" });
      }

      // 5. The Safety Net: Frontend failed, Webhook steps in
      console.warn(`⏳ [Stripe Webhook] Frontend missed the capture for Order #${orderId}. Webhook is capturing now...`);

      // We wait 3 seconds just to make absolutely sure the frontend isn't currently mid-update to avoid DB locking
      await sleep(3000); 

      // 6. Update Order Status to Processing
      const orderUpdateData = {
          status: 'processing',
          set_paid: true,
          transaction_id: paymentIntent.id,
          meta_data: [
              { key: '_stripe_capture_time', value: new Date().toISOString() },
              { key: '_webhook_rescued', value: 'yes' } // Marker for you to know Webhook did the job
          ]
      };

      await wooCommerceRequest(`orders/${orderId}`, 'PUT', orderUpdateData);

      console.log(`🎉 [Stripe Webhook] Rescue Successful! Order #${orderId} updated to processing via Webhook.`);

    } catch (error: any) {
      console.error("❌ [Stripe Webhook Critical Error]:", error.message);
      return NextResponse.json({ error: "Failed to process webhook" }, { status: 500 });
    }
  }

  // Return a 200 response to acknowledge receipt of the event
  return NextResponse.json({ received: true });
}