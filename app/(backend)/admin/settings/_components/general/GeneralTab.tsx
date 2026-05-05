//app/(backend)/admin/settings/_components/general/GeneralTab.tsx

'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { updateGeneralSettings } from '@/app/(backend)/action/settings/general/general'; 

// 🛑 types.ts থেকে রিয়েল টাইপ ইম্পোর্ট করা হলো
import { GeneralSettingsData } from '../types';

import StoreInfo from './StoreInfo';
import StoreAddress from './StoreAddress';
import GeneralOptions from './GeneralOptions';
import TaxAndCoupons from './TaxAndCoupons';
import CurrencyOptions from './CurrencyOptions';
import MeasurementMaintenance from './MeasurementMaintenance';
import SocialLinks from './SocialLinks';

export default function GeneralTab({ initialData }: { initialData: GeneralSettingsData }) {
  // 🛑 strictly typed state
  const [data, setData] = useState<GeneralSettingsData>(initialData);
  const [loading, setLoading] = useState<boolean>(false);

  // 🛑 Type-safe update function
  const updateNestedData = (section: keyof GeneralSettingsData | 'maintenance', field: string, value: unknown) => {
    setData((prev) => {
      if (section === 'maintenance') {
        return { ...prev, maintenance: value as boolean };
      }
      return {
        ...prev,
        [section]: {
          ...(prev[section] as Record<string, unknown>),
          [field]: value
        }
      };
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ FormData দিয়ে নিখুঁতভাবে সেভ করা হচ্ছে
  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); 
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    
    formData.set('conf_selling_countries', JSON.stringify(data.generalConfig.sellingCountries));
    formData.set('conf_shipping_countries', JSON.stringify(data.generalConfig.shippingCountries));

    formData.set('enable_tax', data.taxSettings.enableTax ? "true" : "false");
    formData.set('prices_include_tax', data.taxSettings.pricesIncludeTax ? "true" : "false");
    formData.set('enable_coupons', data.generalConfig.enableCoupons ? "true" : "false");
    formData.set('calc_coupons_seq', data.generalConfig.calcCouponsSequentially ? "true" : "false");
    formData.set('enable_reviews', data.generalConfig.enableReviews ? "true" : "false");
    formData.set('enable_guest_checkout', data.generalConfig.enableGuestCheckout ? "true" : "false");
    formData.set('maintenance', data.maintenance ? "true" : "false");

    formData.set('conf_selling_location', data.generalConfig.sellingLocation);
    formData.set('conf_shipping_location', data.generalConfig.shippingLocation);
    formData.set('conf_customer_location', data.generalConfig.defaultCustomerLocation);
    formData.set('curr_currency', data.currencyOptions.currency);
    formData.set('curr_position', data.currencyOptions.currencyPosition);
    formData.set('weightUnit', data.weightUnit);
    formData.set('dimensionUnit', data.dimensionUnit);
    formData.set('addr_country', data.storeAddress.country);

    try {
        const result = await updateGeneralSettings(formData);
        if (result.success) {
            toast.success(result.message || 'Settings saved successfully!');
        } else {
            toast.error(result.error || 'Failed to save settings');
        }
    } catch (error) {
        toast.error('Something went wrong!');
    } finally {
        setLoading(false);
    }
  };

  // 🛑 Inline Classes
  const headingClass = "text-[18px] font-semibold text-[#1d2327] mb-2 pt-6";
  const descClass = "block text-[#646970] text-[13px] font-normal mt-1";
  const tableClass = "w-full text-left text-[14px] text-[#3c434a] mb-8";
  const btnClass = "bg-[#2271b1] border border-[#2271b1] text-white px-4 py-[5px] text-[13px] font-semibold rounded-[3px] shadow-[0_1px_0_#2271b1] hover:bg-[#135e96] hover:border-[#135e96] focus:outline-none transition-colors cursor-pointer disabled:opacity-50";

  return (
    <form onSubmit={handleSave} className="pb-10">
      
      <h2 className={headingClass}>Store Address</h2>
      <p className={`${descClass} mb-4`}>This is where your business is located. Tax rates and shipping rates will use this address.</p>
      <table className={tableClass}>
        <tbody>
          <StoreInfo data={data} handleChange={handleChange} />
          <StoreAddress data={data} updateNestedData={updateNestedData} />
        </tbody>
      </table>

      <h2 className={headingClass}>General options</h2>
      <table className={tableClass}>
        <tbody>
          <GeneralOptions data={data} updateNestedData={updateNestedData} />
        </tbody>
      </table>

      <h2 className={headingClass}>Taxes & Coupons</h2>
      <table className={tableClass}>
        <tbody>
          <TaxAndCoupons data={data} updateNestedData={updateNestedData} />
        </tbody>
      </table>

      <h2 className={headingClass}>Currency options</h2>
      <p className={`${descClass} mb-4`}>The following options affect how prices are displayed on the frontend.</p>
      <table className={tableClass}>
        <tbody>
          <CurrencyOptions data={data} updateNestedData={updateNestedData} />
        </tbody>
      </table>

      <h2 className={headingClass}>Measurements & Maintenance</h2>
      <table className={tableClass}>
        <tbody>
          <MeasurementMaintenance data={data} handleChange={handleChange} updateNestedData={updateNestedData} />
        </tbody>
      </table>

      <h2 className={headingClass}>Social Links</h2>
      <table className={tableClass}>
        <tbody>
          <SocialLinks data={data} updateNestedData={updateNestedData} />
        </tbody>
      </table>

      <div className="mt-8 pt-6 border-t border-[#c3c4c7]">
        <button type="submit" disabled={loading} className={btnClass}>
          {loading ? 'Saving...' : 'Save changes'}
        </button>
      </div>
    </form>
  );
}