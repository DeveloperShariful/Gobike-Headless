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
    // ★★★ পরিবর্তন: appliedCoupons রিসিভ করা হলো ★★★
    const { paymentIntentId, amount, orderId, cartItems, customerInfo, shippingInfo, metadata: incomingMetadata, appliedCoupons } = body;

    if (!paymentIntentId) {
      return NextResponse.json({ error: 'Missing Payment Intent ID.' }, { status: 400 });
    }

    const updateData: Stripe.PaymentIntentUpdateParams = {};

    if (amount && typeof amount === 'number' && amount > 0) {
      updateData.amount = Math.round(amount * 100);
    }
    
    const metadata: Record<string, string> = { ...incomingMetadata };

    if (orderId) {
      metadata.order_id = orderId.toString();
      updateData.description = `Order #${orderId} for GOBIKE`; 
    }

    if (customerInfo) {
        metadata.customer_email = customerInfo.email || '';
        metadata.customer_name = `${customerInfo.firstName || ''} ${customerInfo.lastName || ''}`.trim();
        metadata.billing_json = JSON.stringify(customerInfo).substring(0, 499); 
    }

    if (shippingInfo) {
        metadata.shipping_json = JSON.stringify(shippingInfo).substring(0, 499);
    }
    
    if (cartItems && Array.isArray(cartItems)) {
        const simplifiedCart = cartItems.map((item: any) => ({
            product_id: item.databaseId || item.id,
            quantity: item.quantity,
            variation_id: item.variationId || 0 
        }));
        metadata.cart_items_json = JSON.stringify(simplifiedCart).substring(0, 499);
    }

    // ★★★ নতুন: কুপন ডাটা মেটাডেটায় সেভ করা হচ্ছে ★★★
    if (appliedCoupons && Array.isArray(appliedCoupons) && appliedCoupons.length > 0) {
        const simplifiedCoupons = appliedCoupons.map((c: any) => ({ code: c.code }));
        metadata.applied_coupons_json = JSON.stringify(simplifiedCoupons).substring(0, 499);
    }

    if (Object.keys(metadata).length > 0) {
        updateData.metadata = metadata;
    }

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