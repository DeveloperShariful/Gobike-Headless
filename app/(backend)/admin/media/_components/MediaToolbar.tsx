// app/(backend)/admin/media/_components/MediaToolbar.tsx

'use client';

import { useState } from 'react';
import { IoListOutline, IoGridOutline, IoTrashOutline, IoSyncOutline } from 'react-icons/io5';
import { syncOldWarrantyMedia } from '@/app/actions/backend/media/media-action'; 

type ToolbarProps = {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  typeFilter: string;
  setTypeFilter: (val: string) => void;
  sourceFilter: string;
  setSourceFilter: (val: string) => void;
  isBulkMode: boolean;
  setIsBulkMode: (val: boolean) => void;
  selectedIds: string[];
  setSelectedIds: (val: string[]) => void;
  handleBulkDelete: () => void;
  isDeletingBulk: boolean;
};

export default function MediaToolbar(props: ToolbarProps) {
  const { 
    searchQuery, setSearchQuery, 
    typeFilter, setTypeFilter, 
    sourceFilter, setSourceFilter, 
    isBulkMode, setIsBulkMode, 
    selectedIds, setSelectedIds, 
    handleBulkDelete, isDeletingBulk 
  } = props;

  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    const res = await syncOldWarrantyMedia();
    setIsSyncing(false);

    if (res.success) {
      alert(`Success! ${res.count} old warranty files have been synced to the Media Library.`);
      window.location.reload(); 
    } else {
      alert('Sync failed: ' + res.message);
    }
  };

  return (
    <div className="bg-white border border-[#c3c4c7] px-4 py-2 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-[13px] shadow-sm mb-6 mx-2 md:mx-0">
      
      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
        <div className="hidden md:flex border border-[#8c8f94] rounded-sm overflow-hidden">
          <button className="bg-white text-[#8c8f94] p-1.5 hover:text-[#2271b1]"><IoListOutline size={18} /></button>
          <button className="bg-[#f0f0f1] text-[#2271b1] p-1.5 border-l border-[#8c8f94]"><IoGridOutline size={18} /></button>
        </div>

        <select 
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-white border border-[#8c8f94] text-[#2c3338] px-2 py-1 rounded-sm focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none"
        >
          <option value="ALL">All media items</option>
          <option value="IMAGE">Images</option>
          <option value="VIDEO">Video</option>
          <option value="DOCUMENT">Documents</option>
        </select>

        <select 
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="bg-white border border-[#8c8f94] text-[#2c3338] px-2 py-1 rounded-sm focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none"
        >
          <option value="ALL">All sources</option>
          <option value="GENERAL">General Uploads</option>
          <option value="WARRANTY">Warranty Claims</option>
          <option value="USER">User Avatars</option>
          <option value="STORE">Store Logos</option>
        </select>

        {!isBulkMode ? (
          <button 
            onClick={() => setIsBulkMode(true)}
            className="border border-[#2271b1] text-[#2271b1] px-3 py-1 rounded-sm hover:bg-[#f6f7f7] bg-white transition-colors"
          >
            Bulk select
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button 
              onClick={() => { setIsBulkMode(false); setSelectedIds([]); }}
              className="border border-[#8c8f94] text-[#2c3338] px-3 py-1 rounded-sm hover:bg-[#f6f7f7] bg-white transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleBulkDelete}
              disabled={selectedIds.length === 0 || isDeletingBulk}
              className="flex items-center gap-1 border border-[#d63638] text-[#d63638] bg-white px-3 py-1 rounded-sm hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              <IoTrashOutline size={14} />
              {isDeletingBulk ? 'Deleting...' : `Delete Selected (${selectedIds.length})`}
            </button>
          </div>
        )}
      </div>

      <div className="w-full md:w-auto flex flex-col md:flex-row items-stretch md:items-center justify-end gap-3">
        
        <button 
          onClick={handleSync}
          disabled={isSyncing}
          className="flex items-center justify-center gap-1 border border-[#2271b1] bg-[#f0f8ff] text-[#2271b1] px-3 py-1 rounded-sm hover:bg-[#e0f0ff] transition-colors disabled:opacity-50"
          title="Import old Warranty Videos into Media Library"
        >
          <IoSyncOutline className={isSyncing ? "animate-spin" : ""} size={16} />
          {isSyncing ? 'Syncing...' : 'Sync Old Data'}
        </button>

        <input 
          type="text" 
          placeholder="Search media..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:w-64 bg-white border border-[#8c8f94] px-3 py-1 rounded-sm focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none text-[#2c3338]"
        />
      </div>
    </div>
  );
}