// File: app/api/webhook/stripe/route.ts

import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { wooCommerceRequest } from '@/lib/woocommerce';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia" as any,
  typescript: true,
});

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

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const metadata = paymentIntent.metadata;

    console.log(`💰 Payment succeeded for PI: ${paymentIntent.id}`);

    try {

      if (metadata.order_id) {
          console.log(`✅ Order #${metadata.order_id} already exists (handled by Frontend). Updating status...`);
          
          await wooCommerceRequest(`orders/${metadata.order_id}`, 'PUT', {
              status: 'processing',
              set_paid: true,
              transaction_id: paymentIntent.id
          });
          
          return NextResponse.json({ received: true, message: "Order updated" });
      }

      console.warn(`⚠️ No Order ID found in metadata. Frontend likely failed. Creating fallback order...`);

      if (!metadata.cart_items_json || !metadata.billing_json) {
          throw new Error("Missing necessary metadata to create fallback order.");
      }

      const cartItems = JSON.parse(metadata.cart_items_json);
      const billingInfo = JSON.parse(metadata.billing_json);
      const shippingInfo = metadata.shipping_json ? JSON.parse(metadata.shipping_json) : billingInfo;
      const shippingMethodId = metadata.shipping_method_id || 'flat_rate';
      const shippingMethodTitle = metadata.shipping_method_title || 'Standard Shipping';
      const shippingCost = metadata.shipping_cost || '0';

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

      const newOrder = await wooCommerceRequest<any>("orders", "POST", orderData);

      console.log(`🎉 Fallback Order Created Successfully: #${newOrder.id}`);
      
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