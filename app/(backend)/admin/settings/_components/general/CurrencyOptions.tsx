//app/(backend)/admin/settings/_components/general/CurrencyOptions.tsx

import { useState, useEffect } from "react";
import { getAllCurrencies } from "@/app/(backend)/action/settings/general/location-helpers";
import { ComponentProps } from "../types"; // রিয়েল টাইপ ইম্পোর্ট

export default function CurrencyOptions({ data, updateNestedData }: Omit<ComponentProps, 'handleChange'>) {
    const [currencies, setCurrencies] = useState<{code: string, symbol: string, label: string}[]>([]);

    useEffect(() => {
        setCurrencies(getAllCurrencies());
    }, []);

    const thClass = "py-[20px] pr-[20px] font-semibold w-full sm:w-[250px] align-top text-left text-[#1d2327] text-[14px]";
    const tdClass = "py-[15px] px-[10px] align-top text-[#3c434a]";
    const selectClass = "w-full max-w-[400px] border border-[#8c8f94] rounded-[3px] px-3 py-1.5 text-[14px] text-[#2c3338] shadow-[inset_0_1px_2px_rgba(0,0,0,0.07)] focus:border-[#2271b1] focus:shadow-[0_0_0_1px_#2271b1] outline-none transition-shadow bg-white";
    const shortInputClass = "w-[120px] border border-[#8c8f94] rounded-[3px] px-3 py-1.5 text-[14px] text-[#2c3338] shadow-[inset_0_1px_2px_rgba(0,0,0,0.07)] focus:border-[#2271b1] focus:shadow-[0_0_0_1px_#2271b1] outline-none transition-shadow bg-white";

    return (
        <>
            <tr className="border-b border-[#f0f0f1]">
                <th className={thClass}>Currency</th>
                <td className={tdClass}>
                    <select 
                        name="curr_currency"
                        value={data.currencyOptions.currency} 
                        onChange={(e) => updateNestedData('currencyOptions', 'currency', e.target.value)} 
                        className={selectClass}
                    >
                        <option value="">Select currency...</option>
                        {currencies.map((c) => (
                            <option key={c.code} value={c.code}>{c.label}</option>
                        ))}
                    </select>
                </td>
            </tr>
            <tr className="border-b border-[#f0f0f1]">
                <th className={thClass}>Currency position</th>
                <td className={tdClass}>
                    <select 
                        name="curr_position"
                        value={data.currencyOptions.currencyPosition} 
                        onChange={(e) => updateNestedData('currencyOptions', 'currencyPosition', e.target.value)} 
                        className={selectClass}
                    >
                        <option value="left">Left ($99.99)</option>
                        <option value="right">Right (99.99$)</option>
                        <option value="left_space">Left with space ($ 99.99)</option>
                        <option value="right_space">Right with space (99.99 $)</option>
                    </select>
                </td>
            </tr>
            <tr className="border-b border-[#f0f0f1]">
                <th className={thClass}>Thousand separator</th>
                <td className={tdClass}>
                    <input 
                        name="curr_thousand"
                        value={data.currencyOptions.thousandSeparator} 
                        onChange={(e) => updateNestedData('currencyOptions', 'thousandSeparator', e.target.value)} 
                        className={shortInputClass}
                    />
                </td>
            </tr>
            <tr className="border-b border-[#f0f0f1]">
                <th className={thClass}>Decimal separator</th>
                <td className={tdClass}>
                    <input 
                        name="curr_decimal"
                        value={data.currencyOptions.decimalSeparator} 
                        onChange={(e) => updateNestedData('currencyOptions', 'decimalSeparator', e.target.value)} 
                        className={shortInputClass}
                    />
                </td>
            </tr>
            <tr>
                <th className={thClass}>Number of decimals</th>
                <td className={tdClass}>
                    <input 
                        name="curr_decimals"
                        type="number" 
                        value={data.currencyOptions.numDecimals} 
                        onChange={(e) => updateNestedData('currencyOptions', 'numDecimals', e.target.value)} 
                        className={shortInputClass}
                    />
                </td>
            </tr>
        </>
    );
}