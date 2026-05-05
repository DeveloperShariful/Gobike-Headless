//app/(frontend)/action/warranty-action.ts
'use server';

import { db } from '@/lib/prisma';

type ClaimData = {
  name: string;
  orderNumber: string;
  shopPurchased: string;
  email: string;
  description: string;
  mediaUrl?: string;
  customAddress?: string; 
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
      // =================================================================
      // WOOCOMMERCE REST API CALL (Super Fast & Secure)
      // =================================================================
      const wpUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL;
      const ck = process.env.WC_CONSUMER_KEY;
      const cs = process.env.WC_CONSUMER_SECRET;

      // Basic Auth Header তৈরি করা হচ্ছে
      const authHeader = 'Basic ' + Buffer.from(`${ck}:${cs}`).toString('base64');

      // সরাসরি অর্ডার আইডি দিয়ে কল করা হচ্ছে
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

        // ইমেইল ম্যাচ করলে ডেটাগুলো ভেরিয়েবলে সেভ করা
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
          console.log(`Email mismatch for order ${cleanOrderNumber}. Expected ${orderEmail}, got ${inputEmail}`);
        }
      } else {
         console.log(`Order ${cleanOrderNumber} not found via REST API.`);
      }
    } catch (error) {
      console.error("WooCommerce REST API error during claim submission:", error);
    }

    // ডাটাবেসে সেভ
    await db.warrantyClaim.create({
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

    return { success: true, message: 'Claim submitted successfully!' };

  } catch (error: any) {
    console.error('Error submitting warranty claim:', error);
    return { success: false, message: 'Internal server error. Please try again.' };
  }
}