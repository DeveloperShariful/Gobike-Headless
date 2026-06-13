// app/actions/frontend/action/warranty-action.ts

// app/actions/frontend/action/warranty-action.ts

'use server';

import { db } from '@/lib/prisma';
import { sendNotification } from '@/app/api/email/send-notification';

// Manual address type — Non-GoBike shop এর জন্য
type ManualAddress = {
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  phone: string;
};

type ClaimData = {
  name: string;
  orderNumber: string;
  shopPurchased: string;
  email: string;
  description: string;
  mediaUrl?: string;
  mediaDetails?: Array<{
    url: string;
    pathname: string;
    filename: string;
    mimeType: string;
    size: number;
  }>;
  // Non-GoBike shop হলে এই address আসবে
  manualAddress?: ManualAddress;
};

const GOBIKE_ONLINE_VALUE = 'GoBike Australia';

export async function submitWarrantyClaim(data: ClaimData) {
  try {
    // Basic validation
    if (!data.name || !data.email || !data.description) {
      return { success: false, message: 'Missing required fields' };
    }

    const isGoBikeOnline = data.shopPurchased === GOBIKE_ONLINE_VALUE;

    // GoBike Online হলে order number required
    if (isGoBikeOnline && !data.orderNumber) {
      return { success: false, message: 'Order number is required for GoBike Australia online orders.' };
    }

    const cleanOrderNumber = data.orderNumber
      ? data.orderNumber.replace('#', '').trim()
      : '';

    // ── Address variables ──
    let wpPhone = '';
    let wpAddress = '';
    let wpSuburb = '';
    let wpState = '';
    let wpPostcode = '';
    let wpName = '';
    let wpEmail = '';

    // ── GoBike Online: WooCommerce থেকে address verify করো ──
    if (isGoBikeOnline && cleanOrderNumber) {
      try {
        const wpUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL;
        const ck = process.env.WC_CONSUMER_KEY;
        const cs = process.env.WC_CONSUMER_SECRET;
        const authHeader = 'Basic ' + Buffer.from(`${ck}:${cs}`).toString('base64');

        const res = await fetch(
          `${wpUrl}/wp-json/wc/v3/orders/${cleanOrderNumber}`,
          {
            method: 'GET',
            headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
            cache: 'no-store',
          }
        );

        if (res.ok) {
          const orderData = await res.json();
          const orderEmail = orderData.billing?.email?.toLowerCase() || '';
          const inputEmail = data.email.toLowerCase();

          if (orderEmail === inputEmail) {
            wpPhone   = orderData.billing?.phone || '';
            wpName    = `${orderData.billing?.first_name || ''} ${orderData.billing?.last_name || ''}`.trim();
            wpEmail   = orderData.billing?.email || '';
            const addr1 = orderData.shipping?.address_1 || '';
            const addr2 = orderData.shipping?.address_2 || '';
            wpAddress = `${addr1} ${addr2}`.trim();
            wpSuburb  = orderData.shipping?.city || '';
            wpState   = orderData.shipping?.state || '';
            wpPostcode = orderData.shipping?.postcode || '';
          } else {
            console.log(`Email mismatch for order ${cleanOrderNumber}`);
            // email mismatch হলেও claim save করি, admin দেখবে
          }
        } else {
          console.error(`WooCommerce order ${cleanOrderNumber} not found. Status: ${res.status}`);
        }
      } catch (error) {
        console.error('WooCommerce REST API error:', error);
      }
    }

    // ── Non-GoBike shop: manual address ব্যবহার করো ──
    if (!isGoBikeOnline && data.manualAddress) {
      const addr = data.manualAddress;
      wpPhone    = addr.phone;
      wpName     = `${addr.firstName} ${addr.lastName}`.trim();
      wpAddress  = addr.address2
        ? `${addr.address1}, ${addr.address2}`.trim()
        : addr.address1;
      wpSuburb   = addr.city;
      wpState    = addr.state;
      wpPostcode = addr.postcode;
    }

    // ── 1. WarrantyClaim তৈরি করো ──
    const newClaim = await db.warrantyClaim.create({
      data: {
        name:          data.name,
        orderNumber:   cleanOrderNumber || 'N/A',
        shopPurchased: data.shopPurchased,
        email:         data.email,
        description:   data.description,
        mediaUrl:      data.mediaUrl || null,
        status:        'PENDING',
        wpName:        wpName || null,
        wpEmail:       wpEmail || null,
        phone:         wpPhone || null,
        address:       wpAddress || null,
        suburb:        wpSuburb || null,
        state:         wpState || null,
        postcode:      wpPostcode || null,
        country:       'AU',
      },
    });

    // ── 2. Media Library তে save করো ──
    if (data.mediaDetails && data.mediaDetails.length > 0) {
      const mediaDataToInsert = data.mediaDetails.map((media) => {
        let type: 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'OTHER' = 'OTHER';
        if (media.mimeType.startsWith('image/'))      type = 'IMAGE';
        else if (media.mimeType.startsWith('video/')) type = 'VIDEO';
        else if (media.mimeType.includes('pdf'))      type = 'DOCUMENT';

        return {
          url:          media.url,
          pathname:     media.pathname,
          filename:     media.filename,
          originalName: media.filename,
          mimeType:     media.mimeType,
          size:         media.size,
          type,
          source:       'WARRANTY',
        };
      });

      await db.media.createMany({ data: mediaDataToInsert });
    }

    // ── 3. Email Notification ──
    try {
      await sendNotification({
        trigger:   'WARRANTY_CLAIM_CUSTOMER',
        recipient: data.email,
        data: {
          customer_name: data.name,
          order_number:  cleanOrderNumber || 'N/A',
          description:   data.description,
        },
      });

      await sendNotification({
        trigger:   'WARRANTY_CLAIM_ADMIN',
        recipient: '',
        replyTo:   data.email,
        data: {
          customer_name:  data.name,
          order_number:   cleanOrderNumber || 'N/A',
          shop_purchased: data.shopPurchased,
          description:    data.description,
          media_urls:     data.mediaUrl,
          claim_id:       newClaim.id,
        },
      });
    } catch (emailError) {
      console.error('Failed to queue warranty emails:', emailError);
    }

    return { success: true, message: 'Claim submitted successfully!' };
  } catch (error: any) {
    console.error('Error submitting warranty claim:', error);
    return { success: false, message: 'Internal server error. Please try again.' };
  }
}