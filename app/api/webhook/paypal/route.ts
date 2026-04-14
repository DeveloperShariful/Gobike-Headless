//app/api/webhook/paypal/route.ts

import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { wooCommerceRequest } from '@/lib/woocommerce';

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET_KEY!;
const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID!; 
const PAYPAL_API_URL = 'https://api-m.paypal.com';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// 1. PayPal Access Token Generate
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

// 2. Webhook Signature Verification (নিরাপত্তার জন্য)
async function verifyPayPalWebhook(accessToken: string, reqBody: any, headersList: Headers) {

    if (!PAYPAL_WEBHOOK_ID) {
        console.warn("⚠️ PAYPAL_WEBHOOK_ID is missing in .env. Skipping signature verification (Not recommended for production).");
        return true;
    }

    const verificationBody = {
        auth_algo: headersList.get('paypal-auth-algo'),
        cert_url: headersList.get('paypal-cert-url'),
        transmission_id: headersList.get('paypal-transmission-id'),
        transmission_sig: headersList.get('paypal-transmission-sig'),
        transmission_time: headersList.get('paypal-transmission-time'),
        webhook_id: PAYPAL_WEBHOOK_ID,
        webhook_event: reqBody
    };

    const response = await fetch(`${PAYPAL_API_URL}/v1/notifications/verify-webhook-signature`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify(verificationBody)
    });

    const data = await response.json();
    return data.verification_status === 'SUCCESS';
}

export async function POST(request: Request) {
    try {
        const bodyText = await request.text();
        const event = JSON.parse(bodyText);
        const headersList = await headers();

        console.log(`🔔 [PayPal Webhook] Received Event: ${event.event_type}`);

        const accessToken = await generatePayPalAccessToken();

        // ভেরিফিকেশন
        const isValid = await verifyPayPalWebhook(accessToken, event, headersList);
        if (!isValid) {
            console.error("❌ [PayPal Webhook] Invalid Signature.");
            return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
        }

        // ==========================================
        // 🛡️ SCENARIO 1: কাস্টমার পেমেন্ট অ্যাপ্রুভ করেছে, কিন্তু ফ্রন্টএন্ড ফেইল করেছে
        // ==========================================
        if (event.event_type === 'CHECKOUT.ORDER.APPROVED') {
            const paypalOrderId = event.resource.id;
            const wcOrderId = event.resource.purchase_units?.[0]?.custom_id;

            if (!wcOrderId) return NextResponse.json({ message: "No WC Order ID found" }, { status: 200 });
            console.log(`⏳ [Webhook] Waiting 10 seconds for frontend to finish Order ${wcOrderId}...`);
            await sleep(10000); 

            // চেক করি ফ্রন্টএন্ড অলরেডি ক্যাপচার করে ফেলেছে কি না
            const wcOrder = await wooCommerceRequest<any>(`orders/${wcOrderId}`, "GET");
            if (wcOrder && (wcOrder.status === 'processing' || wcOrder.status === 'completed')) {
                console.log(`✅ [Webhook] Order ${wcOrderId} already processed by frontend.`);
                return NextResponse.json({ message: "Already processed" }, { status: 200 });
            }

            console.warn(`⏳ [Webhook] Frontend missed the capture for Order ${wcOrderId}. Webhook is capturing now...`);

            // Webhook নিজে ক্যাপচার করবে (Idempotency Key সহ, যাতে ফ্রন্টএন্ডের সাথে ডাবল চার্জ না হয়)
            const captureResponse = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders/${paypalOrderId}/capture`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                    'PayPal-Request-Id': `capture_order_${wcOrderId}_${paypalOrderId}`
                },
            });

            const captureData = await captureResponse.json();
            
            // যদি ক্যাপচার সাকসেস হয়, ডাটাবেস আপডেট করে দিই
            if (captureResponse.ok && captureData.status === 'COMPLETED') {
                const transactionId = captureData.purchase_units?.[0]?.payments?.captures?.[0]?.id;
                await wooCommerceRequest(`orders/${wcOrderId}`, "PUT", {
                    status: 'processing',
                    set_paid: true,
                    transaction_id: transactionId,
                });
                console.log(`🎉 [Webhook] Order ${wcOrderId} captured & updated successfully!`);
            }
        }

        // ==========================================
        // 🛡️ SCENARIO 2: টাকা ক্যাপচার হয়েছে, কিন্তু ডাটাবেস ক্র্যাশ করেছিল
        // ==========================================
        else if (event.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
            const transactionId = event.resource.id;
            const wcOrderId = event.resource.custom_id;
            const capturedAmount = parseFloat(event.resource.amount?.value || '0');

            if (!wcOrderId) return NextResponse.json({ message: "No WC Order ID found" }, { status: 200 });

            const wcOrder = await wooCommerceRequest<any>(`orders/${wcOrderId}`, "GET");
            if (!wcOrder) return NextResponse.json({ message: "WC Order not found" }, { status: 200 });

            if (wcOrder.status === 'pending' || wcOrder.status === 'failed') {
                console.warn(`⏳ [Webhook] Database was not updated for Order ${wcOrderId}. Fixing now...`);

                const expectedAmount = parseFloat(wcOrder.total);
                const isMismatch = Math.abs(expectedAmount - capturedAmount) > 0.05;

                await wooCommerceRequest(`orders/${wcOrderId}`, "PUT", {
                    status: isMismatch ? 'on-hold' : 'processing',
                    set_paid: !isMismatch,
                    transaction_id: transactionId,
                });

                await wooCommerceRequest(`orders/${wcOrderId}/notes`, "POST", {
                    note: `✅ Order updated via PayPal Webhook. Transaction ID: ${transactionId}.`,
                    customer_note: false 
                });

                console.log(`🎉 [Webhook] Order ${wcOrderId} database fixed!`);
            } else {
                console.log(`✅ [Webhook] Order ${wcOrderId} database is already up to date.`);
            }
        }

        // ==========================================
        // 🛡️ SCENARIO 3: পেমেন্ট ডিক্লাইন বা ফেইল হয়েছে
        // ==========================================
        else if (event.event_type === 'PAYMENT.CAPTURE.DENIED' || event.event_type === 'PAYMENT.CAPTURE.DECLINED') {
            const wcOrderId = event.resource.custom_id;
            if (wcOrderId) {
                await wooCommerceRequest(`orders/${wcOrderId}`, "PUT", { status: 'failed', set_paid: false });
                console.log(`❌ [Webhook] Order ${wcOrderId} marked as failed due to declined capture.`);
            }
        }

        return NextResponse.json({ received: true }, { status: 200 });

    } catch (error: any) {
        console.error("❌ [PayPal Webhook Error]:", error);
        return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
    }
}