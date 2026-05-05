// app/account/layout.tsx

import AccountSidebar from './AccountSidebar';

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-[1400px] mx-auto px-6 py-10 md:py-16">
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        
        {/* বাম পাশ (সাইডবার) */}
        <aside className="lg:w-[280px] flex-shrink-0">
          <AccountSidebar />
        </aside>

        {/* ডান পাশ (মেইন কন্টেন্ট) */}
        <main className="flex-1 min-w-0">
          {children}
        </main>

      </div>
    </div>
  );
}