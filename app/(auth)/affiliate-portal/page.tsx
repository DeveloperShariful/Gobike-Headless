import type { Metadata } from 'next';
import PortalForm from './PortalForm';

export const metadata: Metadata = {
  title: 'Affiliate Portal | GoBike Australia',
  description: 'Login or register for the GoBike Affiliate Portal.',
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: '/affiliate-portal',
  }
};

export default function AffiliatePortalPage() {
  return (
    <main>
      <PortalForm />
    </main>
  );
}