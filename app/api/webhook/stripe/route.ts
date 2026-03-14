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
      if (initialMetadata.order_id) {
          console.log(`✅ Order #${initialMetadata.order_id} already exists (handled by Frontend instantly). Updating status...`);
          
          await wooCommerceRequest(`orders/${initialMetadata.order_id}`, 'PUT', {
              status: 'processing',
              set_paid: true,
              transaction_id: paymentIntent.id
          });
          
          return NextResponse.json({ received: true, message: "Order updated instantly" });
      }

      console.warn(`⏳ No Order ID found immediately. Waiting 9 seconds for frontend to finish...`);
      
      await sleep(9000);

      console.log(`🔄 Re-fetching Payment Intent data from Stripe...`);
      const freshPaymentIntent = await stripe.paymentIntents.retrieve(paymentIntent.id);
      const freshMetadata = freshPaymentIntent.metadata;

      if (freshMetadata.order_id) {
          console.log(`✅ Order #${freshMetadata.order_id} found after delay (Frontend won). Updating status...`);
          
          await wooCommerceRequest(`orders/${freshMetadata.order_id}`, 'PUT', {
              status: 'processing',
              set_paid: true,
              transaction_id: paymentIntent.id
          });
          
          return NextResponse.json({ received: true, message: "Order updated after delay" });
      }

      console.log(`🔍 Checking WooCommerce for any existing order with transaction ID: ${paymentIntent.id}...`);
      // ★★★ পরিবর্তন: 10 এর জায়গায় 30 করা হলো সেফটির জন্য ★★★
      const recentOrders = await wooCommerceRequest<any[]>("orders", "GET", { per_page: 30, orderby: 'date', order: 'desc' });
      
      const existingOrder = recentOrders.find((o: any) => 
        o.transaction_id === paymentIntent.id || 
        (o.meta_data && o.meta_data.some((m: any) => m.key === 'stripe_payment_intent' && m.value === paymentIntent.id))
      );

      if (existingOrder) {
          console.log(`✅ Order #${existingOrder.id} found in WooCommerce DB! (Frontend was slow but successful). Updating status...`);
          
          await wooCommerceRequest(`orders/${existingOrder.id}`, 'PUT', {
              status: 'processing',
              set_paid: true,
              transaction_id: paymentIntent.id
          });

          await stripe.paymentIntents.update(paymentIntent.id, {
              metadata: { order_id: existingOrder.id.toString() },
              description: `Order #${existingOrder.id} for GOBIKE`
          });

          return NextResponse.json({ received: true, message: "Order found in DB and updated" });
      }

      console.warn(`⚠️ Frontend officially failed and no order found in DB. Creating fallback order via Webhook...`);

      if (!freshMetadata.cart_items_json || !freshMetadata.billing_json) {
          throw new Error("Missing necessary metadata to create fallback order.");
      }

      // ★★★ নতুন: Webhook ক্র্যাশ ঠেকানোর জন্য Safe JSON Parsing ★★★
      const safeParseJSON = (jsonString: string, fallbackResult: any) => {
          try {
              return JSON.parse(jsonString);
          } catch (e) {
              console.error("⚠️ JSON Parse Warning (String might be truncated):", jsonString);
              return fallbackResult;
          }
      };

      const cartItems = safeParseJSON(freshMetadata.cart_items_json, []);
      const billingInfo = safeParseJSON(freshMetadata.billing_json, {});
      const shippingInfo = freshMetadata.shipping_json ? safeParseJSON(freshMetadata.shipping_json, billingInfo) : billingInfo;
      const couponLines = freshMetadata.applied_coupons_json ? safeParseJSON(freshMetadata.applied_coupons_json, []) : [];

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
        coupon_lines: couponLines,
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