//app/api/paypal/capture-order/route.ts

import { NextResponse } from 'next/server';
import { wooCommerceRequest } from '@/lib/woocommerce';

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET!;
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
        const { paypalOrderId, wcOrderId } = await request.json();

        const accessToken = await generatePayPalAccessToken();
        const response = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders/${paypalOrderId}/capture`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const captureData = await response.json();

        if (captureData.status === 'COMPLETED') {
            const transactionId = captureData.purchase_units[0].payments.captures[0].id;
            
            // WooCommerce অর্ডারের স্ট্যাটাস Processing করে দেওয়া
            await wooCommerceRequest(`orders/${wcOrderId}`, "PUT", {
                status: 'processing',
                set_paid: true,
                transaction_id: transactionId
            });

            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ success: false, status: captureData.status });
        }
    } catch (error: any) {
        console.error("PayPal Capture API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}