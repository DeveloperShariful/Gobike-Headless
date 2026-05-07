//app/(backend)/admin/users/add-user/page.tsx

import UserFormClient from '../[id]/UserFormClient';

export const dynamic = 'force-dynamic';

export default function AddUserPage() {
  return (
    <div className="w-full px-4 sm:px-6 pb-10 pt-4">
      
      {/* WordPress Style Header */}
      <div className="mb-4">
        <h1 className="text-[23px] font-normal text-[#1d2327]">Add New User</h1>
        <p className="text-[13px] text-[#646970] mt-1">Create a brand new user and add them to this site.</p>
      </div>

      <UserFormClient initialData={null} />

    </div>
  );
}