//app/affiliate/layout.tsx

import AffiliateSidebar from './AffiliateSidebar';
import { cookies } from 'next/headers';
import { AUTH_COOKIE_NAME } from '@/lib/constants';
import { redirect } from 'next/navigation';

export default async function AffiliateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ১. সার্ভার সাইড সিকিউরিটি চেক
  // কেউ লগইন না করে URL দিয়ে ড্যাশবোর্ডে ঢুকতে চাইলে তাকে লগইন পেজে পাঠাবো
  const cookieStore = await cookies();
  const secretKey = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!secretKey) {
    redirect('/login?next=/affiliate/dashboard');
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8 md:py-12">
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
        
        {/* Left Sidebar (Fixed width on desktop) */}
        <aside className="lg:w-[260px] flex-shrink-0">
          <AffiliateSidebar />
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 bg-white rounded-lg">
          {children}
        </main>

      </div>
    </div>
  );
}