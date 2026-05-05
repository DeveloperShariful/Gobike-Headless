//app/(backend)/admin/settings/_components/emails/TemplateEditModal.tsx

"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { updateEmailTemplate } from "@/app/(backend)/action/settings/emails/email-templates";
import { EmailTemplate } from "../types";
import RichTextEditor from "./RichTextEditor"; // Ensure path matches your editor

interface Props {
  template: EmailTemplate;
  open: boolean;
  onClose: () => void;
}

const AVAILABLE_VARIABLES = [
    { key: "{customer_name}", desc: "Customer's full name" },
    { key: "{order_number}", desc: "Order ID (e.g. #1001)" },
    { key: "{total_amount}", desc: "Order total with currency" },
    { key: "{payment_method}", desc: "Payment gateway name" },
    { key: "{tracking_number}", desc: "Shipping tracking code" },
    { key: "{courier}", desc: "Shipping carrier name" },
    { key: "{shipping_address}", desc: "Full shipping address" },
    { key: "{billing_address}", desc: "Full billing address" },
    { key: "{order_date}", desc: "Date of purchase" },
];

export default function TemplateEditModal({ template, open, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState(template.content || "");
  const [copiedVar, setCopiedVar] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set("content", content);
    
    const isEnabledChecked = (e.currentTarget.elements.namedItem('isEnabled') as HTMLInputElement)?.checked;
    formData.set("isEnabled", String(isEnabledChecked || false));

    const res = await updateEmailTemplate(formData);
    if (res.success) {
        toast.success("Template updated successfully");
        onClose();
    } else {
        toast.error("Failed to update template");
    }
    setLoading(false);
  };

  const handleCopy = (key: string) => {
      navigator.clipboard.writeText(key);
      setCopiedVar(key);
      toast.success(`Copied ${key}`);
      setTimeout(() => setCopiedVar(null), 1500);
  };

  const inputClass = "w-full border border-[#8c8f94] rounded-[3px] px-3 py-1.5 text-[14px] text-[#2c3338] shadow-[inset_0_1px_2px_rgba(0,0,0,0.07)] focus:border-[#2271b1] outline-none bg-white";

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-[#f0f0f1] w-full max-w-[1000px] max-h-[90vh] flex flex-col rounded-sm shadow-xl overflow-hidden border border-[#c3c4c7]">
        
        {/* Header */}
        <div className="bg-white px-6 py-4 border-b border-[#c3c4c7] flex justify-between items-center shrink-0">
            <div>
                <h2 className="text-[18px] font-semibold text-[#1d2327] m-0">Edit Template: {template.name}</h2>
                <span className="text-[12px] text-[#646970]">Trigger Event: {template.triggerEvent}</span>
            </div>
            <button onClick={onClose} className="text-[#646970] hover:text-red-500 text-[20px] leading-none">&times;</button>
        </div>
        
        {/* Body */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
            
            {/* Form Editor */}
            <div className="flex-1 overflow-y-auto p-6 bg-white custom-scrollbar">
                <form id="template-form" onSubmit={handleSubmit} className="space-y-5">
                    <input type="hidden" name="id" value={template.id} />
                    
                    <div className="flex items-center gap-3 bg-[#f0f0f1] p-3 border border-[#c3c4c7] rounded-sm">
                        <input type="checkbox" name="isEnabled" id="isEnabled" defaultChecked={template.isEnabled} className="w-4 h-4 rounded-[3px] border-[#8c8f94] text-[#2271b1] focus:ring-[#2271b1]"/>
                        <label htmlFor="isEnabled" className="text-[14px] font-semibold text-[#1d2327] cursor-pointer">Enable this automated email</label>
                    </div>

                    <div>
                        <label className="block text-[13px] font-bold text-[#3c434a] mb-1">Email Subject Line</label>
                        <input name="subject" defaultValue={template.subject} className={inputClass} placeholder="e.g. Your Order #{order_number} is Confirmed" />
                    </div>

                    <div>
                        <label className="block text-[13px] font-bold text-[#3c434a] mb-1">Email Heading (H1)</label>
                        <input name="heading" defaultValue={template.heading || ""} className={inputClass} placeholder="e.g. Thanks for your order!" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[12px] font-bold text-[#646970] uppercase mb-1">CC</label>
                            <input name="cc" defaultValue={template.cc?.join(", ") || ""} placeholder="manager@store.com" className={inputClass} />
                        </div>
                        <div>
                            <label className="block text-[12px] font-bold text-[#646970] uppercase mb-1">BCC</label>
                            <input name="bcc" defaultValue={template.bcc?.join(", ") || ""} placeholder="admin@store.com" className={inputClass} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[13px] font-bold text-[#3c434a] mb-2">Email Body Content</label>
                        <div className="h-[350px] border border-[#8c8f94] rounded-sm overflow-hidden">
                            <RichTextEditor value={content} onChange={setContent} label="HTML Content" />
                        </div>
                    </div>
                </form>
            </div>

            {/* Sidebar Variables */}
            <div className="w-full md:w-64 bg-[#f0f0f1] border-t md:border-t-0 md:border-l border-[#c3c4c7] overflow-y-auto p-4 shrink-0">
                <h4 className="text-[12px] font-bold text-[#646970] uppercase mb-3">Dynamic Variables</h4>
                <div className="space-y-2">
                    {AVAILABLE_VARIABLES.map((v) => (
                        <div 
                            key={v.key} 
                            onClick={() => handleCopy(v.key)}
                            className="p-2 bg-white border border-[#c3c4c7] rounded-sm cursor-pointer hover:border-[#2271b1] transition-all"
                        >
                            <code className="text-[11px] font-bold text-[#2271b1] block">{v.key}</code>
                            <p className="text-[11px] text-[#646970] m-0 leading-tight mt-1">{v.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#c3c4c7] bg-[#f0f0f1] flex justify-end gap-3 shrink-0">
            <button type="button" onClick={onClose} className="px-4 py-[5px] text-[13px] font-semibold text-[#2271b1] border border-[#2271b1] rounded-[3px] bg-white hover:bg-[#f6f7f7]">Cancel</button>
            <button type="submit" form="template-form" disabled={loading} className="bg-[#2271b1] border border-[#2271b1] text-white px-4 py-[5px] text-[13px] font-semibold rounded-[3px] shadow-[0_1px_0_#2271b1] hover:bg-[#135e96] disabled:opacity-50">
                {loading ? "Saving..." : "Save Template"}
            </button>
        </div>

      </div>
    </div>
  );
}