//app/(backend)/admin/settings/_components/general/MeasurementMaintenance.tsx

import { ComponentProps } from "../types";

export default function MeasurementMaintenance({ data, handleChange, updateNestedData }: ComponentProps) {
    const thClass = "py-[20px] pr-[20px] font-semibold w-full sm:w-[250px] align-top text-left text-[#1d2327] text-[14px]";
    const tdClass = "py-[15px] px-[10px] align-top text-[#3c434a]";
    const selectClass = "w-full max-w-[400px] border border-[#8c8f94] rounded-[3px] px-3 py-1.5 text-[14px] text-[#2c3338] shadow-[inset_0_1px_2px_rgba(0,0,0,0.07)] focus:border-[#2271b1] focus:shadow-[0_0_0_1px_#2271b1] outline-none transition-shadow bg-white";
    const checkboxClass = "w-4 h-4 rounded-[3px] border-[#8c8f94] text-[#2271b1] focus:ring-[#2271b1] shadow-[inset_0_1px_2px_rgba(0,0,0,0.07)] mt-1 cursor-pointer";
    const descClass = "block text-[#646970] text-[13px] font-normal mt-1";

    return (
        <>
            <tr className="border-b border-[#f0f0f1]">
                <th className={thClass}>Weight unit</th>
                <td className={tdClass}>
                    <select 
                        name="weightUnit" 
                        value={data.weightUnit} 
                        onChange={handleChange} 
                        className={selectClass}
                    >
                        <option value="kg">kg</option>
                        <option value="g">g</option>
                        <option value="lbs">lbs</option>
                        <option value="oz">oz</option>
                    </select>
                </td>
            </tr>
            <tr className="border-b border-[#f0f0f1]">
                <th className={thClass}>Dimensions unit</th>
                <td className={tdClass}>
                    <select 
                        name="dimensionUnit" 
                        value={data.dimensionUnit} 
                        onChange={handleChange} 
                        className={selectClass}
                    >
                        <option value="m">m</option>
                        <option value="cm">cm</option>
                        <option value="mm">mm</option>
                        <option value="in">in</option>
                    </select>
                </td>
            </tr>
            <tr>
                <th className={thClass}>
                    <span className="text-[#d63638]">Site Visibility</span>
                </th>
                <td className={tdClass}>
                    <label className="flex items-start gap-2 cursor-pointer mt-1">
                        <input 
                            type="checkbox" 
                            name="maintenance"
                            value="true"
                            checked={data.maintenance} 
                            onChange={(e) => updateNestedData('maintenance', '', e.target.checked)} 
                            className={checkboxClass}
                        />
                        <span className="font-semibold text-[#1d2327]">Enable Maintenance Mode <br/><span className={descClass}>If enabled, the frontend store will be hidden from visitors.</span></span>
                    </label>
                </td>
            </tr>
        </>
    );
}