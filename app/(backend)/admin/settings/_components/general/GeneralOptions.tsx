//app/(backend)/admin/settings/_components/general/GeneralOptions.tsx

import { useState, useRef, useEffect } from "react";
import { X, Check } from "lucide-react";
import { getAllCountries } from "@/app/(backend)/action/settings/general/location-helpers";
import { ComponentProps } from "../types"; // রিয়েল টাইপ ইম্পোর্ট

export default function GeneralOptions({ data, updateNestedData }: Omit<ComponentProps, 'handleChange'>) {
    const allCountries = getAllCountries();
    const [searchSell, setSearchSell] = useState("");
    const [searchShip, setSearchShip] = useState("");
    const [sellDropdownOpen, setSellDropdownOpen] = useState(false);
    const [shipDropdownOpen, setShipDropdownOpen] = useState(false);
    
    const sellWrapperRef = useRef<HTMLDivElement>(null);
    const shipWrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (sellWrapperRef.current && !sellWrapperRef.current.contains(event.target as Node)) {
                setSellDropdownOpen(false);
            }
            if (shipWrapperRef.current && !shipWrapperRef.current.contains(event.target as Node)) {
                setShipDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleCountry = (type: 'selling' | 'shipping', code: string) => {
        const currentList = type === 'selling' ? data.generalConfig.sellingCountries : data.generalConfig.shippingCountries;
        let newList;
        if (currentList.includes(code)) {
            newList = currentList.filter((c: string) => c !== code);
        } else {
            newList = [...currentList, code];
        }
        updateNestedData('generalConfig', type === 'selling' ? 'sellingCountries' : 'shippingCountries', newList);
    };

    const removeTag = (type: 'selling' | 'shipping', code: string, e: React.MouseEvent) => {
        e.stopPropagation();
        toggleCountry(type, code);
    };

    const thClass = "py-[20px] pr-[20px] font-semibold w-full sm:w-[250px] align-top text-left text-[#1d2327] text-[14px]";
    const tdClass = "py-[15px] px-[10px] align-top text-[#3c434a]";
    const selectClass = "w-full max-w-[400px] border border-[#8c8f94] rounded-[3px] px-3 py-1.5 text-[14px] text-[#2c3338] shadow-[inset_0_1px_2px_rgba(0,0,0,0.07)] focus:border-[#2271b1] focus:shadow-[0_0_0_1px_#2271b1] outline-none transition-shadow bg-white";
    const inputClass = "w-full max-w-[400px] border border-[#8c8f94] rounded-[3px] px-3 py-1.5 text-[14px] text-[#2c3338] shadow-[inset_0_1px_2px_rgba(0,0,0,0.07)] focus:border-[#2271b1] focus:shadow-[0_0_0_1px_#2271b1] outline-none transition-shadow bg-white";
    const checkboxClass = "w-4 h-4 rounded-[3px] border-[#8c8f94] text-[#2271b1] focus:ring-[#2271b1] shadow-[inset_0_1px_2px_rgba(0,0,0,0.07)] mt-1 cursor-pointer";
    const descClass = "block text-[#646970] text-[13px] font-normal mt-1";

    return (
        <>
            {/* 1. SELLING LOCATIONS */}
            <tr className="border-b border-[#f0f0f1]">
                <th className={thClass}>Selling location(s)</th>
                <td className={tdClass}>
                    <select 
                        name="conf_selling_location"
                        value={data.generalConfig.sellingLocation}
                        onChange={(e) => updateNestedData('generalConfig', 'sellingLocation', e.target.value)}
                        className={selectClass}
                    >
                        <option value="all">Sell to all countries</option>
                        <option value="all_except">Sell to all countries, except for...</option>
                        <option value="specific">Sell to specific countries</option>
                    </select>
                </td>
            </tr>

            {(data.generalConfig.sellingLocation === 'specific' || data.generalConfig.sellingLocation === 'all_except') && (
                <tr className="border-b border-[#f0f0f1]">
                    <th className={thClass}>
                        {data.generalConfig.sellingLocation === 'specific' ? 'Sell to specific countries' : 'Exclude countries'}
                    </th>
                    <td className={tdClass}>
                        <div className="relative max-w-[400px]" ref={sellWrapperRef}>
                            <div onClick={() => setSellDropdownOpen(true)} className={`${inputClass} min-h-[36px] flex flex-wrap gap-1 cursor-text h-auto py-1`}>
                                {data.generalConfig.sellingCountries.map((code: string) => {
                                    const country = allCountries.find(c => c.value === code);
                                    return (
                                        <span key={code} className="bg-[#f0f0f1] border border-[#c3c4c7] text-[#3c434a] text-xs px-2 py-0.5 rounded-[3px] flex items-center gap-1">
                                            {country?.label} <X size={12} className="cursor-pointer hover:text-[#d63638]" onClick={(e) => removeTag('selling', code, e)}/>
                                        </span>
                                    );
                                })}
                                <input 
                                    value={searchSell} onChange={(e) => setSearchSell(e.target.value)}
                                    placeholder={data.generalConfig.sellingCountries.length === 0 ? "Select countries..." : ""}
                                    className="flex-1 outline-none text-[14px] min-w-[100px] bg-transparent py-0.5 text-[#2c3338]"
                                    onFocus={() => setSellDropdownOpen(true)}
                                />
                            </div>
                            
                            {sellDropdownOpen && (
                                <div className="absolute z-50 top-full left-0 w-full bg-white border border-[#8c8f94] mt-1 max-h-[250px] overflow-y-auto shadow-md rounded-[3px]">
                                    {allCountries.filter(c => c.label.toLowerCase().includes(searchSell.toLowerCase())).map(c => (
                                        <div 
                                            key={c.value} onClick={() => { toggleCountry('selling', c.value); setSearchSell(""); }}
                                            className={`px-3 py-2 text-[13px] cursor-pointer hover:bg-[#2271b1] hover:text-white flex justify-between items-center ${data.generalConfig.sellingCountries.includes(c.value) ? 'bg-[#f0f0f1]' : ''}`}
                                        >
                                            {c.label} {data.generalConfig.sellingCountries.includes(c.value) && <Check size={14}/>}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </td>
                </tr>
            )}

            {/* 2. SHIPPING LOCATIONS */}
            <tr className="border-b border-[#f0f0f1]">
                <th className={thClass}>Shipping location(s)</th>
                <td className={tdClass}>
                    <select 
                        name="conf_shipping_location"
                        value={data.generalConfig.shippingLocation}
                        onChange={(e) => updateNestedData('generalConfig', 'shippingLocation', e.target.value)}
                        className={selectClass}
                    >
                        <option value="all_selling">Ship to all countries you sell to</option>
                        <option value="all">Ship to all countries</option>
                        <option value="specific">Ship to specific countries only</option>
                        <option value="disabled">Disable shipping & shipping calculations</option>
                    </select>
                </td>
            </tr>

            {data.generalConfig.shippingLocation === 'specific' && (
                <tr className="border-b border-[#f0f0f1]">
                    <th className={thClass}>Ship to specific countries</th>
                    <td className={tdClass}>
                        <div className="relative max-w-[400px]" ref={shipWrapperRef}>
                            <div onClick={() => setShipDropdownOpen(true)} className={`${inputClass} min-h-[36px] flex flex-wrap gap-1 cursor-text h-auto py-1`}>
                                {data.generalConfig.shippingCountries.map((code: string) => {
                                    const country = allCountries.find(c => c.value === code);
                                    return (
                                        <span key={code} className="bg-[#f0f0f1] border border-[#c3c4c7] text-[#3c434a] text-xs px-2 py-0.5 rounded-[3px] flex items-center gap-1">
                                            {country?.label} <X size={12} className="cursor-pointer hover:text-[#d63638]" onClick={(e) => removeTag('shipping', code, e)}/>
                                        </span>
                                    );
                                })}
                                <input 
                                    value={searchShip} onChange={(e) => setSearchShip(e.target.value)}
                                    placeholder={data.generalConfig.shippingCountries.length === 0 ? "Select countries..." : ""}
                                    className="flex-1 outline-none text-[14px] min-w-[100px] bg-transparent py-0.5 text-[#2c3338]"
                                    onFocus={() => setShipDropdownOpen(true)}
                                />
                            </div>
                            
                            {shipDropdownOpen && (
                                <div className="absolute z-50 top-full left-0 w-full bg-white border border-[#8c8f94] mt-1 max-h-[250px] overflow-y-auto shadow-md rounded-[3px]">
                                    {allCountries.filter(c => c.label.toLowerCase().includes(searchShip.toLowerCase())).map(c => (
                                        <div 
                                            key={c.value} onClick={() => { toggleCountry('shipping', c.value); setSearchShip(""); }}
                                            className={`px-3 py-2 text-[13px] cursor-pointer hover:bg-[#2271b1] hover:text-white flex justify-between items-center ${data.generalConfig.shippingCountries.includes(c.value) ? 'bg-[#f0f0f1]' : ''}`}
                                        >
                                            {c.label} {data.generalConfig.shippingCountries.includes(c.value) && <Check size={14}/>}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </td>
                </tr>
            )}

            {/* 3. DEFAULT CUSTOMER LOCATION */}
            <tr className="border-b border-[#f0f0f1]">
                <th className={thClass}>Default customer location</th>
                <td className={tdClass}>
                    <select 
                        name="conf_customer_location"
                        value={data.generalConfig.defaultCustomerLocation}
                        onChange={(e) => updateNestedData('generalConfig', 'defaultCustomerLocation', e.target.value)}
                        className={selectClass}
                    >
                        <option value="no_address">No location by default</option>
                        <option value="shop_base">Shop country/region</option>
                        <option value="geoip">Geolocate</option>
                        <option value="geoip_address">Geolocate (with page caching support)</option>
                    </select>
                </td>
            </tr>

            {/* 4. ENABLE REVIEWS & GUEST CHECKOUT */}
            <tr className="border-b border-[#f0f0f1]">
                <th className={thClass}>Enable Reviews</th>
                <td className={tdClass}>
                    <label className="flex items-start gap-2 cursor-pointer mt-1">
                        <input 
                            type="checkbox" 
                            name="enable_reviews"
                            value="true" // For formData match
                            checked={data.generalConfig.enableReviews} 
                            onChange={(e) => updateNestedData('generalConfig', 'enableReviews', e.target.checked)} 
                            className={checkboxClass}
                        />
                        <span>Enable product reviews <br/><span className={descClass}>Allow customers to leave reviews on products.</span></span>
                    </label>
                </td>
            </tr>
            <tr>
                <th className={thClass}>Guest Checkout</th>
                <td className={tdClass}>
                    <label className="flex items-start gap-2 cursor-pointer mt-1">
                        <input 
                            type="checkbox" 
                            name="enable_guest_checkout"
                            value="true"
                            checked={data.generalConfig.enableGuestCheckout} 
                            onChange={(e) => updateNestedData('generalConfig', 'enableGuestCheckout', e.target.checked)} 
                            className={checkboxClass}
                        />
                        <span>Enable guest checkout <br/><span className={descClass}>Allow customers to place orders without an account.</span></span>
                    </label>
                </td>
            </tr>
        </>
    );
}