//app/(backend)/admin/settings/_components/SettingsClient.tsx

'use client';

import { useState } from 'react';
import GeneralTab from './general/GeneralTab';
import ShippingTab from './shipping/ShippingTab';
import EmailsTab from './emails/EmailsTab';

// 🛑 types.ts থেকে রিয়েল টাইপ ইম্পোর্ট করা হলো
import { 
  GeneralSettingsData, 
  ShippingProvider, 
  EmailConfiguration, 
  EmailTemplate, 
  EmailLog 
} from './types';

// ইমেইল ট্যাবের ডেটার জন্য একটি ইন্টারফেস
export interface EmailPageData {
  config: EmailConfiguration | null;
  templates: EmailTemplate[];
  logs: EmailLog[];
  logsMeta: { total: number; pages: number };
}

export default function SettingsClient({ 
  initialShipping, 
  initialGeneral,
  initialEmailData 
}: { 
  initialShipping: ShippingProvider | null; 
  initialGeneral: GeneralSettingsData;
  initialEmailData: EmailPageData; 
}) {
  const [activeTab, setActiveTab] = useState('general');

  // WooCommerce Original Tab Classes
  const inactiveTabClass = "inline-block px-3 py-2 -mb-[1px] text-[#2271b1] hover:text-[#0a4b78] text-[14px] transition-colors border border-transparent";
  const activeTabClass = "inline-block px-3 py-2 -mb-[1px] text-[#1d2327] bg-[#f0f0f1] border border-[#c3c4c7] border-b-[#f0f0f1] text-[14px] font-semibold";

  return (
    <div className="w-full bg-[#f0f0f1] min-h-screen">
      
      {/* WordPress Original Style Tabs Navigation (nav-tab-wrapper) */}
      <div className="border-b border-[#c3c4c7] mb-6 px-4 sm:px-0 pt-2 flex flex-wrap gap-1">
        <button 
          onClick={() => setActiveTab('general')}
          className={activeTab === 'general' ? activeTabClass : inactiveTabClass}
        >
          General
        </button>
        <button 
          onClick={() => setActiveTab('shipping')}
          className={activeTab === 'shipping' ? activeTabClass : inactiveTabClass}
        >
          Shipping
        </button>
        <button 
          onClick={() => setActiveTab('emails')}
          className={activeTab === 'emails' ? activeTabClass : inactiveTabClass}
        >
          Emails
        </button>
      </div>

      {/* Tab Contents */}
      <div className="p-4 sm:p-0 pb-20 max-w-[1200px]">
        {activeTab === 'general' && (
          <GeneralTab initialData={initialGeneral} />
        )}

        {activeTab === 'shipping' && (
          <ShippingTab initialShipping={initialShipping} />
        )}

        {activeTab === 'emails' && (
          <EmailsTab initialData={initialEmailData} />
        )}
      </div>

    </div>
  );
}