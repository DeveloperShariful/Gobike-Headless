//app/(backend)/admin/settings/_components/general/StoreInfo.tsx

import { ComponentProps } from "../types";

export default function StoreInfo({ data, handleChange }: Omit<ComponentProps, 'updateNestedData'>) {
  
  // Inline Classes
  const thClass = "py-[20px] pr-[20px] font-semibold w-full sm:w-[250px] align-top text-left text-[#1d2327] text-[14px]";
  const tdClass = "py-[15px] px-[10px] align-top text-[#3c434a]";
  const inputClass = "w-full max-w-[400px] border border-[#8c8f94] rounded-[3px] px-3 py-1.5 text-[14px] text-[#2c3338] shadow-[inset_0_1px_2px_rgba(0,0,0,0.07)] focus:border-[#2271b1] focus:shadow-[0_0_0_1px_#2271b1] outline-none transition-shadow bg-white";
  const descClass = "block text-[#646970] text-[13px] font-normal mt-1";

  return (
    <>
      <tr className="border-b border-[#f0f0f1]">
        <th className={thClass}>
          Store Name
        </th>
        <td className={tdClass}>
          <input 
            name="storeName" 
            value={data.storeName || ''} 
            onChange={handleChange} 
            className={inputClass} 
          />
        </td>
      </tr>
      <tr className="border-b border-[#f0f0f1]">
        <th className={thClass}>
          Store Email
          <span className={descClass}>This email receives all system alerts and customer inquiries.</span>
        </th>
        <td className={tdClass}>
          <input 
            name="storeEmail" 
            type="email"
            value={data.storeEmail || ''} 
            onChange={handleChange} 
            className={inputClass} 
          />
        </td>
      </tr>
      <tr className="border-b border-[#f0f0f1]">
        <th className={thClass}>
          Store Phone
        </th>
        <td className={tdClass}>
          <input 
            name="storePhone" 
            value={data.storePhone || ''} 
            onChange={handleChange} 
            className={inputClass} 
          />
        </td>
      </tr>
    </>
  );
}