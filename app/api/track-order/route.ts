// app/api/track-order/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { trackingNumber } = await request.json();
    
    // স্পেস রিমুভ করা
    const cleanTrackingNum = trackingNumber.trim().replace(/\s+/g, '');

    const email = process.env.TRANSDIRECT_EMAIL;
    const password = process.env.TRANSDIRECT_PASSWORD;

    if (!email || !password) {
      return NextResponse.json({ error: 'Credentials missing' }, { status: 500 });
    }

    const authHeader = `Basic ${Buffer.from(`${email}:${password}`).toString('base64')}`;

    // API কল
    const url = `https://www.transdirect.com.au/api/bookings/v4?q=${encodeURIComponent(cleanTrackingNum)}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      cache: 'no-store'
    });

    const data = await response.json();
    
    // ১. বুকিং লিস্ট চেক করা
    const bookings = data.bookings || data;

    if (!Array.isArray(bookings)) {
        // যদি অ্যারে না হয়, তার মানে একটাই অবজেক্ট এসেছে
        return NextResponse.json(bookings);
    }

    // ২. ফিল্টার করা: এখানে আমি লুপ চালিয়ে চেক করছি কোনটা আপনার নাম্বারের সাথে মিলে
    // connote অথবা id চেক করছি
    const specificBooking = bookings.find((b: any) => 
      (b.connote && b.connote.trim() === cleanTrackingNum) || 
      (b.id && b.id.toString() === cleanTrackingNum)
    );

    if (specificBooking) {
      // ৩. শুধু স্পেসিফিক অর্ডারটি পাওয়া গেছে, এটাই পাঠাচ্ছি
      return NextResponse.json(specificBooking);
    } else {
      // ৪. যদি হুবহু না মিলে, তাহলে ডিবাগের জন্য প্রথমটাই পাঠাচ্ছি (যাতে আপনি স্ট্রাকচার দেখতে পারেন)
      // অথবা আপনি চাইলে এররও রিটার্ন করতে পারি
      return NextResponse.json({ 
         error: "Exact match not found in list, showing first result for debugging",
         firstResult: bookings[0] 
      });
    }

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}