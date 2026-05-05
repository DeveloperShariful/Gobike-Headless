//app/(backend)/admin/layout.tsx

import type { Metadata } from "next";
import AdminLayoutWrapper from "./_components/AdminLayoutWrapper";

export const metadata: Metadata = {
  title: "Dashboard ‹ GoBike Australia", 
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    }
  },
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AdminLayoutWrapper>
        {children}
    </AdminLayoutWrapper>
  );
}