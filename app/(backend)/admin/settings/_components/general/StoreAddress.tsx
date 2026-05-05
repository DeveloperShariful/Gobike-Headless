//app/(backend)/admin/settings/_components/general/StoreAddress.tsx

import { getCountryStateOptions } from "@/app/(backend)/action/settings/general/location-helpers";
import { ComponentProps } from "../types";

export default function StoreAddress({ data, updateNestedData }: Omit<ComponentProps, 'handleChange'>) {
    const locations = getCountryStateOptions();

    // Inline Classes
    const thClass = "py-[20px] pr-[20px] font-semibold w-full sm:w-[250px] align-top text-left text-[#1d2327] text-[14px]";
    const tdClass = "py-[15px] px-[10px] align-top text-[#3c434a]";
    const inputClass = "w-full max-w-[400px] border border-[#8c8f94] rounded-[3px] px-3 py-1.5 text-[14px] text-[#2c3338] shadow-[inset_0_1px_2px_rgba(0,0,0,0.07)] focus:border-[#2271b1] focus:shadow-[0_0_0_1px_#2271b1] outline-none transition-shadow bg-white";
    const selectClass = "w-full max-w-[400px] border border-[#8c8f94] rounded-[3px] px-3 py-1.5 text-[14px] text-[#2c3338] shadow-[inset_0_1px_2px_rgba(0,0,0,0.07)] focus:border-[#2271b1] focus:shadow-[0_0_0_1px_#2271b1] outline-none transition-shadow bg-white";

    return (
        <>
            <tr className="border-b border-[#f0f0f1]">
                <th className={thClass}>Address line 1</th>
                <td className={tdClass}>
                    <input 
                        name="addr_address1"
                        value={data.storeAddress?.address1 || ''} 
                        onChange={(e) => updateNestedData('storeAddress', 'address1', e.target.value)} 
                        className={inputClass}
                    />
                </td>
            </tr>
            <tr className="border-b border-[#f0f0f1]">
                <th className={thClass}>Address line 2</th>
                <td className={tdClass}>
                    <input 
                        name="addr_address2"
                        value={data.storeAddress?.address2 || ''} 
                        onChange={(e) => updateNestedData('storeAddress', 'address2', e.target.value)} 
                        className={inputClass}
                    />
                </td>
            </tr>
            <tr className="border-b border-[#f0f0f1]">
                <th className={thClass}>City</th>
                <td className={tdClass}>
                    <input 
                        name="addr_city"
                        value={data.storeAddress?.city || ''} 
                        onChange={(e) => updateNestedData('storeAddress', 'city', e.target.value)} 
                        className={inputClass}
                    />
                </td>
            </tr>
            <tr className="border-b border-[#f0f0f1]">
                <th className={thClass}>Country / State</th>
                <td className={tdClass}>
                    <select 
                        name="addr_country"
                        value={data.storeAddress?.country || ''} 
                        onChange={(e) => updateNestedData('storeAddress', 'country', e.target.value)} 
                        className={selectClass}
                    >
                        <option value="">Select a country / region...</option>
                        {locations.map((loc) => (
                            <option key={loc.value} value={loc.value}>{loc.label}</option>
                        ))}
                    </select>
                </td>
            </tr>
            <tr>
                <th className={thClass}>Postcode / ZIP</th>
                <td className={tdClass}>
                    <input 
                        name="addr_postcode"
                        value={data.storeAddress?.postcode || ''} 
                        onChange={(e) => updateNestedData('storeAddress', 'postcode', e.target.value)} 
                        className={inputClass}
                    />
                </td>
            </tr>
        </>
    );
}