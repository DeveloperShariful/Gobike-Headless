//app/(backend)/admin/settings/_components/emails/TemplateList.tsx

"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { syncEmailTemplates } from "@/app/(backend)/action/settings/emails/email-templates";
import { EmailTemplate } from "../types";
import TemplateEditModal from "./TemplateEditModal"; // Edit Modal Import

interface Props {
  templates: EmailTemplate[];
  refreshData: () => void;
}

export default function TemplateList({ templates, refreshData }: Props) {
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    const res = await syncEmailTemplates();
    
    if (res.success) {
        await refreshData();
        toast.success("Templates synced successfully");
    } else {
        toast.error("Failed to sync templates");
    }
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const btnClass = "bg-white border border-[#2271b1] text-[#2271b1] px-3 py-1 text-[13px] font-semibold rounded-[3px] hover:bg-[#f6f7f7] focus:outline-none transition-colors disabled:opacity-50";

  if (!templates || templates.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center p-12 bg-white border border-[#c3c4c7] rounded-sm text-[#646970]">
            <p className="font-medium text-[14px]">No templates found.</p>
            <button 
                onClick={handleRefresh} 
                disabled={isRefreshing}
                className={`mt-4 ${btnClass}`}
            >
                {isRefreshing ? "Syncing..." : "Initialize Templates"}
            </button>
        </div>
    );
  }

  return (
    <div className="space-y-4 max-w-full">
        <div className="flex items-center justify-between pb-2 border-b border-[#c3c4c7] mb-4">
            <span className="text-[14px] font-medium text-[#3c434a]">
                Total Templates: {templates.length}
            </span>
            <button 
                onClick={handleRefresh}
                disabled={isRefreshing}
                className={btnClass}
            >
                {isRefreshing ? "Syncing..." : "Sync & Refresh"}
            </button>
        </div>

        <table className="w-full text-left text-[14px] text-[#3c434a] bg-white border border-[#c3c4c7] rounded-sm shadow-sm">
            <thead className="bg-[#f0f0f1] border-b border-[#c3c4c7]">
                <tr>
                    <th className="py-2 px-4 font-semibold text-[#1d2327]">Template Name</th>
                    <th className="py-2 px-4 font-semibold text-[#1d2327]">Trigger Event</th>
                    <th className="py-2 px-4 font-semibold text-[#1d2327]">Status</th>
                    <th className="py-2 px-4 font-semibold text-[#1d2327] text-right">Actions</th>
                </tr>
            </thead>
            <tbody>
                {templates.map((template, index) => (
                    <tr key={template.id} className={index !== templates.length - 1 ? "border-b border-[#f0f0f1]" : ""}>
                        <td className="py-3 px-4">
                            <strong className="text-[#2271b1] block">{template.name}</strong>
                            <span className="text-[12px] text-[#646970] mt-1 inline-block">Subject: {template.subject}</span>
                        </td>
                        <td className="py-3 px-4">
                            <span className="text-[11px] font-mono bg-[#f0f0f1] px-2 py-0.5 rounded border border-[#c3c4c7] text-[#1d2327]">
                                {template.triggerEvent}
                            </span>
                        </td>
                        <td className="py-3 px-4">
                            {template.isEnabled ? (
                                <span className="text-[11px] font-semibold text-green-700 bg-green-50 px-2 py-0.5 border border-green-200 rounded">Active</span>
                            ) : (
                                <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 border border-slate-200 rounded">Disabled</span>
                            )}
                        </td>
                        <td className="py-3 px-4 text-right">
                            <button 
                                onClick={() => setEditingTemplate(template)}
                                className={btnClass}
                            >
                                Edit
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>

        {editingTemplate && (
            <TemplateEditModal 
                template={editingTemplate} 
                open={!!editingTemplate} 
                onClose={() => { 
                    setEditingTemplate(null); 
                    refreshData(); 
                }} 
            />
        )}
    </div>
  );
}