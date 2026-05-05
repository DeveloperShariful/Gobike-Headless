//app/(backend)/admin/settings/_components/types.ts

// ========================================================================
// 1. ORIGINAL TYPES (No changes made, only missing fields added for safety)
// ========================================================================

// ========================================================================
// 1. GENERAL SETTINGS UI TYPES 
// ========================================================================

export interface GeneralSettingsData {
    storeName: string;
    storeEmail: string;
    storePhone: string;
    
    storeAddress: {
        address1: string;
        address2: string;
        city: string;
        country: string; // e.g., "AU:NSW"
        postcode: string;
    };

    generalConfig: {
        sellingLocation: string; // 'all', 'all_except', 'specific'
        sellingCountries: string[]; // List of country codes
        shippingLocation: string; // 'all', 'specific', 'all_selling'
        shippingCountries: string[];
        defaultCustomerLocation: string; // 'shop_base', 'no_address', 'geoip'
        enableCoupons: boolean;
        calcCouponsSequentially: boolean;
        enableReviews: boolean;
        enableGuestCheckout: boolean;
    };

    taxSettings: {
        enableTax: boolean;
        pricesIncludeTax: boolean;
    };

    currencyOptions: {
        currency: string;
        currencyPosition: string; // 'left', 'right', 'left_space', 'right_space'
        thousandSeparator: string;
        decimalSeparator: string;
        numDecimals: number | string;
    };

    weightUnit: string;
    dimensionUnit: string;
    maintenance: boolean;
    socialLinks: {
        facebook: string;
        instagram: string;
        twitter: string;
        youtube: string;
        linkedin: string;
    };
}

export interface ComponentProps {
    data: GeneralSettingsData;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    updateNestedData: (section: keyof GeneralSettingsData | 'maintenance', field: string, value: unknown) => void;
}


// ========================================================================
// 2. PRISMA SCHEMA TYPES (Direct DB Mappings)
// ========================================================================

// ENUMS
export type AddressType = 'SHIPPING' | 'BILLING';
export type ShippingMethodType = 'FLAT_RATE' | 'FREE_SHIPPING' | 'LOCAL_PICKUP' | 'CARRIER_CALCULATED';

// Address Model
export interface Address {
    id: string;
    userId: string;
    title?: string | null;
    type: AddressType;
    firstName: string;
    lastName: string;
    company?: string | null;
    address1: string;
    address2?: string | null;
    city: string;
    state?: string | null;
    postcode: string;
    country: string;
    phone: string;
    email?: string | null;
    locationType?: string | null;
    transdirectLocationId?: string | null;
    isResidential: boolean;
    isDefault: boolean;
    taxZoneId?: string | null;
    isVerified: boolean;
    createdAt: Date | string;
    updatedAt: Date | string;
}

// ---------------------------------------------------------
// EMAILS & NOTIFICATIONS MODELS
// ---------------------------------------------------------

export interface EmailConfiguration {
    id: string;
    senderName: string;
    senderEmail: string;
    smtpHost?: string | null;
    smtpPort?: number | string | null;
    smtpUser?: string | null;
    smtpPassword?: string | null;
    encryption?: string | null;
    headerImage?: string | null;
    mediaId?: string | null;
    footerText?: string | null;
    baseColor?: string | null;
    backgroundColor?: string | null;
    bodyBackgroundColor?: string | null;
    isActive: boolean;
    updatedAt: Date | string;
}

export interface EmailTemplate {
    id: string;
    slug: string;
    triggerEvent?: string | null;
    name: string;
    subject: string;
    heading?: string | null;
    content: string;
    isEnabled: boolean;
    recipientType: string;
    customRecipients?: string | null;
    cc: string[];
    bcc: string[];
    attachments: string[];
    emailType: string;
    fromName?: string | null;
    fromEmail?: string | null;
    delay?: number | null;
    createdAt: Date | string;
    updatedAt: Date | string;
}

// ✅ NEWLY ADDED: Email Log Model for your Email Table
export interface EmailLog {
    id: string;
    recipient: string;
    subject: string;
    templateSlug?: string | null;
    status: string; // 'SENT', 'FAILED'
    errorMessage?: string | null;
    orderId?: string | null;
    userId?: string | null; 
    metadata?: Record<string, unknown> | null;
    openedAt?: Date | string | null;
    createdAt: Date | string;
}

export interface AbandonedCheckout {
    id: string;
    cartToken?: string | null;
    email?: string | null;
    userId?: string | null;
    items: Record<string, unknown> | unknown[]; 
    subtotal: number | string; 
    currency: string;
    recoveryUrl: string;
    isRecovered: boolean;
    recoveredAt?: Date | string | null;
    remindersSent: number;
    lastReminder?: Date | string | null;
    ipAddress?: string | null;
    userAgent?: string | null;
    createdAt: Date | string;
    updatedAt: Date | string;
}

// ---------------------------------------------------------
// SHIPPING & LOGISTICS MODELS
// ---------------------------------------------------------

export interface ShippingProvider {
    id: string;
    name: string;
    slug: string;
    isEnabled: boolean;
    isSandbox: boolean;
    apiKey?: string | null;
    apiSecret?: string | null;
    email?: string | null;
    password?: string | null;
    settings?: Record<string, unknown> | null; 
    createdAt: Date | string;
    updatedAt: Date | string;
}

export interface PackagingBox {
    id: string;
    name?: string | null;
    code?: string | null;
    description?: string | null;
    length: number | string;
    width: number | string;
    height: number | string;
    weight?: number | string | null;
    maxWeight?: number | string | null;
    provider: string;
    isEnabled: boolean;
    providerId?: string | null;
    createdAt: Date | string;
    updatedAt: Date | string;
}

export interface ShippingRate {
    id: string;
    zoneId: string;
    name: string;
    type: ShippingMethodType;
    price: number | string;
    minWeight?: number | string | null;
    maxWeight?: number | string | null;
    minPrice?: number | string | null;
    taxStatus: string;
    providerId?: string | null;
    createdAt: Date | string;
    updatedAt: Date | string;
}

export interface ShippingZone {
    id: string;
    name: string;
    countries: string[];
    createdAt: Date | string;
    updatedAt: Date | string;
}

export interface ShippingClass {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    createdAt: Date | string;
    updatedAt: Date | string;
}

export interface TaxRate {
    id: string;
    name: string;
    rate: number | string;
    country?: string | null;
    state?: string | null;
    priority: number;
    compound: boolean;
    shipping: boolean;
    class: string;
    isActive: boolean;
}

// ---------------------------------------------------------
// STORE SETTINGS MODEL
// ---------------------------------------------------------

export interface StoreSettings {
    id: string;
    storeName: string;
    storeEmail?: string | null;
    storePhone?: string | null;
    currency: string;
    currencySymbol: string;
    storeAddress?: Record<string, unknown> | null; 
    taxSettings?: Record<string, unknown> | null;  
    generalConfig?: Record<string, unknown> | null; 
    weightUnit: string;
    dimensionUnit: string;
    logo?: string | null;
    favicon?: string | null;
    socialLinks?: Record<string, unknown> | null;  
    smtpConfig?: Record<string, unknown> | null;   
    maintenance: boolean;
    affiliateConfig?: Record<string, unknown> | null; 
    mlmConfig?: Record<string, unknown> | null;       
    updatedAt: Date | string;
}