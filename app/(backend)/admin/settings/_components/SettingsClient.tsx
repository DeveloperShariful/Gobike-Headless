//app/(backend)/admin/settings/_components/SettingsClient.tsx

'use client';

import { useState } from 'react';
import GeneralTab from './general/GeneralTab';
import ShippingTab from './shipping/ShippingTab';
import EmailsTab from './emails/EmailsTab';

import { GeneralSettingsData, ShippingProvider, EmailConfiguration, EmailTemplate, EmailLog } from './types';

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
  const inactiveTabClass = "inline-block px-3 py-2.5 sm:py-2 -mb-[1px] text-[#2271b1] hover:text-[#0a4b78] text-[14px] transition-colors border border-transparent whitespace-nowrap";
  const activeTabClass = "inline-block px-3 py-2.5 sm:py-2 -mb-[1px] text-[#1d2327] bg-[#f0f0f1] border border-[#c3c4c7] border-b-[#f0f0f1] text-[14px] font-semibold whitespace-nowrap";

  return (
    <div className="w-full bg-[#f0f0f1] min-h-screen">
      
      {/* 🛑 FIX: Reduced px for mobile (px-2 instead of px-4) */}
      <div className="border-b border-[#c3c4c7] mb-4 sm:mb-6 px-2 sm:px-4 pt-2 flex overflow-x-auto custom-scrollbar">
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

      {/* 🛑 FIX: Reduced px for mobile (px-2 instead of px-4) */}
      <div className="px-2 sm:px-4 pb-20 w-full overflow-hidden">
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