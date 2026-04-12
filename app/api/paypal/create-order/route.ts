//app/api/paypal/create-order/route.ts

import { NextResponse } from 'next/server';
import { wooCommerceRequest } from '@/lib/woocommerce';

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET_KEY!;
const PAYPAL_API_URL = process.env.PAYPAL_ENVIRONMENT === 'sandbox' 
    ? 'https://api-m.sandbox.paypal.com' 
    : 'https://api-m.paypal.com';

async function generatePayPalAccessToken() {
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64');
    const response = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
        method: 'POST',
        body: 'grant_type=client_credentials',
        headers: { Authorization: `Basic ${auth}` },
    });
    const data = await response.json();
    return data.access_token;
}

export async function POST(request: Request) {
    try {
        const { total, cartItems, customerInfo, shippingInfo, selectedShipping, shippingRates, appliedCoupons } = await request.json();

        const selectedRate = shippingRates.find((r: any) => r.id === selectedShipping);
        
        // ১. পেমেন্টের আগেই WooCommerce-এ Pending অর্ডার তৈরি করা হচ্ছে
        const wcOrderData = {
            payment_method: 'ppcp-gateway',
            payment_method_title: 'PayPal',
            set_paid: false,
            status: 'pending',
            billing: {
                first_name: customerInfo.firstName,
                last_name: customerInfo.lastName,
                address_1: customerInfo.address1,
                city: customerInfo.city,
                state: customerInfo.state,
                postcode: customerInfo.postcode,
                country: 'AU',
                email: customerInfo.email,
                phone: customerInfo.phone,
            },
            shipping: {
                first_name: shippingInfo?.firstName || customerInfo.firstName,
                last_name: shippingInfo?.lastName || customerInfo.lastName,
                address_1: shippingInfo?.address1 || customerInfo.address1,
                city: shippingInfo?.city || customerInfo.city,
                state: shippingInfo?.state || customerInfo.state,
                postcode: shippingInfo?.postcode || customerInfo.postcode,
                country: 'AU',
            },
            line_items: cartItems.map((item: any) => ({
                product_id: item.databaseId || item.id,
                quantity: item.quantity,
                variation_id: item.variationId || 0
            })),
            shipping_lines: [{
                method_id: selectedRate?.id || 'flat_rate',
                method_title: selectedRate?.label || 'Shipping',
                total: (parseFloat(selectedRate?.cost) || 0).toString(),
            }],
            coupon_lines: appliedCoupons?.map((c: any) => ({ code: c.code })) || [],
        };

        const wcOrder = await wooCommerceRequest<any>("orders", "POST", wcOrderData);
        
        if (!wcOrder || !wcOrder.id) {
            throw new Error("Failed to create pending order in WooCommerce.");
        }

        // ২. PayPal অর্ডার তৈরি করা হচ্ছে এবং custom_id হিসেবে WC Order ID পাঠানো হচ্ছে
        const accessToken = await generatePayPalAccessToken();
        const paypalResponse = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                intent: 'CAPTURE',
                purchase_units: [{
                    reference_id: wcOrder.id.toString(),
                    custom_id: wcOrder.id.toString(), // ★ এটি Webhook-এর জন্য সবচেয়ে জরুরি!
                    amount: {
                        currency_code: 'AUD',
                        value: total.toFixed(2),
                    },
                }],
            }),
        });

        const paypalOrder = await paypalResponse.json();
        
        if (!paypalResponse.ok) {
            // পেপ্যাল ঠিক কী কারণে রিজেক্ট করল তা টার্মিনালে দেখার জন্য:
            console.error("🔴 PayPal API Error Details:", JSON.stringify(paypalOrder, null, 2));
            throw new Error(paypalOrder.message || "Failed to initialize PayPal order.");
        }

        return NextResponse.json({ 
            id: paypalOrder.id, // PayPal Order ID
            wcOrderId: wcOrder.id, 
            wcOrderKey: wcOrder.order_key 
        });

    } catch (error: any) {
        console.error("PayPal Create API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}