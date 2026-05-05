//app/(backend)/admin/settings/_components/emails/BrandingPreview.tsx

"use client";

interface BrandingPreviewProps {
  logo?: string | null;
  baseColor: string;
  bgColor: string;
  bodyColor: string;
  footerText: string;
}

export default function BrandingPreview({ logo, baseColor, bgColor, bodyColor, footerText }: BrandingPreviewProps) {
  return (
    <div className="sticky top-6 border border-[#c3c4c7] bg-white rounded-sm shadow-sm overflow-hidden">
      <div className="bg-[#f0f0f1] px-4 py-3 border-b border-[#c3c4c7]">
        <h3 className="text-[13px] font-semibold text-[#1d2327] uppercase">Live Email Preview</h3>
      </div>
      
      <div className="p-4">
        {/* Email Container (Simulating the Email HTML) */}
        <div 
            className="border border-slate-200 rounded-sm overflow-hidden text-[13px]"
            style={{ backgroundColor: bgColor || "#f7f7f7", padding: "20px" }}
        >
            {/* Email Body */}
            <div 
                className="max-w-[300px] mx-auto rounded shadow-sm overflow-hidden"
                style={{ backgroundColor: bodyColor || "#ffffff" }}
            >
                {/* Header / Logo */}
                <div className="p-4 text-center border-b border-slate-100 min-h-[60px] flex items-center justify-center bg-white">
                    {logo ? (
                        <img src={logo} alt="Logo" className="max-h-[40px] max-w-full object-contain" />
                    ) : (
                        <span className="font-bold text-slate-300">STORE LOGO</span>
                    )}
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                    <h2 className="text-[16px] font-bold m-0" style={{ color: baseColor || "#2271b1" }}>
                        Hello Customer,
                    </h2>
                    <p className="text-[#3c434a] text-[12px] leading-relaxed m-0 mt-2">
                        This is a sample text to show how your emails will look to customers. 
                        Your order <strong>#1001</strong> has been successfully placed.
                    </p>
                    
                    {/* Primary Button */}
                    <div className="py-3 text-center mt-2">
                        <span 
                            className="inline-block text-white px-4 py-2 rounded-[3px] text-[12px] font-bold cursor-pointer"
                            style={{ backgroundColor: baseColor || "#2271b1" }}
                        >
                            View Order
                        </span>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-[#f0f0f1] p-3 text-center border-t border-slate-100">
                    <p className="text-[11px] text-[#646970] m-0 leading-tight">
                        {footerText || "© 2025 Store Name. All rights reserved."}
                    </p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}