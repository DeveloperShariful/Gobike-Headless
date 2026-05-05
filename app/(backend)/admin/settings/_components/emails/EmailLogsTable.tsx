//app/(backend)/admin/settings/_components/emails/EmailLogsTable.tsx

"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { EmailLog } from "../types";
import { deleteEmailLogs, cleanupOldLogs } from "@/app/(backend)/action/settings/emails/delete-logs";

interface Props {
  logs: EmailLog[];
  meta: { total: number; pages: number };
  currentPage: number;
  onPageChange: (page: number) => void;
  refreshData: () => void;
}

export default function EmailLogsTable({ logs, meta, currentPage, onPageChange, refreshData }: Props) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const toggleAll = (checked: boolean) => {
    setSelectedIds(checked ? logs.map(log => log.id) : []);
  };

  const toggleOne = (id: string, checked: boolean) => {
    setSelectedIds(prev => checked ? [...prev, id] : prev.filter(item => item !== id));
  };

  const handleDeleteSelected = async () => {
    if (!confirm(`Delete ${selectedIds.length} logs?`)) return;
    setIsDeleting(true);
    const res = await deleteEmailLogs(selectedIds);
    if (res.success) {
        toast.success("Logs deleted");
        setSelectedIds([]);
        refreshData();
    } else toast.error("Failed to delete");
    setIsDeleting(false);
  };

  const handleRefreshAndCleanup = async () => {
    setIsRefreshing(true);
    const cleanupRes = await cleanupOldLogs();
    if (cleanupRes.success && cleanupRes.count && cleanupRes.count > 0) toast.success(`Auto-cleaned ${cleanupRes.count} logs`);
    await refreshData();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const btnClass = "bg-white border border-[#2271b1] text-[#2271b1] px-3 py-1 text-[13px] font-semibold rounded-[3px] hover:bg-[#f6f7f7] disabled:opacity-50";

  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <div className="flex justify-between items-center bg-white p-3 border border-[#c3c4c7] rounded-sm shadow-sm">
        <div>
            <h3 className="text-[14px] font-semibold text-[#1d2327] m-0">Delivery Logs ({meta.total})</h3>
            <p className="text-[12px] text-[#646970] m-0 mt-1">Logs older than 30 days are cleaned automatically on refresh.</p>
        </div>
        <div className="flex gap-2">
            {selectedIds.length > 0 && (
                <button onClick={handleDeleteSelected} disabled={isDeleting} className="bg-red-50 border border-red-200 text-red-600 px-3 py-1 text-[13px] font-semibold rounded-[3px] hover:bg-red-100 disabled:opacity-50">
                    Delete ({selectedIds.length})
                </button>
            )}
            <button onClick={handleRefreshAndCleanup} disabled={isRefreshing} className={btnClass}>
                {isRefreshing ? "Syncing..." : "Refresh & Clean"}
            </button>
        </div>
      </div>

      {/* Table */}
      <table className="w-full text-left text-[13px] text-[#3c434a] bg-white border border-[#c3c4c7] rounded-sm shadow-sm">
        <thead className="bg-[#f0f0f1] border-b border-[#c3c4c7]">
            <tr>
                <th className="py-2 px-3 w-[40px] text-center">
                    <input type="checkbox" checked={selectedIds.length === logs.length && logs.length > 0} onChange={(e) => toggleAll(e.target.checked)} className="rounded-[3px] border-[#8c8f94] text-[#2271b1] focus:ring-0"/>
                </th>
                <th className="py-2 px-3 font-semibold text-[#1d2327]">Date</th>
                <th className="py-2 px-3 font-semibold text-[#1d2327]">Recipient</th>
                <th className="py-2 px-3 font-semibold text-[#1d2327]">Subject</th>
                <th className="py-2 px-3 font-semibold text-[#1d2327]">Status</th>
            </tr>
        </thead>
        <tbody>
            {logs.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-[#646970]">No logs found.</td></tr>
            ) : logs.map((log, index) => (
                <tr key={log.id} className={index !== logs.length - 1 ? "border-b border-[#f0f0f1]" : ""}>
                    <td className="py-2 px-3 text-center">
                        <input type="checkbox" checked={selectedIds.includes(log.id)} onChange={(e) => toggleOne(log.id, e.target.checked)} className="rounded-[3px] border-[#8c8f94] text-[#2271b1] focus:ring-0"/>
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap">{format(new Date(log.createdAt), "MMM d, h:mm a")}</td>
                    <td className="py-2 px-3">{log.recipient}</td>
                    <td className="py-2 px-3 truncate max-w-[200px]">{log.subject}</td>
                    <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${log.status === 'SENT' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {log.status}
                        </span>
                        {log.errorMessage && <p className="text-[11px] text-red-500 m-0 mt-1 truncate max-w-[150px]" title={log.errorMessage}>{log.errorMessage}</p>}
                    </td>
                </tr>
            ))}
        </tbody>
      </table>

      {/* Pagination */}
      {meta.pages > 1 && (
        <div className="flex justify-between items-center mt-4">
            <span className="text-[13px] text-[#646970]">Page {currentPage} of {meta.pages}</span>
            <div className="flex gap-1">
                <button disabled={currentPage <= 1} onClick={() => onPageChange(currentPage - 1)} className={`${btnClass} px-2`}>&laquo; Prev</button>
                <button disabled={currentPage >= meta.pages} onClick={() => onPageChange(currentPage + 1)} className={`${btnClass} px-2`}>Next &raquo;</button>
            </div>
        </div>
      )}
    </div>
  );
}