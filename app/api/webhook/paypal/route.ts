//app/api/webhook/paypal/route.ts

import { NextResponse } from 'next/server';
import { wooCommerceRequest } from '@/lib/woocommerce';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        // শুধু পেমেন্ট সাকসেস ইভেন্ট ক্যাচ করব
        if (body.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
            const resource = body.resource;
            const wcOrderId = resource.custom_id; // আমরা Create API তে এটি পাঠিয়েছিলাম
            const transactionId = resource.id;

            if (!wcOrderId) {
                console.error("PayPal Webhook: No custom_id found.");
                return NextResponse.json({ received: true });
            }

            console.log(`[PayPal Webhook] Received payment for WC Order ID: ${wcOrderId}`);

            const order = await wooCommerceRequest<any>(`orders/${wcOrderId}`, "GET");
            
            // যদি ফ্রন্টএন্ড থেকে আগেই পেমেন্ট প্রসেস না হয়ে থাকে, তবেই আপডেট করব
            if (order && order.status === 'pending') {
                console.log(`[PayPal Webhook] Front-end dropped! Updating WC Order ${wcOrderId} to processing.`);
                await wooCommerceRequest(`orders/${wcOrderId}`, "PUT", {
                    status: 'processing',
                    set_paid: true,
                    transaction_id: transactionId,
                    meta_data: [{ key: '_is_webhook_created', value: 'yes_via_paypal_webhook' }]
                });
            } else {
                console.log(`[PayPal Webhook] Order ${wcOrderId} is already ${order?.status}. Handled by frontend.`);
            }
        }

        return NextResponse.json({ received: true });

    } catch (error: any) {
        console.error("PayPal Webhook Error:", error);
        return NextResponse.json({ error: "Webhook Error" }, { status: 500 });
    }
}