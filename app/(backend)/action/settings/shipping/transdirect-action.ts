//app/(backend)/action/shipping/transdirect-action.ts

'use server';

import { db } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { sendNotification } from '@/app/api/email/send-notification'; // ✅ NEW: Email trigger

// ============================================================================
// FUNCTION 1: GET QUOTES (রেট জানার জন্য) - No Changes Here
// ============================================================================
export async function getTransdirectQuotes(formData: FormData) {
  const claimId = formData.get('claimId') as string;
  const partDataRaw = formData.get('partData') as string;
  const receiverSuburb = formData.get('suburb') as string;
  const receiverPostcode = formData.get('postcode') as string;

  if (!partDataRaw || !receiverSuburb || !receiverPostcode) {
    return { success: false, message: 'Missing product or receiver location details.' };
  }

  try {
    const partData = JSON.parse(partDataRaw);
    const provider = await db.shippingProvider.findUnique({ where: { slug: 'transdirect' } });

    if (!provider || !provider.isEnabled || !provider.apiKey) {
      return { success: false, message: 'Transdirect is not configured in settings.' };
    }

    const settings = provider.settings as any;
    const quotePayload = {
      declared_value: "0.00", 
      items: [
        {
          weight: partData.weight ? parseFloat(partData.weight) : 1.0,
          height: partData.height ? parseFloat(partData.height) : 10.0,
          width: partData.width ? parseFloat(partData.width) : 20.0,
          length: partData.length ? parseFloat(partData.length) : 20.0,
          quantity: 1,
          description: "carton"
        }
      ],
      sender: {
        postcode: settings.senderPostcode,
        suburb: settings.senderSuburb,
        type: settings.senderLocationType || 'business',
        country: "AU"
      },
      receiver: {
        postcode: receiverPostcode,
        suburb: receiverSuburb,
        type: "residential",
        country: "AU"
      }
    };

    const api_url = provider.isSandbox ? 'https://sandbox.transdirect.com.au/api/bookings/v4' : 'https://www.transdirect.com.au/api/bookings/v4';    

    const fetchFromAPI = async () => {
      const response = await fetch(api_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Api-key': provider.apiKey || '' },
        body: JSON.stringify(quotePayload),
        cache: 'no-store',
      });
      return await response.json();
    };

    let data = await fetchFromAPI();
    if (data.quotes && Object.keys(data.quotes).length <= 2) {
      await new Promise(resolve => setTimeout(resolve, 2000)); 
      data = await fetchFromAPI(); 
    }

    if (data.message && !data.quotes) throw new Error(data.message);

    if (data.quotes && Object.keys(data.quotes).length > 0) {
      const quotesList = Object.entries(data.quotes).map(([courier_key, quote]: any) => {
        let label = courier_key.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
        let transitTime = quote.transit_time ? quote.transit_time.replace(/ Business/i, '') : 'N/A';
        return { courier: courier_key, name: label, total: quote.total, transitTime: transitTime };
      });
      
      quotesList.sort((a, b) => parseFloat(a.total) - parseFloat(b.total));
      return { success: true, quotes: quotesList, tempBookingId: data.id };
    }

    return { success: false, message: 'No couriers available for this route.' };

  } catch (error: any) {
    return { success: false, message: error.message || 'Internal Server Error' };
  }
}

// ============================================================================
// FUNCTION 2: CONFIRM BOOKING
// ============================================================================
export async function confirmTransdirectBooking(formData: FormData) {
  const claimId = formData.get('claimId') as string;
  const partName = formData.get('partName') as string;
  const tempBookingId = formData.get('tempBookingId') as string;
  const selectedCourier = formData.get('selectedCourier') as string;
  
  const receiverAddress = formData.get('address') as string;
  const receiverSuburb = formData.get('suburb') as string;
  const receiverPostcode = formData.get('postcode') as string;
  const receiverState = formData.get('state') as string || 'NSW'; 

  if (!claimId || !tempBookingId || !selectedCourier) return { success: false, message: 'Missing required booking data.' };

  try {
    const provider = await db.shippingProvider.findUnique({ where: { slug: 'transdirect' } });
    const claim = await db.warrantyClaim.findUnique({ where: { id: claimId } });

    if (!claim) throw new Error('Claim not found.');

    const confirmUrl = provider?.isSandbox ? `https://sandbox.transdirect.com.au/api/orders` : `https://www.transdirect.com.au/api/orders`;

    const confirmPayload = {
      transdirect_order_id: parseInt(tempBookingId), 
      order_id: `${claim.orderNumber}W`,
      goods_summary: `Warranty Part: ${partName}`,
      goods_dump: partName,
      imported_from: 'WooCommerce', 
      purchased_time: new Date().toISOString(),
      sale_price: 0,
      selected_courier: selectedCourier, 
      courier_price: 0,
      paid_time: new Date().toISOString(),
      buyer_name: claim.name,
      buyer_email: claim.email,
      delivery: {
        name: claim.name,
        email: claim.email,
        phone: "0400000000", 
        address: receiverAddress || claim.address || "N/A", 
        suburb: receiverSuburb,
        postcode: receiverPostcode,
        state: receiverState,
        country: "AU"
      }
    };

    const response = await fetch(confirmUrl, {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json', 'Api-key': provider?.apiKey || '' },
      body: JSON.stringify(confirmPayload),
    });

    const data = await response.json();

    if (!response.ok) {
      let errorMessage = 'Failed to confirm booking.';
      if (data.error) errorMessage = typeof data.error === 'object' ? JSON.stringify(data.error) : data.error;
      else if (data.message) errorMessage = data.message;
      throw new Error(errorMessage);
    }

    const trackingNumber = data.id ? `TD-${data.id}` : `TD-${Math.floor(Math.random() * 1000000)}`;
    const trackingUrl = `https://www.transdirect.com.au/track-and-trace/?tracking=${trackingNumber}`;

    await db.warrantyClaim.update({
      where: { id: claimId },
      data: { status: 'APPROVED', replacementPart: partName, trackingNumber: trackingNumber },
    });

    // 🛑 EMAIL TRIGGER: Part Shipped Email
    await sendNotification({
        trigger: "WARRANTY_PART_SHIPPED",
        recipient: claim.email,
        data: { 
            customer_name: claim.name, 
            order_number: claim.orderNumber,
            replacement_part: partName,
            tracking_number: trackingNumber,
            tracking_url: trackingUrl,
            courier: selectedCourier.replace(/_/g, ' ').toUpperCase()
        }
    });

    revalidatePath(`/admin/warranty-claims/${claimId}`);
    revalidatePath(`/admin/warranty-claims`);

    return { success: true, message: `Shipping booked via ${selectedCourier}! Tracking: ${trackingNumber}` };

  } catch (error: any) {
    console.error('Booking confirm failed:', error);
    return { success: false, message: error.message || 'Internal Server Error' };
  }
}