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

    // --- ★★★ চূড়ান্ত সমাধান এখানে ★★★ ---
    // নিচের কমেন্টটি ESLint-কে এই লাইনের জন্য 'any' টাইপ ব্যবহার করার অনুমতি দেয়।
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cookieStore = cookies() as any;
    const visitorSourceCookie = cookieStore.get('visitor_source');

    if (!visitorSourceCookie) {
      return NextResponse.json({ message: 'Source cookie not found. Nothing to update.' });
    }
    
    const source = visitorSourceCookie.value;

    const updateData = {
      meta_data: [
        {
          key: '_visitor_source',
          value: source,
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