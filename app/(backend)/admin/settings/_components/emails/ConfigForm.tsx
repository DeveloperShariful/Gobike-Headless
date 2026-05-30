//app/(backend)/admin/settings/_components/emails/ConfigForm.tsx

"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { saveEmailConfiguration } from "@/app/actions/backend/settings/emails/email-config";
import { sendTestEmail } from "@/app/actions/backend/settings/emails/send-test-email";

// 🛑 NEW: Vercel Blob Upload ইম্পোর্ট করা হলো
import { upload } from '@vercel/blob/client';

import { EmailConfiguration } from "../../../../types";
import BrandingPreview from "./BrandingPreview"; 

interface Props {
  config: EmailConfiguration | null;
  refreshData: () => void;
}

export default function ConfigForm({ config, refreshData }: Props) {
  const [loading, setLoading] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  
  // 🛑 NEW: লোগো আপলোডের লোডিং স্টেট
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  const [branding, setBranding] = useState({
    headerImage: config?.headerImage || "",
    baseColor: config?.baseColor || "#2271b1",
    backgroundColor: config?.backgroundColor || "#F7F7F7",
    bodyBackgroundColor: config?.bodyBackgroundColor || "#FFFFFF",
    footerText: config?.footerText || "© 2025 GoBike. All rights reserved."
  });

  useEffect(() => {
    if(config) {
        setBranding({
            headerImage: config.headerImage || "",
            baseColor: config.baseColor || "#2271b1",
            backgroundColor: config.backgroundColor || "#F7F7F7",
            bodyBackgroundColor: config.bodyBackgroundColor || "#FFFFFF",
            footerText: config.footerText || ""
        });
    }
  }, [config]);

  // 🛑 NEW: লোগো আপলোড হ্যান্ডলার (Vercel Blob)
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    try {
      const blob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
      });
      
      // আপলোড সফল হলে Vercel এর পাবলিক লিংকটি বক্সে বসিয়ে দেওয়া হচ্ছে
      setBranding({ ...branding, headerImage: blob.url });
      toast.success("Logo uploaded successfully!");
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to upload logo.");
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const isActiveChecked = (e.currentTarget.elements.namedItem('isActive') as HTMLInputElement)?.checked;
    formData.set("isActive", String(isActiveChecked || false));

    const res = await saveEmailConfiguration(formData);
    if (res.success) {
        toast.success(res.message || "Email settings saved");
        refreshData();
    } else {
        toast.error(res.error || "Failed to save settings");
    }
    setLoading(false);
  };

  const handleTestEmail = async () => {
    if (!testEmail) return toast.error("Enter an email address");
    setSendingTest(true);
    const res = await sendTestEmail(testEmail);
    if (res.success) {
        toast.success(res.message || "Test email sent!");
    } else {
        toast.error(res.error || "Failed to send test email");
    }
    setSendingTest(false);
  };

  const heading = "text-[18px] font-semibold text-[#1d2327] mb-2 pt-6";
  const desc = "block text-[#646970] text-[13px] font-normal mt-1";
  
  const table = "w-full text-left text-[14px] text-[#3c434a] mb-8 block sm:table";
  const thClass = "py-[15px] sm:py-[20px] pr-[20px] font-semibold w-full sm:w-[250px] align-top text-left text-[#1d2327] text-[14px] block sm:table-cell";
  const tdClass = "py-[10px] sm:py-[15px] px-[10px] align-top text-[#3c434a] block sm:table-cell";
  
  const inputClass = "w-full max-w-[400px] border border-[#8c8f94] rounded-[3px] px-3 py-1.5 text-[14px] text-[#2c3338] shadow-[inset_0_1px_2px_rgba(0,0,0,0.07)] focus:border-[#2271b1] focus:shadow-[0_0_0_1px_#2271b1] outline-none transition-shadow bg-white";
  const shortInputClass = "w-full sm:w-[150px] border border-[#8c8f94] rounded-[3px] px-3 py-1.5 text-[14px] text-[#2c3338] shadow-[inset_0_1px_2px_rgba(0,0,0,0.07)] focus:border-[#2271b1] focus:shadow-[0_0_0_1px_#2271b1] outline-none transition-shadow bg-white";
  const checkboxClass = "w-4 h-4 rounded-[3px] border-[#8c8f94] text-[#2271b1] focus:ring-[#2271b1] shadow-[inset_0_1px_2px_rgba(0,0,0,0.07)] mt-1 cursor-pointer shrink-0";
  const btnClass = "bg-[#2271b1] border border-[#2271b1] text-white px-4 py-[5px] text-[13px] font-semibold rounded-[3px] shadow-[0_1px_0_#2271b1] hover:bg-[#135e96] focus:outline-none transition-colors cursor-pointer disabled:opacity-50 w-full sm:w-auto";

  return (
    <div className="flex flex-col-reverse xl:grid xl:grid-cols-3 gap-8">
        
        {/* === LEFT COLUMN: SETTINGS FORM === */}
        <div className="xl:col-span-2">
            <form onSubmit={handleSave} className="overflow-hidden">
                
                {/* 1. Sender Options */}
                <h2 className={`${heading} pt-0`}>Sender Options</h2>
                <p className={`${desc} mb-4`}>Set the name and email address that will appear on automated emails.</p>
                <table className={table}>
                    <tbody className="block sm:table-row-group">
                        <tr className="border-b border-[#c3c4c7] sm:border-[#f0f0f1] block sm:table-row">
                            <th className={thClass}>"From" Name</th>
                            <td className={tdClass}>
                                <input name="senderName" defaultValue={config?.senderName || ''} placeholder="e.g. GoBike Store" className={inputClass} />
                            </td>
                        </tr>
                        <tr className="border-b border-[#c3c4c7] sm:border-[#f0f0f1] block sm:table-row">
                            <th className={thClass}>"From" Address</th>
                            <td className={tdClass}>
                                <input name="senderEmail" defaultValue={config?.senderEmail || ''} placeholder="e.g. sales@gobike.au" className={inputClass} />
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* 2. SMTP Settings */}
                <h2 className={heading}>SMTP Configuration</h2>
                <p className={`${desc} mb-4`}>Configure your external email service (like Gmail) for better delivery rates.</p>
                <table className={table}>
                    <tbody className="block sm:table-row-group">
                        <tr className="border-b border-[#c3c4c7] sm:border-[#f0f0f1] block sm:table-row">
                            <th className={thClass}>SMTP Status</th>
                            <td className={tdClass}>
                                <label className="flex items-start sm:items-center gap-2 cursor-pointer mt-1">
                                    <input type="checkbox" name="isActive" id="isActive" defaultChecked={config?.isActive} className={checkboxClass}/>
                                    <span className="text-[14px] leading-tight">Enable SMTP Email Sending</span>
                                </label>
                            </td>
                        </tr>
                        <tr className="border-b border-[#c3c4c7] sm:border-[#f0f0f1] block sm:table-row">
                            <th className={thClass}>SMTP Host & Port</th>
                            <td className={tdClass}>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <input name="smtpHost" defaultValue={config?.smtpHost || ""} placeholder="e.g. smtp.gmail.com" className={`${inputClass} !w-full sm:!w-[240px]`} />
                                    <input name="smtpPort" defaultValue={config?.smtpPort || "587"} placeholder="587" className={shortInputClass} />
                                </div>
                            </td>
                        </tr>
                        <tr className="border-b border-[#c3c4c7] sm:border-[#f0f0f1] block sm:table-row">
                            <th className={thClass}>SMTP Username</th>
                            <td className={tdClass}>
                                <input name="smtpUser" defaultValue={config?.smtpUser || ""} placeholder="email@gmail.com" className={inputClass} />
                            </td>
                        </tr>
                        <tr className="border-b border-[#c3c4c7] sm:border-[#f0f0f1] block sm:table-row">
                            <th className={thClass}>SMTP Password <br/><span className="text-[11px] font-normal text-[#646970]">(App Password)</span></th>
                            <td className={tdClass}>
                                <input name="smtpPassword" type="password" defaultValue={config?.smtpPassword || ""} placeholder="••••••••" className={inputClass} />
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* 3. Branding & Styling */}
                <h2 className={heading}>Email Branding</h2>
                <p className={`${desc} mb-4`}>Customize the colors and logo of your email templates.</p>
                <table className={table}>
                    <tbody className="block sm:table-row-group">
                        <tr className="border-b border-[#c3c4c7] sm:border-[#f0f0f1] block sm:table-row">
                            <th className={thClass}>Header Image URL</th>
                            <td className={tdClass}>
                                {/* 🛑 FIX: Upload Input and URL box together */}
                                <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                                    <input 
                                        name="headerImage" 
                                        value={branding.headerImage} 
                                        onChange={(e) => setBranding({...branding, headerImage: e.target.value})}
                                        placeholder="https://example.com/logo.png" 
                                        className={`${inputClass} !w-full sm:!w-[300px]`}
                                    />
                                    <span className="text-[#646970] text-[12px] font-bold mx-1 hidden sm:inline">OR</span>
                                    <label className="relative cursor-pointer bg-white border border-[#2271b1] text-[#2271b1] px-3 py-1 text-[13px] font-semibold rounded-[3px] hover:bg-[#f6f7f7] transition-colors whitespace-nowrap">
                                        {isUploadingLogo ? "Uploading..." : "Upload Image"}
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            className="hidden" 
                                            onChange={handleLogoUpload}
                                            disabled={isUploadingLogo}
                                        />
                                    </label>
                                </div>
                                <span className={desc}>Paste an image URL or upload directly from your device.</span>
                            </td>
                        </tr>
                        <tr className="border-b border-[#c3c4c7] sm:border-[#f0f0f1] block sm:table-row">
                            <th className={thClass}>Email Colors</th>
                            <td className={tdClass}>
                                <div className="space-y-4 sm:space-y-3">
                                    <div className="flex items-center gap-3">
                                        <span className="text-[13px] w-[100px]">Base Color:</span>
                                        <input type="color" name="baseColor" value={branding.baseColor} onChange={(e) => setBranding({...branding, baseColor: e.target.value})} className="w-8 h-8 p-0 border-0 rounded cursor-pointer shrink-0" />
                                        <span className="text-[12px] font-mono">{branding.baseColor}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[13px] w-[100px]">Background:</span>
                                        <input type="color" name="backgroundColor" value={branding.backgroundColor} onChange={(e) => setBranding({...branding, backgroundColor: e.target.value})} className="w-8 h-8 p-0 border-0 rounded cursor-pointer shrink-0" />
                                        <span className="text-[12px] font-mono">{branding.backgroundColor}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[13px] w-[100px]">Body BG:</span>
                                        <input type="color" name="bodyBackgroundColor" value={branding.bodyBackgroundColor} onChange={(e) => setBranding({...branding, bodyBackgroundColor: e.target.value})} className="w-8 h-8 p-0 border-0 rounded cursor-pointer shrink-0" />
                                        <span className="text-[12px] font-mono">{branding.bodyBackgroundColor}</span>
                                    </div>
                                </div>
                            </td>
                        </tr>
                        <tr className="border-b border-[#c3c4c7] sm:border-transparent block sm:table-row">
                            <th className={thClass}>Footer Text</th>
                            <td className={tdClass}>
                                <textarea 
                                    name="footerText" 
                                    value={branding.footerText} 
                                    onChange={(e) => setBranding({...branding, footerText: e.target.value})} 
                                    className={`${inputClass} min-h-[60px] py-2 w-full`}
                                />
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
        </div>

        {/* === RIGHT COLUMN: PREVIEW & TEST === */}
        <div className="xl:col-span-1 space-y-6 pt-0 xl:pt-6">
            
            <BrandingPreview 
                logo={branding.headerImage}
                baseColor={branding.baseColor}
                bgColor={branding.backgroundColor}
                bodyColor={branding.bodyBackgroundColor}
                footerText={branding.footerText}
            />

            <div className="border border-[#c3c4c7] bg-white rounded-sm shadow-sm overflow-hidden mt-6">
                <div className="bg-[#f0f0f1] px-4 py-3 border-b border-[#c3c4c7]">
                    <h3 className="text-[13px] font-semibold text-[#1d2327] uppercase">Send Test Email</h3>
                </div>
                <div className="p-4">
                    <p className="text-[13px] text-[#646970] mb-3">
                        Verify your SMTP settings before going live.
                    </p>
                    <input 
                        placeholder="Enter recipient email" 
                        value={testEmail}
                        onChange={(e) => setTestEmail(e.target.value)}
                        className={`${inputClass} !w-full mb-3`}
                    />
                    <button 
                        onClick={handleTestEmail} 
                        disabled={sendingTest} 
                        className="w-full bg-white border border-[#2271b1] text-[#2271b1] px-4 py-[5px] text-[13px] font-semibold rounded-[3px] hover:bg-[#f6f7f7] focus:outline-none transition-colors disabled:opacity-50"
                    >
                        {sendingTest ? "Sending..." : "Send Test Email"}
                    </button>
                </div>
            </div>
            
        </div>
    </div>
  );
}