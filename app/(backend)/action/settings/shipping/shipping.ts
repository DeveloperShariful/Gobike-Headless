//app/(backend)/action/shipping/shipping.ts

'use server';

import { db } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function saveShippingProviderSettings(formData: FormData) {
  try {
    const slug = formData.get('slug') as string;
    const name = formData.get('name') as string;
    const apiKey = formData.get('apiKey') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const isEnabled = formData.get('isEnabled') === 'on';
    const isSandbox = formData.get('isSandbox') === 'on';

    // JSON ফিল্ডে ট্রান্সডিরেক্টের স্পেসিফিক এবং প্লাগিনের ডাইনামিক প্রাইসিং রুলস সেভ হবে
    const extraSettings = {
      // Sender Details
      senderName: formData.get('senderName')?.toString() || "GoBike Australia",
      senderPhone: formData.get('senderPhone')?.toString() || "",
      senderAddress: formData.get('senderAddress')?.toString() || "52 Bligh Ave",
      senderSuburb: formData.get('senderSuburb')?.toString() || "Camden South",
      senderPostcode: formData.get('senderPostcode')?.toString() || "2570",
      senderState: formData.get('senderState')?.toString() || "NSW",
      senderCountry: formData.get('senderCountry')?.toString() || "AU",
      senderLocationType: formData.get('senderLocationType')?.toString() || "business",

      // General Pricing
      title: formData.get('title')?.toString() || "Courier Delivery",
      handlingFee: formData.get('handlingFee')?.toString() || "",

      // Dynamic Markup Rules
      markupRule1Threshold: formData.get('markupRule1Threshold')?.toString() || "",
      markupRule1Fee: formData.get('markupRule1Fee')?.toString() || "",
      markupRule2Threshold: formData.get('markupRule2Threshold')?.toString() || "",
      markupRule2Fee: formData.get('markupRule2Fee')?.toString() || "",
      markupRule3Fee: formData.get('markupRule3Fee')?.toString() || "",

      // Dynamic Discount Rules
      discountRule1Threshold: formData.get('discountRule1Threshold')?.toString() || "",
      discountRule1Amount: formData.get('discountRule1Amount')?.toString() || "",
      discountRule2Threshold: formData.get('discountRule2Threshold')?.toString() || "",
      discountRule2Amount: formData.get('discountRule2Amount')?.toString() || "",
      
      // Debug Mode
      debugMode: formData.get('debugMode') === 'on',
    };

    await db.shippingProvider.upsert({
      where: { slug: slug },
      update: {
        name,
        apiKey,
        email,
        password,
        isEnabled,
        isSandbox,
        settings: extraSettings,
      },
      create: {
        slug,
        name,
        apiKey,
        email,
        password,
        isEnabled,
        isSandbox,
        settings: extraSettings,
      },
    });

    revalidatePath('/admin/settings/shipping');

    return { success: true, message: `${name} settings updated successfully.` };
  } catch (error: any) {
    console.error('Failed to save shipping settings:', error);
    return { success: false, message: 'Server error. Please try again.' };
  }
}