//app/(backend)/admin/settings/_components/emails/RichTextEditor.tsx

"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css"; 
import { Code, Eye, Type, Copy, Check } from "lucide-react";

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    label?: string;
}

export default function RichTextEditor({ value, onChange, label }: RichTextEditorProps) {
    const ReactQuill = useMemo(() => dynamic(() => import("react-quill-new"), { ssr: false }), []);
    const [activeTab, setActiveTab] = useState<"visual" | "code" | "preview">("visual");
    const [copied, setCopied] = useState(false);

    const modules = useMemo(() => ({
        toolbar: [
            [{ header: [1, 2, 3, false] }],
            ["bold", "italic", "underline", "strike", "blockquote"],
            [{ list: "ordered" }, { list: "bullet" }],
            [{ color: [] }, { background: [] }],
            [{ align: [] }],
            ["link", "image"],
            ["clean"],
        ],
    }), []);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-white flex flex-col h-full overflow-hidden">
            
            <div className="flex justify-between items-center px-3 py-2 border-b border-[#c3c4c7] bg-[#f0f0f1]">
                <span className="font-semibold text-[12px] text-[#3c434a] uppercase tracking-wide">{label || "Email Content"}</span>
                
                <div className="flex gap-1">
                    <button
                        type="button"
                        onClick={() => setActiveTab("visual")}
                        className={`flex items-center gap-1 px-2 py-1 text-[11px] font-semibold border rounded-[3px] transition ${
                            activeTab === "visual" ? "bg-white border-[#8c8f94] text-[#1d2327]" : "border-transparent text-[#2271b1] hover:text-[#135e96]"
                        }`}
                    >
                        <Type size={12} /> Visual
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab("code")}
                        className={`flex items-center gap-1 px-2 py-1 text-[11px] font-semibold border rounded-[3px] transition ${
                            activeTab === "code" ? "bg-white border-[#8c8f94] text-[#1d2327]" : "border-transparent text-[#2271b1] hover:text-[#135e96]"
                        }`}
                    >
                        <Code size={12} /> HTML
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab("preview")}
                        className={`flex items-center gap-1 px-2 py-1 text-[11px] font-semibold border rounded-[3px] transition ${
                            activeTab === "preview" ? "bg-white border-[#8c8f94] text-[#1d2327]" : "border-transparent text-[#2271b1] hover:text-[#135e96]"
                        }`}
                    >
                        <Eye size={12} /> Preview
                    </button>
                </div>
            </div>

            <div className="relative flex-1 min-h-[300px]">
                {activeTab === "visual" && (
                    <ReactQuill 
                        theme="snow" 
                        value={value} 
                        onChange={onChange} 
                        modules={modules}
                        className="h-full flex flex-col [&>.ql-container]:flex-1 [&>.ql-container]:border-0 [&>.ql-toolbar]:border-0 [&>.ql-toolbar]:border-b [&>.ql-toolbar]:border-[#c3c4c7] [&>.ql-editor]:text-[14px]"
                    />
                )}

                {activeTab === "code" && (
                    <div className="relative h-full">
                        <textarea
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            className="w-full h-full p-4 font-mono text-[13px] bg-[#1d2327] text-green-400 outline-none resize-none"
                            spellCheck={false}
                        />
                        <button 
                            type="button"
                            onClick={copyToClipboard}
                            className="absolute top-2 right-2 p-1.5 bg-white/10 hover:bg-white/20 rounded-[3px] text-white transition"
                            title="Copy HTML"
                        >
                            {copied ? <Check size={14}/> : <Copy size={14}/>}
                        </button>
                    </div>
                )}

                {activeTab === "preview" && (
                    <div className="p-6 h-full overflow-y-auto bg-[#f0f0f1]">
                        <div className="bg-white shadow-sm p-8 max-w-2xl mx-auto border border-[#c3c4c7] min-h-[200px]" dangerouslySetInnerHTML={{ __html: value }} />
                    </div>
                )}
            </div>
        </div>
    );
}