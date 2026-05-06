//app/(backend)/admin/settings/_components/general/TaxAndCoupons.tsx

import { ComponentProps } from "../types";

export default function TaxAndCoupons({ data, updateNestedData }: Omit<ComponentProps, 'handleChange'>) {
    
    // 🛑 Responsive Classes
    const thClass = "py-[15px] sm:py-[20px] pr-[20px] font-semibold w-full sm:w-[250px] align-top text-left text-[#1d2327] text-[14px] block sm:table-cell";
    const tdClass = "py-[10px] sm:py-[15px] px-[10px] align-top text-[#3c434a] block sm:table-cell";
    
    const checkboxClass = "w-4 h-4 rounded-[3px] border-[#8c8f94] text-[#2271b1] focus:ring-[#2271b1] shadow-[inset_0_1px_2px_rgba(0,0,0,0.07)] mt-1 cursor-pointer shrink-0";
    const descClass = "block text-[#646970] text-[13px] font-normal mt-1 leading-snug";

    return (
        <>
            {/* Taxes Section */}
            <tr className="border-b border-[#c3c4c7] sm:border-[#f0f0f1] block sm:table-row">
                <th className={thClass}>Enable taxes</th>
                <td className={tdClass}>
                    <label className="flex items-start gap-2 cursor-pointer mt-1">
                        <input 
                            type="checkbox" 
                            name="enable_tax"
                            value="true"
                            checked={data.taxSettings?.enableTax || false} 
                            onChange={(e) => updateNestedData('taxSettings', 'enableTax', e.target.checked)} 
                            className={checkboxClass}
                        />
                        <div>
                            <span className="text-[14px] leading-tight block pt-0.5">Enable tax rates and calculations</span>
                        </div>
                    </label>
                </td>
            </tr>
            <tr className="border-b border-[#c3c4c7] sm:border-[#f0f0f1] block sm:table-row">
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
                        <div>
                            <span className="text-[14px] leading-tight block pt-0.5">I will enter prices inclusive of tax</span>
                        </div>
                    </label>
                </td>
            </tr>

            {/* Coupons Section */}
            <tr className="border-b border-[#c3c4c7] sm:border-[#f0f0f1] block sm:table-row">
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
                        <div>
                            <span className="text-[14px] leading-tight block pt-0.5">Enable the use of coupon codes</span>
                            <span className={descClass}>Coupons can be applied from the cart and checkout pages.</span>
                        </div>
                    </label>
                </td>
            </tr>
            <tr className="block sm:table-row border-b border-[#c3c4c7] sm:border-transparent">
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
                        <div>
                            <span className="text-[14px] leading-tight block pt-0.5">Calculate coupon discounts sequentially</span>
                            <span className={descClass}>When applying multiple coupons, apply the first coupon to the full price and the second coupon to the discounted price.</span>
                        </div>
                    </label>
                </td>
            </tr>
        </>
    );
}