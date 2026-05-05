//app/(frontend)/layout.tsx

import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CompareProvider } from "@/context/CompareContext";
import FloatingCompareBar from "@/components/FloatingCompareBar";
import { CartProvider } from "@/context/CartContext";

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  
  // Organization Schema (শুধুমাত্র ফ্রন্টএন্ডে লোড হবে)
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': 'https://gobike.au/#organization',
    name: 'GoBike Australia',
    url: 'https://gobike.au',
    logo: {
      '@type': 'ImageObject',
      url: 'https://gobikes.au/wp-content/uploads/2025/06/cropped-GOBIKE-Electric-Bike-for-kids-1.webp',
      width: 112,
      height: 112
    },
    description: "Australia's top-rated electric balance bikes for kids aged 2-16.",
    email: "gobike@gobike.au", 
    telephone: "+61-426-067-277",
    address: {
      '@type': 'PostalAddress',
      streetAddress: '52 Bligh Ave ', 
      addressLocality: 'Camden south',
      addressRegion: 'NSW',
      postalCode: '2570',
      addressCountry: 'AU'
    },
    sameAs: [
      'https://www.facebook.com/Go-Bike-104997195659873',
      'https://www.instagram.com/gobikeoz/',
      'https://www.youtube.com/@Gobike-r7b'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+61-426-067-277',
      contactType: 'customer service',
      areaServed: 'AU',
      availableLanguage: 'en-AU'
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <CartProvider>
        <CompareProvider>
          <TopBar />
          <Header />
          <main>
            {children}
          </main>
          <FloatingCompareBar />
        </CompareProvider>
        <Footer />
      </CartProvider>
    </>
  );
}