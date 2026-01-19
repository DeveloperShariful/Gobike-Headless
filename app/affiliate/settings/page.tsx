//app/affiliate/settings/page.tsx

import { IoSettingsOutline, IoInformationCircleOutline } from "react-icons/io5";

export default function SettingsPage() {
  return (
    <div className="p-1 md:p-1">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-500 text-sm">Manage your account preferences.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-8">
        <div className="flex flex-col md:flex-row items-start gap-4 text-gray-600">
             <div className="text-blue-500 mt-1">
                <IoInformationCircleOutline size={28} />
             </div>
             <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Account Management</h3>
                <p className="text-sm leading-relaxed">
                    You have no permissions to edit any of the settings. All your account settings are managed by the program administrator.
                    <br />
                    If you need to update your payment email or personal details, please contact support.
                </p>
             </div>
        </div>
      </div>
    </div>
  );
}