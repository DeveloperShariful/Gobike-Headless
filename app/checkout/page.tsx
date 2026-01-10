//app/checkout/page.tsx

import CheckoutClient from './CheckoutClient';

interface PaymentGateway {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

async function getPaymentGateways(): Promise<PaymentGateway[]> {
  const url = `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wc/v3/payment_gateways`;
  const consumerKey = process.env.WC_CONSUMER_KEY;
  const consumerSecret = process.env.WC_CONSUMER_SECRET;

  if (!consumerKey || !consumerSecret) {
    console.error('CRITICAL ERROR: WooCommerce API credentials are not set in .env file.');
    return [];
  }

  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64'),
      },
      next: { revalidate: 0 } 
    });

    if (!response.ok) {
      console.error('Failed to fetch payment gateways from WooCommerce:', await response.text());
      return [];
    }
    
    const gateways: PaymentGateway[] = await response.json();
    return gateways.filter(gateway => gateway.enabled);

  } catch (error) {
    console.error('An error occurred while fetching payment gateways:', error);
    return [];
  }
}

export default async function CheckoutPage() {
  const paymentGateways = await getPaymentGateways();
  return (
    // Tailwind applied here replacing .pageContainer and .container
    <div className="w-full p-4 md:p-8 bg-[#f8f9fa]">
      <div className="w-full max-w-full mx-auto relative overflow-x-hidden">
        <CheckoutClient paymentGateways={paymentGateways} />
      </div>
    </div>
  );
}