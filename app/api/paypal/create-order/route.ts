// app/api/paypal/create-order/route.ts

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
        throw new Error("Failed to authenticate with PayPal API.");
    }
    
    const data = await response.json();
    return data.access_token;
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { cartItems, customerInfo, shippingInfo, selectedShipping, shippingRates, appliedCoupons } = body;

        // ==========================================
        // 🛡️ LOGIC 1: Data Validation (Missing Data Check)
        // ==========================================
        if (!cartItems || cartItems.length === 0) {
            return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
        }
        if (!customerInfo?.email || !customerInfo?.firstName) {
            return NextResponse.json({ error: "Missing required billing details." }, { status: 400 });
        }

        const selectedRate = shippingRates?.find((r: any) => r.id === selectedShipping);
        if (!selectedRate && selectedShipping) {
            return NextResponse.json({ error: "Invalid shipping method selected." }, { status: 400 });
        }

        // ==========================================
        // 🛡️ LOGIC 2: Create WooCommerce Order FIRST
        // ==========================================
        const wcOrderData = {
            payment_method: 'ppcp-gateway',
            payment_method_title: 'PayPal',
            set_paid: false,
            status: 'pending', // স্ট্যাটাস অবশ্যই Pending থাকবে
            billing: {
                first_name: customerInfo.firstName,
                last_name: customerInfo.lastName,
                address_1: customerInfo.address1,
                city: customerInfo.city,
                state: customerInfo.state,
                postcode: customerInfo.postcode,
                country: 'AU', // ফিক্সড করে দেওয়া হলো, যাতে অন্য দেশের ফেক অ্যাড্রেস না আসে
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
            shipping_lines: selectedRate ? [{
                method_id: selectedRate.id,
                method_title: selectedRate.label,
                total: (parseFloat(selectedRate.cost) || 0).toString(),
            }] : [],
            coupon_lines: appliedCoupons?.map((c: any) => ({ code: c.code })) || [],
            meta_data: [
                { key: '_created_via', value: 'headless_paypal_api' }
            ]
        };

        const wcOrder = await wooCommerceRequest<any>("orders", "POST", wcOrderData);
        
        if (!wcOrder || !wcOrder.id) {
            throw new Error("Failed to create pending order in WooCommerce DB.");
        }

        // ==========================================
        // 🛡️ LOGIC 3: Server-Side Total Calculation (HACK PREVENTION)
        // ==========================================
        // ফ্রন্টএন্ডের `total` আমরা ডাস্টবিনে ফেলে দিয়েছি। 
        // WooCommerce নিজে ট্যাক্স, শিপিং, কুপন হিসাব করে যে টোটাল বের করেছে, আমরা সেটাই পেপ্যালকে দেব।
        const secureOrderTotal = parseFloat(wcOrder.total);

        if (secureOrderTotal <= 0) {
            // যদি ১০০% কুপন অ্যাপ্লাই করার কারণে প্রাইস ০ হয়ে যায়
            // তখন পেপ্যাল এপিআই কল না করে অর্ডার ফ্রি হিসেবে কমপ্লিট করা উচিত (যদিও এটি রেয়ার)
            throw new Error("Order total is zero. Invalid for PayPal processing.");
        }

        // ==========================================
        // 🛡️ LOGIC 4: Create PayPal Order
        // ==========================================
        const accessToken = await generatePayPalAccessToken();
        
        const paypalPayload = {
            intent: 'CAPTURE',
            purchase_units: [{
                reference_id: `wc_order_${wcOrder.id}`,
                custom_id: wcOrder.id.toString(), // ★ Webhook এর জন্য ফিঙ্গারপ্রিন্ট
                invoice_id: `${wcOrder.id}-${Date.now()}`, // পেপ্যাল ড্যাশবোর্ডে ডুপ্লিকেট ইনভয়েস এরর এড়াতে টাইমস্ট্যাম্প
                description: `Order #${wcOrder.id} from GoBikes`,
                amount: {
                    currency_code: 'AUD', // হার্ডকোডেড কারেন্সি, যাতে হ্যাকার কারেন্সি পরিবর্তন করতে না পারে
                    value: secureOrderTotal.toFixed(2), // সার্ভার-সাইড ভেরিফায়েড অ্যামাউন্ট
                },
            }],
        };

        const paypalResponse = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
                'PayPal-Request-Id': `create_order_${wcOrder.id}` 
            },
            body: JSON.stringify(paypalPayload),
        });

        const paypalOrder = await paypalResponse.json();
        
        if (!paypalResponse.ok) {
            await wooCommerceRequest(`orders/${wcOrder.id}`, "PUT", { status: 'cancelled' });
            
            console.error("🔴 PayPal API Error Details:", JSON.stringify(paypalOrder, null, 2));
            throw new Error(paypalOrder.message || "PayPal rejected the order initialization.");
        }

        // ==========================================
        // 🛡️ LOGIC 5: Return to Frontend
        // ==========================================
        return NextResponse.json({ 
            id: paypalOrder.id, // PayPal Order ID (Frontend এ পপআপ ওপেন করার জন্য লাগবে)
            wcOrderId: wcOrder.id, 
            wcOrderKey: wcOrder.order_key 
        });

    } catch (error: any) {
        console.error("PayPal Create API Error:", error);
        return NextResponse.json({ error: error.message || "An unexpected error occurred." }, { status: 500 });
    }
}