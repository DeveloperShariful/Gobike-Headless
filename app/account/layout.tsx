// app/account/layout.tsx

import { ReactNode } from 'react';
import AccountSidebar from './AccountSidebar';

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col lg:flex-row max-w-[1200px] mx-auto my-4 lg:my-8 gap-6 lg:gap-8 px-0 lg:px-4 items-start">
      <AccountSidebar />

      <main className="flex-1 p-6 lg:p-8 bg-white rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.05)] w-full">
        {children}
      </main>
    </div>
  );
}