//app/warranty/page.tsx

import type { Metadata } from 'next';
import WarrantyClient from './WarrantyClient';

// --- ADVANCED SEO METADATA ---
export const metadata: Metadata = {
  title: '24-Month Kids Electric Bike & E-Bike Warranty | GoBike Australia',
  description: 'Ride with 100% confidence. Explore GoBike Australia\'s industry-leading 24-month kids electric bike warranty. Covering ebike motors, batteries, and frames.',
  keywords: [
    'kids electric bike warranty', 'electric bike guarantee', 'ebike return policy Australia', 
    'kids ebike repair', 'electric dirt bike warranty', 'ebike maintenance guide', 
    'GoBike customer support', 'electric balance bike warranty'
  ],
  alternates: {
    canonical: 'https://gobike.au/warranty',
  },
  openGraph: {
    title: '24-Month Kids Electric Bike & E-Bike Warranty | GoBike',
    description: 'Australia’s toughest kids electric bikes, backed by the best 24-month warranty in the business. Covering motors, frames, and batteries.',
    url: 'https://gobike.au/warranty',
    siteName: 'GoBike Australia',
    images: [
      {
        url: 'https://gobikes.au/wp-content/uploads/2025/02/My-4yo-loves-it-and-the-training-wheels-are-great-for-his-confidence.webp', 
        width: 1200,
        height: 630,
        alt: 'GoBike Australia Premium Electric Balance Bike Warranty',
      }
    ],
    locale: 'en_AU',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '24-Month Kids Electric Bike & E-Bike Warranty | GoBike',
    description: 'Ride hard, ride safe. We have got your back for 2 full years with our premium e-bike warranty.',
  }
};

export default function WarrantyPage() {
  // --- EXTENDED FAQ SCHEMA FOR GOOGLE RICH SNIPPETS ---
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How long is the GoBike warranty?",
        "acceptedAnswer": { "@type": "Answer", "text": "We offer an industry-leading 24-month warranty on the main alloy frame, suspension forks, and brushless rear hub motors. We also provide a 12-month warranty on the lithium-ion battery and electronics." }
      },
      {
        "@type": "Question",
        "name": "Is the warranty transferable to a second owner?",
        "acceptedAnswer": { "@type": "Answer", "text": "No, the GoBike warranty is only valid for the original purchaser and is non-transferable to protect against second-hand modifications." }
      },
      {
        "@type": "Question",
        "name": "Who pays for shipping on warranty parts?",
        "acceptedAnswer": { "@type": "Answer", "text": "If a part is deemed defective under warranty within the first 6 months, GoBike covers standard shipping for the replacement part. After 6 months, the customer is responsible for shipping costs." }
      },
      {
        "@type": "Question",
        "name": "Do spare parts for wear and tear get free shipping?",
        "acceptedAnswer": { "@type": "Answer", "text": "Yes! When you buy replacement parts for normal wear and tear items (like Kenda Tires, inner tubes, or brake pads) from our shop, we offer free shipping." }
      },
      {
        "@type": "Question",
        "name": "Are Star Union hydraulic brakes covered?",
        "acceptedAnswer": { "@type": "Answer", "text": "The hydraulic brake calipers and levers (including Star Union models on our 20 and 24-inch bikes) are covered for 12 months against factory leaks. Brake pads are wear and tear items and are not covered." }
      }
    ]
  };

  return (
    <>
      {/* Inject SEO Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      
      {/* Render the Client UI */}
      <WarrantyClient />
    </>
  );
}