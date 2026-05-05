//app/(backend)/admin/settings/page.tsx
import { db } from '@/lib/prisma';
import { Prisma } from '@prisma/client'; // 🛑 Prisma-এর রিয়েল টাইপ
import SettingsClient, { EmailPageData } from './_components/SettingsClient';
import { ShippingProvider, GeneralSettingsData, EmailLog, EmailConfiguration, EmailTemplate } from './_components/types';

import { getEmailConfiguration } from '@/app/(backend)/action/settings/emails/email-config';
import { getEmailTemplates } from '@/app/(backend)/action/settings/emails/email-templates';
import { getEmailLogs } from '@/app/(backend)/action/settings/emails/email-logs';

export const dynamic = 'force-dynamic';

// ============================================================================
// 🛑 STRICT TYPE PARSERS: Prisma JsonValue থেকে আমাদের Custom Type এ কনভার্ট
// ============================================================================

const parseAddress = (json: Prisma.JsonValue | undefined | null): GeneralSettingsData['storeAddress'] => {
  const obj = (json && typeof json === 'object' && !Array.isArray(json)) ? (json as Record<string, any>) : {};
  return {
    address1: String(obj.address1 || ''),
    address2: String(obj.address2 || ''),
    city: String(obj.city || ''),
    country: String(obj.country || ''),
    postcode: String(obj.postcode || ''),
  };
};

const parseGeneralConfig = (json: Prisma.JsonValue | undefined | null): GeneralSettingsData['generalConfig'] => {
  const obj = (json && typeof json === 'object' && !Array.isArray(json)) ? (json as Record<string, any>) : {};
  return {
    sellingLocation: String(obj.sellingLocation || 'all'),
    sellingCountries: Array.isArray(obj.sellingCountries) ? obj.sellingCountries.map(String) : [],
    shippingLocation: String(obj.shippingLocation || 'all'),
    shippingCountries: Array.isArray(obj.shippingCountries) ? obj.shippingCountries.map(String) : [],
    defaultCustomerLocation: String(obj.defaultCustomerLocation || 'no_address'),
    enableCoupons: Boolean(obj.enableCoupons),
    calcCouponsSequentially: Boolean(obj.calcCouponsSequentially),
    enableReviews: Boolean(obj.enableReviews),
    enableGuestCheckout: Boolean(obj.enableGuestCheckout),
  };
};

const parseTaxSettings = (json: Prisma.JsonValue | undefined | null): GeneralSettingsData['taxSettings'] => {
  const obj = (json && typeof json === 'object' && !Array.isArray(json)) ? (json as Record<string, any>) : {};
  return {
    enableTax: Boolean(obj.enableTax),
    pricesIncludeTax: Boolean(obj.pricesIncludeTax),
  };
};

const parseCurrencyOptions = (json: Prisma.JsonValue | undefined | null): GeneralSettingsData['currencyOptions'] => {
  const obj = (json && typeof json === 'object' && !Array.isArray(json)) ? (json as Record<string, any>) : {};
  const curr = obj.currencyOptions && typeof obj.currencyOptions === 'object' && !Array.isArray(obj.currencyOptions) ? (obj.currencyOptions as Record<string, any>) : {};
  return {
    currency: String(curr.currency || 'AUD'),
    currencyPosition: String(curr.currencyPosition || 'left'),
    thousandSeparator: String(curr.thousandSeparator || ','),
    decimalSeparator: String(curr.decimalSeparator || '.'),
    numDecimals: Number(curr.numDecimals) || 2,
  };
};

const parseSocialLinks = (json: Prisma.JsonValue | undefined | null): GeneralSettingsData['socialLinks'] => {
  const obj = (json && typeof json === 'object' && !Array.isArray(json)) ? (json as Record<string, any>) : {};
  return {
    facebook: String(obj.facebook || ''),
    instagram: String(obj.instagram || ''),
    twitter: String(obj.twitter || ''),
    youtube: String(obj.youtube || ''),
    linkedin: String(obj.linkedin || ''),
  };
};

export default async function GlobalSettingsPage() {
  
  // ১. Shipping Data
  const shippingRaw = await db.shippingProvider.findUnique({ 
    where: { slug: 'transdirect' } 
  });
  
  let shippingProvider: ShippingProvider | null = null;
  if (shippingRaw) {
    shippingProvider = {
      ...shippingRaw,
      settings: (shippingRaw.settings && typeof shippingRaw.settings === 'object' && !Array.isArray(shippingRaw.settings))
        ? (shippingRaw.settings as Record<string, unknown>)
        : null
    };
  }

  // ২. General Settings Data
  const storeSettings = await db.storeSettings.findUnique({
    where: { id: "settings" }
  });

  const initialGeneral: GeneralSettingsData = {
    storeName: storeSettings?.storeName || '',
    storeEmail: storeSettings?.storeEmail || '',
    storePhone: storeSettings?.storePhone || '',
    weightUnit: storeSettings?.weightUnit || 'kg',
    dimensionUnit: storeSettings?.dimensionUnit || 'cm',
    maintenance: storeSettings?.maintenance || false,
    
    // 🛑 JSON Data Mapping perfectly using functions
    storeAddress: parseAddress(storeSettings?.storeAddress),
    generalConfig: parseGeneralConfig(storeSettings?.generalConfig),
    taxSettings: parseTaxSettings(storeSettings?.taxSettings),
    currencyOptions: parseCurrencyOptions(storeSettings?.generalConfig),
    socialLinks: parseSocialLinks(storeSettings?.socialLinks),
  };

  // ৩. Emails Data ফেচ করা হচ্ছে
  const [configRes, templatesRes, logsRes] = await Promise.all([
    getEmailConfiguration(),
    getEmailTemplates(),
    getEmailLogs(1)
  ]);

  // Email Logs JSON Mapping
  const typedLogs: EmailLog[] = logsRes.success && Array.isArray(logsRes.logs) 
    ? logsRes.logs.map((log: any) => ({
        ...log,
        metadata: (log.metadata && typeof log.metadata === 'object' && !Array.isArray(log.metadata))
          ? (log.metadata as Record<string, unknown>)
          : null
      }))
    : [];

  const initialEmailData: EmailPageData = {
    config: (configRes.success && configRes.data) ? (configRes.data as EmailConfiguration) : null,
    templates: (templatesRes.success && Array.isArray(templatesRes.data)) ? (templatesRes.data as EmailTemplate[]) : [],
    logs: typedLogs,
    logsMeta: { 
        total: logsRes.success ? (logsRes.total || 0) : 0, 
        pages: logsRes.success ? (logsRes.pages || 0) : 0 
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6 px-4 sm:px-0 pt-4">
        <h1 className="text-[23px] font-normal text-[#1d2327]">Settings</h1>
      </div>

      <SettingsClient 
        initialShipping={shippingProvider} 
        initialGeneral={initialGeneral} 
        initialEmailData={initialEmailData} 
      />
    </div>
  );
}