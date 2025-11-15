// app/account/layout.tsx
import { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import styles from './layout.module.css';
import AccountSidebar from './AccountSidebar'; // ক্লায়েন্ট সাইডবার ইম্পোর্ট

// ★★★ সমাধান: Server Action-কে অবশ্যই Server Component-এর ভেতরে রাখতে হবে ★★★
async function logoutAction() {
  'use server'; // এখানে এটি রাখা সঠিক
  const cookieStore = await cookies();
  cookieStore.delete('auth-token');
  cookieStore.delete('refresh-token');
  redirect('/login');
}

export default async function AccountLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('auth-token');

  if (!authToken) {
    redirect('/login');
  }

  return (
    <div className={styles.container}>
      
      {/* ★★★ সমাধান: logoutAction-কে prop হিসেবে পাস করা ★★★ */}
      <AccountSidebar logoutAction={logoutAction} />

      <main className={styles.content}>
        {children}
      </main>
    </div>
  );
}