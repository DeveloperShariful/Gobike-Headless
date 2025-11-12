// app/api/update-order-source/route.ts

import { NextResponse } from 'next/server';
import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";
import { cookies } from 'next/headers';

const api = new WooCommerceRestApi({
  url: process.env.NEXT_PUBLIC_WORDPRESS_URL!,
  consumerKey: process.env.WC_CONSUMER_KEY!,
  consumerSecret: process.env.WC_CONSUMER_SECRET!,
  version: "wc/v3"
});

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json({ message: 'Order ID is required' }, { status: 400 });
    }

    const cookieStore = await cookies(); 
    const visitorSourceCookie = cookieStore.get('visitor_source');

    if (!visitorSourceCookie) {
      return NextResponse.json({ message: 'Source cookie not found. Nothing to update.' });
    }
    
    const source = visitorSourceCookie.value;
    
    // সোর্সের ধরনের জন্য একটি সহজ লজিক
    let sourceType = 'direct';
    if (source.includes('organic')) {
      sourceType = 'organic';
    } else if (source.includes('referral') || source === 'facebook' || source === 'instagram') {
      sourceType = 'social'; // আপনি 'referral' ও ব্যবহার করতে পারেন
    }

    // ★★★ সমাধান: সঠিক WooCommerce মেটা কী ব্যবহার করা হচ্ছে ★★★
    const updateData = {
      meta_data: [
        {
          key: '_wc_order_attribution_origin', // <-- সঠিক কী
          value: source,
        },
        {
          key: '_wc_order_attribution_source_type', // <-- টাইপের জন্য সঠিক কী
          value: sourceType,
        }
      ]
    };

    await api.put(`orders/${orderId}`, updateData);

    return NextResponse.json({ success: true, message: `Order ${orderId} updated with source: ${source}` });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    console.error("Failed to update order source:", errorMessage);
    return NextResponse.json(
      { message: "Failed to update order source" },
      { status: 500 }
    );
  }
}