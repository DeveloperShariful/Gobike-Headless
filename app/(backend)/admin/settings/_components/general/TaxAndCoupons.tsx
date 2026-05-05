//app/(backend)/admin/settings/_components/general/TaxAndCoupons.tsx

import { ComponentProps } from "../types";

export default function TaxAndCoupons({ data, updateNestedData }: Omit<ComponentProps, 'handleChange'>) {
    
    // Inline Classes
    const thClass = "py-[20px] pr-[20px] font-semibold w-full sm:w-[250px] align-top text-left text-[#1d2327] text-[14px]";
    const tdClass = "py-[15px] px-[10px] align-top text-[#3c434a]";
    const checkboxClass = "w-4 h-4 rounded-[3px] border-[#8c8f94] text-[#2271b1] focus:ring-[#2271b1] shadow-[inset_0_1px_2px_rgba(0,0,0,0.07)] mt-1 cursor-pointer";
    const descClass = "block text-[#646970] text-[13px] font-normal mt-1";

    return (
        <>
            {/* Taxes Section */}
            <tr className="border-b border-[#f0f0f1]">
                <th className={thClass}>Enable taxes</th>
                <td className={tdClass}>
                    <label className="flex items-start gap-2 cursor-pointer mt-1">
                        {/* Hidden inputs removed for cleaner logic */}
                        <input 
                            type="checkbox" 
                            name="enable_tax"
                            value="true"
                            checked={data.taxSettings?.enableTax || false} 
                            onChange={(e) => updateNestedData('taxSettings', 'enableTax', e.target.checked)} 
                            className={checkboxClass}
                        />
                        <span>Enable tax rates and calculations</span>
                    </label>
                </td>
            </tr>
            <tr className="border-b border-[#f0f0f1]">
                <th className={thClass}>Prices entered with tax</th>
                <td className={tdClass}>
                    <label className="flex items-start gap-2 cursor-pointer mt-1">
                        <input 
                            type="checkbox" 
                            name="prices_include_tax"
                            value="true"
                            checked={data.taxSettings?.pricesIncludeTax || false} 
                            onChange={(e) => updateNestedData('taxSettings', 'pricesIncludeTax', e.target.checked)} 
                            className={checkboxClass}
                        />
                        <span>I will enter prices inclusive of tax</span>
                    </label>
                </td>
            </tr>

            {/* Coupons Section */}
            <tr className="border-b border-[#f0f0f1]">
                <th className={thClass}>Enable coupons</th>
                <td className={tdClass}>
                    <label className="flex items-start gap-2 cursor-pointer mt-1">
                        <input 
                            type="checkbox" 
                            name="enable_coupons"
                            value="true"
                            checked={data.generalConfig?.enableCoupons || false} 
                            onChange={(e) => updateNestedData('generalConfig', 'enableCoupons', e.target.checked)} 
                            className={checkboxClass}
                        />
                        <span>Enable the use of coupon codes <br/><span className={descClass}>Coupons can be applied from the cart and checkout pages.</span></span>
                    </label>
                </td>
            </tr>
            <tr>
                <th className={thClass}>Sequential discounts</th>
                <td className={tdClass}>
                    <label className="flex items-start gap-2 cursor-pointer mt-1">
                        <input 
                            type="checkbox" 
                            name="calc_coupons_seq"
                            value="true"
                            checked={data.generalConfig?.calcCouponsSequentially || false} 
                            onChange={(e) => updateNestedData('generalConfig', 'calcCouponsSequentially', e.target.checked)} 
                            className={checkboxClass}
                        />
                        <span>Calculate coupon discounts sequentially <br/><span className={descClass}>When applying multiple coupons, apply the first coupon to the full price and the second coupon to the discounted price.</span></span>
                    </label>
                </td>
            </tr>
        </>
    );
}