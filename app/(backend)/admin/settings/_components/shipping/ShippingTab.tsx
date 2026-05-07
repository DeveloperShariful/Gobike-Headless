//app/(backend)/admin/settings/_components/shipping/ShippingTab.tsx

'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { saveShippingProviderSettings } from '@/app/(backend)/action/settings/shipping/shipping';
import { ShippingProvider } from '../../../../types';

export default function ShippingTab({ initialShipping }: { initialShipping: ShippingProvider | null }) {
  const [loading, setLoading] = useState<boolean>(false);

  const shippingSettings = (initialShipping?.settings as Record<string, string | boolean>) || {};

  async function handleShippingSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); 
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);

    try {
      const result = await saveShippingProviderSettings(formData);
      if (result.success) {
        toast.success(result.message || 'Saved!');
      } else {
        toast.error(result.message || 'Failed!');
      }
    } catch (error) {
      toast.error('Something went wrong!');
    } finally {
      setLoading(false);
    }
  }

  // 🛑 Responsive Classes 
  const heading = "text-[18px] font-semibold text-[#1d2327] mb-2 pt-6";
  const desc = "block text-[#646970] text-[13px] font-normal mt-1";
  
  // 🔥 FIX: Table is responsive now
  const table = "w-full text-left text-[14px] text-[#3c434a] mb-8 block sm:table";
  
  const thClass = "py-[15px] sm:py-[20px] pr-[20px] font-semibold w-full sm:w-[250px] align-top text-left text-[#1d2327] text-[14px] block sm:table-cell";
  const tdClass = "py-[10px] sm:py-[15px] px-[10px] align-top text-[#3c434a] block sm:table-cell";
  
  const inputClass = "w-full max-w-[400px] border border-[#8c8f94] rounded-[3px] px-3 py-1.5 text-[14px] text-[#2c3338] shadow-[inset_0_1px_2px_rgba(0,0,0,0.07)] focus:border-[#2271b1] focus:shadow-[0_0_0_1px_#2271b1] outline-none transition-shadow bg-white";
  const shortInputClass = "w-full sm:w-[120px] border border-[#8c8f94] rounded-[3px] px-3 py-1.5 text-[14px] text-[#2c3338] shadow-[inset_0_1px_2px_rgba(0,0,0,0.07)] focus:border-[#2271b1] outline-none transition-shadow bg-white";
  const selectClass = "w-full max-w-[400px] border border-[#8c8f94] rounded-[3px] px-3 py-1.5 text-[14px] text-[#2c3338] shadow-[inset_0_1px_2px_rgba(0,0,0,0.07)] focus:border-[#2271b1] outline-none transition-shadow bg-white";
  const checkboxClass = "w-4 h-4 rounded-[3px] border-[#8c8f94] text-[#2271b1] focus:ring-[#2271b1] shadow-[inset_0_1px_2px_rgba(0,0,0,0.07)] mt-1 cursor-pointer shrink-0";
  const btnClass = "bg-[#2271b1] border border-[#2271b1] text-white px-4 py-[5px] text-[13px] font-semibold rounded-[3px] shadow-[0_1px_0_#2271b1] hover:bg-[#135e96] focus:outline-none transition-colors cursor-pointer disabled:opacity-50 w-full sm:w-auto";

  return (
    <form onSubmit={handleShippingSubmit} className="max-w-full pb-10 overflow-hidden">
      <input type="hidden" name="slug" value="transdirect" />
      <input type="hidden" name="name" value="Transdirect" />

      <h2 className={heading}>Transdirect Authentication</h2>
      <p className={`${desc} mb-4`}>Connect your Transdirect account to enable live shipping rates.</p>
      
      <table className={table}>
        <tbody className="block sm:table-row-group">
          <tr className="border-b border-[#c3c4c7] sm:border-[#f0f0f1] block sm:table-row">
            <th className={thClass}>Enable/Disable</th>
            <td className={tdClass}>
              <label className="flex items-start sm:items-center gap-2 cursor-pointer mt-1">
                <input type="checkbox" name="isEnabled" defaultChecked={initialShipping?.isEnabled} className={checkboxClass} />
                <span className="text-[14px] leading-tight">Enable Transdirect Shipping Integration</span>
              </label>
            </td>
          </tr>
          <tr className="border-b border-[#c3c4c7] sm:border-[#f0f0f1] block sm:table-row">
            <th className={thClass}>API Key</th>
            <td className={tdClass}>
              <input type="password" name="apiKey" defaultValue={initialShipping?.apiKey || ''} className={inputClass} placeholder="Your API Key" />
            </td>
          </tr>
          <tr className="border-b border-[#c3c4c7] sm:border-[#f0f0f1] block sm:table-row">
            <th className={thClass}>Account Email</th>
            <td className={tdClass}>
              <input type="email" name="email" defaultValue={initialShipping?.email || ''} className={inputClass} placeholder="your-email@example.com" />
            </td>
          </tr>
          <tr className="border-b border-[#c3c4c7] sm:border-[#f0f0f1] block sm:table-row">
            <th className={thClass}>Account Password</th>
            <td className={tdClass}>
              <input type="password" name="password" defaultValue={initialShipping?.password || ''} className={inputClass} placeholder="••••••••" />
            </td>
          </tr>
          <tr className="border-b border-[#c3c4c7] sm:border-transparent block sm:table-row">
            <th className={thClass}>Test Mode</th>
            <td className={tdClass}>
              <label className="flex items-start sm:items-center gap-2 cursor-pointer mt-1">
                <input type="checkbox" name="isSandbox" defaultChecked={initialShipping?.isSandbox} className={checkboxClass} />
                <span className="text-[14px] font-medium text-[#d63638] leading-tight">Enable Sandbox (Mock Bookings)</span>
              </label>
            </td>
          </tr>
        </tbody>
      </table>

      <h2 className={heading}>Default Sender Information (Origin)</h2>
      
      <table className={table}>
        <tbody className="block sm:table-row-group">
          <tr className="border-b border-[#c3c4c7] sm:border-[#f0f0f1] block sm:table-row">
            <th className={thClass}>Company Name</th>
            <td className={tdClass}>
              <input name="senderName" defaultValue={shippingSettings.senderName as string || 'GoBike Australia'} className={inputClass} />
            </td>
          </tr>
          <tr className="border-b border-[#c3c4c7] sm:border-[#f0f0f1] block sm:table-row">
            <th className={thClass}>Phone</th>
            <td className={tdClass}>
              <input name="senderPhone" defaultValue={shippingSettings.senderPhone as string || ''} className={inputClass} placeholder="+61..." />
            </td>
          </tr>
          <tr className="border-b border-[#c3c4c7] sm:border-[#f0f0f1] block sm:table-row">
            <th className={thClass}>Street Address</th>
            <td className={tdClass}>
              <input name="senderAddress" defaultValue={shippingSettings.senderAddress as string || '52 Bligh Ave'} className={inputClass} />
            </td>
          </tr>
          <tr className="border-b border-[#c3c4c7] sm:border-[#f0f0f1] block sm:table-row">
            <th className={thClass}>Suburb, State & Postcode</th>
            <td className={tdClass}>
              <div className="flex flex-col sm:flex-row gap-3">
                <input name="senderSuburb" defaultValue={shippingSettings.senderSuburb as string || 'Camden South'} className={shortInputClass} placeholder="Suburb" />
                <div className="flex gap-3 w-full sm:w-auto">
                    <input name="senderState" defaultValue={shippingSettings.senderState as string || 'NSW'} className="w-full sm:w-[80px] border border-[#8c8f94] rounded-[3px] px-3 py-1.5 outline-none focus:border-[#2271b1]" placeholder="NSW" />
                    <input name="senderPostcode" defaultValue={shippingSettings.senderPostcode as string || '2570'} className="w-full sm:w-[100px] border border-[#8c8f94] rounded-[3px] px-3 py-1.5 outline-none focus:border-[#2271b1]" placeholder="2570" />
                </div>
              </div>
            </td>
          </tr>
          <tr className="border-b border-[#c3c4c7] sm:border-transparent block sm:table-row">
            <th className={thClass}>Location Type</th>
            <td className={tdClass}>
              <select name="senderLocationType" defaultValue={shippingSettings.senderLocationType as string || 'business'} className={selectClass}>
                <option value="business">Business / Commercial</option>
                <option value="residential">Residential</option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>

      <h2 className={heading}>Pricing & Dynamic Rules</h2>
      
      <table className={table}>
        <tbody className="block sm:table-row-group">
          <tr className="border-b border-[#c3c4c7] sm:border-[#f0f0f1] block sm:table-row">
            <th className={thClass}>Checkout Title</th>
            <td className={tdClass}>
              <input name="title" defaultValue={shippingSettings.title as string || 'Courier Delivery'} className={inputClass} />
            </td>
          </tr>
          <tr className="border-b border-[#c3c4c7] sm:border-[#f0f0f1] block sm:table-row">
            <th className={thClass}>Handling Fee</th>
            <td className={tdClass}>
              <input name="handlingFee" defaultValue={shippingSettings.handlingFee as string || ''} className={inputClass} placeholder="e.g., 2.50 or 5%" />
            </td>
          </tr>

          <tr className="border-b border-[#c3c4c7] sm:border-[#f0f0f1] block sm:table-row">
            <th className={thClass}><span className="font-bold text-[#1d2327]">Dynamic Markup Rules</span></th>
            <td className={tdClass}>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 sm:p-0 bg-[#f0f0f1] sm:bg-transparent rounded-sm">
                  <span className="text-[13px] font-semibold sm:font-normal w-full sm:w-[140px]">If cart is LESS THAN</span>
                  <input name="markupRule1Threshold" defaultValue={shippingSettings.markupRule1Threshold as string || ''} className={shortInputClass} placeholder="$ amount" />
                  <span className="text-[13px] hidden sm:inline">Apply fee:</span>
                  <input name="markupRule1Fee" defaultValue={shippingSettings.markupRule1Fee as string || ''} className={shortInputClass} placeholder="25 or 15%" />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 sm:p-0 bg-[#f0f0f1] sm:bg-transparent rounded-sm">
                  <span className="text-[13px] font-semibold sm:font-normal w-full sm:w-[140px]">If cart is LESS THAN</span>
                  <input name="markupRule2Threshold" defaultValue={shippingSettings.markupRule2Threshold as string || ''} className={shortInputClass} placeholder="$ amount" />
                  <span className="text-[13px] hidden sm:inline">Apply fee:</span>
                  <input name="markupRule2Fee" defaultValue={shippingSettings.markupRule2Fee as string || ''} className={shortInputClass} placeholder="15 or 10%" />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 sm:p-0 bg-[#f0f0f1] sm:bg-transparent rounded-sm">
                  <span className="text-[13px] font-semibold sm:font-normal w-full sm:w-[140px]">For all other orders</span>
                  <span className="text-[13px] hidden sm:inline w-[120px]">-</span>
                  <span className="text-[13px] hidden sm:inline">Apply fee:</span>
                  <input name="markupRule3Fee" defaultValue={shippingSettings.markupRule3Fee as string || ''} className={shortInputClass} placeholder="5 or 5%" />
                </div>
              </div>
            </td>
          </tr>

          <tr className="border-b border-[#c3c4c7] sm:border-[#f0f0f1] block sm:table-row">
            <th className={thClass}><span className="font-bold text-[#1d2327]">Dynamic Discount Rules</span></th>
            <td className={tdClass}>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 sm:p-0 bg-[#f0f0f1] sm:bg-transparent rounded-sm">
                  <span className="text-[13px] font-semibold sm:font-normal w-full sm:w-[200px]">If cart is GREATER / EQUAL TO</span>
                  <input name="discountRule1Threshold" defaultValue={shippingSettings.discountRule1Threshold as string || ''} className={shortInputClass} placeholder="$ amount" />
                  <span className="text-[13px] hidden sm:inline">Apply discount:</span>
                  <input name="discountRule1Amount" defaultValue={shippingSettings.discountRule1Amount as string || ''} className={shortInputClass} placeholder="10 or 20%" />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 sm:p-0 bg-[#f0f0f1] sm:bg-transparent rounded-sm">
                  <span className="text-[13px] font-semibold sm:font-normal w-full sm:w-[200px]">If cart is GREATER / EQUAL TO</span>
                  <input name="discountRule2Threshold" defaultValue={shippingSettings.discountRule2Threshold as string || ''} className={shortInputClass} placeholder="$ amount" />
                  <span className="text-[13px] hidden sm:inline">Apply discount:</span>
                  <input name="discountRule2Amount" defaultValue={shippingSettings.discountRule2Amount as string || ''} className={shortInputClass} placeholder="15 or 25%" />
                </div>
              </div>
            </td>
          </tr>
          
          <tr className="border-b border-[#c3c4c7] sm:border-transparent block sm:table-row">
            <th className={thClass}>Developer Tools</th>
            <td className={tdClass}>
              <label className="flex items-start sm:items-center gap-2 cursor-pointer mt-1">
                <input type="checkbox" name="debugMode" defaultChecked={shippingSettings.debugMode as boolean} className={checkboxClass} />
                <span className="text-[14px] leading-tight">Enable debug logging</span>
              </label>
            </td>
          </tr>
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