//app/(backend)/admin/settings/_components/emails/EmailsTab.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getEmailLogs } from "@/app/(backend)/action/settings/emails/email-logs";
import { getEmailTemplates } from "@/app/(backend)/action/settings/emails/email-templates"; 

// 🛑 types.ts থেকে রিয়েল টাইপ ইম্পোর্ট
import { EmailTemplate, EmailLog } from "../types";
import { EmailPageData } from "../SettingsClient";

import ConfigForm from "./ConfigForm";
import TemplateList from "./TemplateList";
import EmailLogsTable from "./EmailLogsTable";

export default function EmailsTab({ initialData }: { initialData: EmailPageData }) {
  const router = useRouter();
  const [activeSubTab, setActiveSubTab] = useState<"config" | "templates" | "logs">("config");

  // State Management with Real Types
  const [templates, setTemplates] = useState<EmailTemplate[]>(initialData?.templates || []);
  const [logs, setLogs] = useState<EmailLog[]>(initialData?.logs || []);
  const [logsMeta, setLogsMeta] = useState<{ total: number; pages: number }>(initialData?.logsMeta || { total: 0, pages: 0 });
  const [currentLogPage, setCurrentLogPage] = useState<number>(1);

  // Pagination-এর জন্য নতুন লগ ফেচ করা
  const fetchLogs = async (page: number) => {
    const res = await getEmailLogs(page);
    if (res.success) {
      // API থেকে আসা డేটা EmailLog[] টাইপে কাস্ট করা হচ্ছে
      setLogs(res.logs as EmailLog[]);
      setLogsMeta({ total: res.total, pages: res.pages });
      setCurrentLogPage(page);
    }
  };

  // রিফ্রেশ ডাটা ফাংশন
  const refreshData = async () => {
    router.refresh(); 
    
    const templatesRes = await getEmailTemplates();
    if (templatesRes.success) setTemplates(templatesRes.data as EmailTemplate[]);
    
    await fetchLogs(currentLogPage);
  };

  // WooCommerce Sub-menu styles
  const activeSub = "text-[#1d2327] font-semibold";
  const inactiveSub = "text-[#2271b1] hover:text-[#0a4b78] cursor-pointer transition-colors";

  return (
    <div className="animate-in fade-in">
      
      {/* WordPress subsubsub Style Navigation */}
      <ul className="flex items-center gap-2 text-[13px] mb-6 text-[#646970]">
        <li>
          <span 
            onClick={() => setActiveSubTab("config")} 
            className={activeSubTab === "config" ? activeSub : inactiveSub}
          >
            Configuration & SMTP
          </span> 
          <span className="mx-2">|</span>
        </li>
        <li>
          <span 
            onClick={() => setActiveSubTab("templates")} 
            className={activeSubTab === "templates" ? activeSub : inactiveSub}
          >
            Email Templates
          </span> 
          <span className="mx-2">|</span>
        </li>
        <li>
          <span 
            onClick={() => setActiveSubTab("logs")} 
            className={activeSubTab === "logs" ? activeSub : inactiveSub}
          >
            Email Logs
          </span>
        </li>
      </ul>

      {/* Render Sub-components */}
      <div className="w-full">
        {activeSubTab === "config" && (
          <ConfigForm config={initialData?.config} refreshData={refreshData} />
        )}
        
        {activeSubTab === "templates" && (
          <TemplateList templates={templates} refreshData={refreshData} />
        )}
        
        {activeSubTab === "logs" && (
          <EmailLogsTable 
            logs={logs} 
            meta={logsMeta} 
            currentPage={currentLogPage}
            onPageChange={fetchLogs}
            refreshData={refreshData}
          />
        )}
      </div>

    </div>
  );
}