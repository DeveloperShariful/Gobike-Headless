import { headers } from 'next/headers';
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
    
    const headerList = await headers();
    const userAgent = headerList.get('user-agent') || '';
    const isMobile = /Mobi|Android|iPhone/i.test(userAgent);
    const deviceType = isMobile ? 'Mobile' : 'Desktop';

    const cookieStore = await cookies(); 
    const visitorSourceCookie = cookieStore.get('visitor_source');
    const pageViewsCookie = cookieStore.get('visitor_page_views');

    if (!visitorSourceCookie) {
      return NextResponse.json({ message: 'Source cookie not found. Nothing to update.' });
    }
    
    const source = visitorSourceCookie.value;
    const pageViews = pageViewsCookie ? parseInt(pageViewsCookie.value, 10) : 1;
    
    let sourceType = 'direct';
    if (source.includes('organic')) {
      sourceType = 'organic';
    } else if (source.includes('referral') || source.includes('facebook') || source.includes('instagram')) {
      sourceType = 'social';
    } else if (source.includes('utm_')) {
      sourceType = 'utm';
    }

    const updateData = {
      meta_data: [
        {
          key: '_wc_order_attribution_origin',
          value: source,
        },
        {
          key: '_wc_order_attribution_source_type',
          value: sourceType,
        },
        {
          key: '_wc_order_attribution_source',
          value: source,
        },
        {
          key: '_wc_order_attribution_device_type',
          value: deviceType,
        },
        {
          key: '_wc_order_attribution_session_page_views',
          value: pageViews,
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