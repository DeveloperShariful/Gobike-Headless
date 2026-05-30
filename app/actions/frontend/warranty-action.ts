// app/actions/frontend/action/warranty-action.ts

'use server';

import { db } from '@/lib/prisma';
import { sendNotification } from '@/app/api/email/send-notification'; 

type ClaimData = {
  name: string;
  orderNumber: string;
  shopPurchased: string;
  email: string;
  description: string;
  mediaUrl?: string;
  customAddress?: string; 
  // NEW: Receives full media objects from frontend
  mediaDetails?: Array<{
    url: string;
    pathname: string;
    filename: string;
    mimeType: string;
    size: number;
  }>;
};

export async function submitWarrantyClaim(data: ClaimData) {
  try {
    if (!data.name || !data.orderNumber || !data.email || !data.description) {
      return { success: false, message: 'Missing required fields' };
    }

    let wpPhone = '';
    let wpAddress = data.customAddress || ''; 
    let wpSuburb = '';
    let wpState = '';
    let wpPostcode = '';

    const cleanOrderNumber = data.orderNumber.replace('#', '').trim();

    try {
      const wpUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL;
      const ck = process.env.WC_CONSUMER_KEY;
      const cs = process.env.WC_CONSUMER_SECRET;

      const authHeader = 'Basic ' + Buffer.from(`${ck}:${cs}`).toString('base64');

      const res = await fetch(`${wpUrl}/wp-json/wc/v3/orders/${cleanOrderNumber}`, {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        },
        cache: 'no-store'
      });

      if (res.ok) {
        const orderData = await res.json();
        const orderEmail = orderData.billing?.email?.toLowerCase() || '';
        const inputEmail = data.email.toLowerCase();

        if (orderEmail === inputEmail) {
          wpPhone = orderData.billing?.phone || '';
          
          if (!data.customAddress) {
              const addr1 = orderData.shipping?.address_1 || '';
              const addr2 = orderData.shipping?.address_2 || '';
              wpAddress = `${addr1} ${addr2}`.trim();
          }
          
          wpSuburb = orderData.shipping?.city || '';
          wpState = orderData.shipping?.state || '';
          wpPostcode = orderData.shipping?.postcode || '';
        } else {
          console.log(`Email mismatch for order ${cleanOrderNumber}`);
        }
      }
    } catch (error) {
      console.error("WooCommerce REST API error:", error);
    }

    // 1. Create Warranty Claim Entry
    const newClaim = await db.warrantyClaim.create({
      data: {
        name: data.name,
        orderNumber: cleanOrderNumber,
        shopPurchased: data.shopPurchased,
        email: data.email,
        description: data.description,
        mediaUrl: data.mediaUrl || null,
        status: 'PENDING',
        phone: wpPhone,
        address: wpAddress, 
        suburb: wpSuburb,
        state: wpState,
        postcode: wpPostcode,
        country: 'AU'
      },
    });

    // 2. NEW: Save files into the Central Media Library
    if (data.mediaDetails && data.mediaDetails.length > 0) {
      const mediaDataToInsert = data.mediaDetails.map(media => {
        let type: 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'OTHER' = 'OTHER';
        if (media.mimeType.startsWith('image/')) type = 'IMAGE';
        else if (media.mimeType.startsWith('video/')) type = 'VIDEO';
        else if (media.mimeType.includes('pdf')) type = 'DOCUMENT';

        return {
          url: media.url,
          pathname: media.pathname,
          filename: media.filename,
          originalName: media.filename,
          mimeType: media.mimeType,
          size: media.size,
          type: type,
          source: 'WARRANTY' // Marks it as coming from Warranty Form!
        };
      });

      // Insert all media objects at once
      await db.media.createMany({
        data: mediaDataToInsert,
      });
    }

    // 3. Email Notification Logic
    try {
        await sendNotification({
            trigger: "WARRANTY_CLAIM_CUSTOMER",
            recipient: data.email,
            data: { 
                customer_name: data.name, 
                order_number: cleanOrderNumber,
                description: data.description
            }
        });

        await sendNotification({
            trigger: "WARRANTY_CLAIM_ADMIN",
            recipient: "", 
            replyTo: data.email, 
            data: { 
                customer_name: data.name, 
                order_number: cleanOrderNumber,
                shop_purchased: data.shopPurchased,
                description: data.description,
                media_urls: data.mediaUrl,
                claim_id: newClaim.id 
            }
        });
    } catch (emailError) {
        console.error("Failed to queue warranty emails:", emailError);
    }

    return { success: true, message: 'Claim submitted successfully!' };

  } catch (error: any) {
    console.error('Error submitting warranty claim:', error);
    return { success: false, message: 'Internal server error. Please try again.' };
  }
}