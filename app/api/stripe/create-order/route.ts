// app/api/stripe/create-order/route.ts

import { NextResponse } from 'next/server';
import { wooCommerceRequest } from '@/lib/woocommerce';

// টাইপ ডেফিনিশনগুলো (যাতে Typescript কোনো এরর না দেয় এবং কোড ১০০% সেফ থাকে)
interface CartItem {
  databaseId?: number;
  id?: number;
  quantity: number;
  variationId?: number;
  price?: string;
}

interface AddressInfo {
  firstName?: string;
  lastName?: string;
  address1?: string;
  city?: string;
  state?: string;
  postcode?: string;
  email?: string;
  phone?: string;
}

interface ShippingRate {
  id: string;
  label: string;
  cost: string;
}

interface CouponInfo {
  code: string;
}

interface MetaData {
  key: string;
  value: string;
}

export async function POST(request: Request) {
  try {
    // ফ্রন্টএন্ড থেকে পাঠানো সমস্ত ডেটা রিসিভ করা হচ্ছে
    const body = await request.json();
    const { 
      cartItems, 
      customerInfo, // Billing Address
      shippingInfo, // Shipping Address
      selectedShipping, // Shipping Rate ID
      shippingRates, // Available Shipping Rates
      appliedCoupons, 
      orderNotes,
      selectedPaymentMethod, // stripe, stripe_klarna, stripe_afterpay_clearpay etc.
      affiliateMetaData // Cookies থেকে আসা অ্যাফিলিয়েট ডেটা
    } = body;

    // ১. বেসিক ভ্যালিডেশন (অর্ডার তৈরির জন্য এগুলোর যেকোনো একটি না থাকলে অর্ডার ফেইল করবে)
    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty. Cannot create order." }, { status: 400 });
    }
    if (!customerInfo || !customerInfo.email || !customerInfo.firstName) {
      return NextResponse.json({ error: "Billing details (Name and Email) are required." }, { status: 400 });
    }

    // ২. পেমেন্ট মেথডের টাইটেল সেট করা (Stripe নাকি Klarna নাকি Afterpay)
    let paymentMethodTitle = 'Credit / Debit Card (Stripe)';
    if (selectedPaymentMethod === 'stripe_klarna') paymentMethodTitle = 'Klarna';
    if (selectedPaymentMethod === 'stripe_afterpay_clearpay') paymentMethodTitle = 'Afterpay / Clearpay';
    if (selectedPaymentMethod === 'stripe_zip') paymentMethodTitle = 'Zip Pay';

    // ৩. শিপিং কস্ট এবং টাইটেল বের করা
    let shippingLines: any[] = [];
    if (selectedShipping && shippingRates && shippingRates.length > 0) {
      const selectedRate = shippingRates.find((rate: ShippingRate) => rate.id === selectedShipping);
      if (selectedRate) {
        shippingLines = [{
          method_id: selectedRate.id,
          method_title: selectedRate.label,
          total: (parseFloat(selectedRate.cost) || 0).toString(),
        }];
      }
    }

    // ৪. অ্যাফিলিয়েট মেটাডেটার সাথে Stripe এর স্পেসিফিক মেটাডেটা যুক্ত করা
    const metaDataArray = Array.isArray(affiliateMetaData) ? [...affiliateMetaData] : [];
    metaDataArray.push({
      key: '_stripe_payment_method',
      value: selectedPaymentMethod || 'stripe'
    });
    metaDataArray.push({
      key: '_created_via',
      value: 'NextJS_Stripe_Create_Order_API' // ট্র্যাকিংয়ের জন্য
    });

    // ৫. WooCommerce এর জন্য 100% পারফেক্ট Payload বা ডেটা স্ট্রাকচার তৈরি করা
    const orderPayload = {
      payment_method: selectedPaymentMethod || 'stripe',
      payment_method_title: paymentMethodTitle,
      set_paid: false, // ★ খুবই গুরুত্বপূর্ণ: এটি False থাকবে কারণ পেমেন্ট এখনও হয়নি (Pending Order)
      billing: {
        first_name: customerInfo.firstName || '',
        last_name: customerInfo.lastName || '',
        address_1: customerInfo.address1 || '',
        city: customerInfo.city || '',
        state: customerInfo.state || '',
        postcode: customerInfo.postcode || '',
        country: 'AU', // Default Country
        email: customerInfo.email || '',
        phone: customerInfo.phone || '',
      },
      shipping: {
        first_name: shippingInfo?.firstName || customerInfo.firstName || '',
        last_name: shippingInfo?.lastName || customerInfo.lastName || '',
        address_1: shippingInfo?.address1 || customerInfo.address1 || '',
        city: shippingInfo?.city || customerInfo.city || '',
        state: shippingInfo?.state || customerInfo.state || '',
        postcode: shippingInfo?.postcode || customerInfo.postcode || '',
        country: 'AU',
      },
      line_items: cartItems.map((item: CartItem) => ({
        product_id: item.databaseId || item.id,
        quantity: item.quantity,
        variation_id: item.variationId || 0,
      })),
      shipping_lines: shippingLines,
      coupon_lines: appliedCoupons && Array.isArray(appliedCoupons) 
        ? appliedCoupons.map((coupon: CouponInfo) => ({ code: coupon.code })) 
        : [],
      customer_note: orderNotes || '',
      meta_data: metaDataArray
    };

    // ৬. WooCommerce REST API দিয়ে অর্ডার তৈরি করা (Using the helper function)
    const newOrder = await wooCommerceRequest<any>(
      "orders", 
      "POST", 
      orderPayload
    );

    // ৭. অর্ডার সাকসেসফুলি ক্রিয়েট হয়েছে কিনা চেক করা
    if (newOrder && newOrder.id && newOrder.order_key) {
      console.log(`✅ [Stripe Create Order] Pending Order Created Successfully. Order ID: ${newOrder.id}`);
      
      // ফ্রন্টএন্ডে Order ID এবং Order Key পাঠানো হচ্ছে যাতে ফ্রন্টএন্ড Stripe Payment Intent আপডেট করতে পারে
      return NextResponse.json({
        success: true,
        wcOrderId: newOrder.id,
        wcOrderKey: newOrder.order_key,
        status: newOrder.status // সাধারণত 'pending' হবে
      });
    } else {
      throw new Error('WooCommerce returned success, but missing Order ID or Order Key.');
    }

  } catch (error: any) {
    console.error("❌ [Stripe Create Order API Error]:", error);
    
    let errorMessage = "Failed to create draft order before payment.";
    if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}