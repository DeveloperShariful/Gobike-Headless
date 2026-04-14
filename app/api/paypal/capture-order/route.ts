// app/api/paypal/capture-order/route.ts

import { NextResponse } from 'next/server';
import { wooCommerceRequest } from '@/lib/woocommerce';

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET_KEY!;
const PAYPAL_API_URL = 'https://api-m.paypal.com';

// 1. PayPal Access Token Generate
async function generatePayPalAccessToken() {
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64');
    const response = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
        method: 'POST',
        body: 'grant_type=client_credentials',
        headers: { Authorization: `Basic ${auth}` },
    });
    
    if (!response.ok) {
        throw new Error('Failed to generate PayPal access token');
    }
    
    const data = await response.json();
    return data.access_token;
}

export async function POST(request: Request) {
    try {
        const { paypalOrderId, wcOrderId } = await request.json();

        if (!paypalOrderId || !wcOrderId) {
            return NextResponse.json({ error: "Missing required IDs" }, { status: 400 });
        }

        // ==========================================
        // 🛡️ CHECK 1: Race Condition Prevention
        // ==========================================
        const wcOrder = await wooCommerceRequest<any>(`orders/${wcOrderId}`, "GET");
        
        if (!wcOrder) {
            throw new Error("WooCommerce order not found.");
        }

        if (wcOrder.status === 'processing' || wcOrder.status === 'completed') {
            console.log(`[PayPal Capture] Order ${wcOrderId} is already paid (likely via Webhook/Double Click). Skipping capture.`);
            return NextResponse.json({ success: true, status: 'COMPLETED', message: 'Payment already processed.' });
        }

        const accessToken = await generatePayPalAccessToken();
        
        // ==========================================
        // 🛡️ CHECK 2: Capture with Idempotency
        // ==========================================
        const response = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders/${paypalOrderId}/capture`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
                'PayPal-Request-Id': `capture_order_${wcOrderId}_${paypalOrderId}` 
            },
        });

        const captureData = await response.json();
        let captureDetails: any = null;

        // 🚨 এরর হ্যান্ডলিং এবং "ORDER_ALREADY_CAPTURED" ফিক্স
        if (!response.ok) {
            const isAlreadyCaptured = captureData.details?.some((d: any) => d.issue === 'ORDER_ALREADY_CAPTURED');

            if (isAlreadyCaptured) {
                console.warn(`⚠️ [PayPal] Order ${paypalOrderId} was already captured. Fetching details manually...`);
                
                // যদি অলরেডি ক্যাপচার হয়ে থাকে, তাহলে পেপ্যাল থেকে অর্ডারের ডাটা GET করে নিয়ে আসবো
                const getOrderRes = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders/${paypalOrderId}`, {
                    method: 'GET',
                    headers: { Authorization: `Bearer ${accessToken}` }
                });
                
                const fetchedOrder = await getOrderRes.json();
                captureDetails = fetchedOrder.purchase_units?.[0]?.payments?.captures?.[0];
                
                if (!captureDetails) {
                    throw new Error("Order captured previously, but could not retrieve capture details from PayPal.");
                }
            } else {
                // রিয়েল এরর (যেমন: কার্ডে টাকা নেই)
                console.error("PayPal Capture failed:", captureData);
                const isDeclined = captureData.details?.some((d: any) => d.issue === 'INSTRUMENT_DECLINED');
                
                await wooCommerceRequest(`orders/${wcOrderId}`, "PUT", {
                    status: 'failed',
                    set_paid: false
                });

                return NextResponse.json({ 
                    success: false, 
                    status: 'FAILED', 
                    message: isDeclined 
                        ? "Your card was declined by the bank. Please try a different payment method." 
                        : "Payment could not be captured." 
                });
            }
        } else {
            // নরমাল সাকসেস ক্যাপচার
            captureDetails = captureData.purchase_units?.[0]?.payments?.captures?.[0];
        }

        // 3. Safe Data Extraction
        const paymentStatus = captureDetails?.status || 'UNKNOWN'; 
        const transactionId = captureDetails?.id || paypalOrderId;
        const capturedAmount = parseFloat(captureDetails?.amount?.value || '0');

        // ==========================================
        // 🛡️ CHECK 3: Anti-Fraud Amount Validation
        // ==========================================
        const expectedAmount = parseFloat(wcOrder.total);
        const isAmountMismatch = Math.abs(expectedAmount - capturedAmount) > 0.05;

        // 4. Status Mapping Logic
        let wcStatus = 'pending';
        let setPaid = false;
        let successResponse = false;
        let frontendMessage = '';
        let orderNote = '';

        if (isAmountMismatch) {
            wcStatus = 'on-hold';
            setPaid = false;
            successResponse = false;
            frontendMessage = 'Payment captured, but amount mismatched. Order is on hold for admin review.';
            orderNote = `⚠️ Fraud Alert/Mismatch: PayPal captured $${capturedAmount}, but order total was $${expectedAmount}. Transaction ID: ${transactionId}.`;
        }
        else if (paymentStatus === 'COMPLETED') {
            wcStatus = 'processing';
            setPaid = true;
            successResponse = true;
            frontendMessage = 'Payment successful.';
            orderNote = `✅ PayPal payment completed successfully. Transaction ID: ${transactionId}.`;
        } 
        else if (paymentStatus === 'PENDING') {
            wcStatus = 'on-hold';
            setPaid = false; 
            successResponse = true; 
            frontendMessage = 'Payment is pending review by PayPal.';
            const pendingReason = captureDetails?.status_details?.reason || 'Unknown';
            orderNote = `⏳ PayPal payment is PENDING. Reason: ${pendingReason}. Transaction ID: ${transactionId}. Do not ship until cleared.`;
        } 
        else if (paymentStatus === 'DECLINED' || paymentStatus === 'FAILED' || paymentStatus === 'VOIDED') {
            wcStatus = 'failed';
            setPaid = false;
            successResponse = false;
            frontendMessage = 'Payment was declined or failed.';
            orderNote = `❌ PayPal payment failed or voided. Transaction ID: ${transactionId}.`;
        } 
        else {
            wcStatus = 'on-hold';
            successResponse = true; 
            frontendMessage = `Payment status: ${paymentStatus}. Under review.`;
            orderNote = `❓ PayPal payment returned unknown status: ${paymentStatus}. Transaction ID: ${transactionId}.`;
        }

        // ==========================================
        // 🛡️ 5. Final WooCommerce Update
        // ==========================================
        await wooCommerceRequest(`orders/${wcOrderId}`, "PUT", {
            status: wcStatus,
            set_paid: setPaid,
            transaction_id: transactionId,
            meta_data: [
                { key: '_paypal_status', value: paymentStatus }, 
                { key: '_paypal_transaction_id', value: transactionId }
            ]
        });

        try {
            await wooCommerceRequest(`orders/${wcOrderId}/notes`, "POST", {
                note: orderNote,
                customer_note: false 
            });
        } catch (noteError) {
            console.error("Failed to add order note:", noteError);
        }

        return NextResponse.json({ 
            success: successResponse, 
            status: paymentStatus,
            message: frontendMessage,
            wcOrderId: wcOrderId,
            wcOrderKey: wcOrder.order_key
        });

    } catch (error: any) {
        console.error("PayPal Capture API Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}