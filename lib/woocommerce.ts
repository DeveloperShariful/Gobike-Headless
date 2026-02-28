// File: lib/woocommerce.ts

const WC_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL;
const CK = process.env.WC_CONSUMER_KEY;
const CS = process.env.WC_CONSUMER_SECRET;

if (!WC_URL || !CK || !CS) {
  throw new Error('WooCommerce environment variables are missing.');
}

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
interface RequestData {
  [key: string]: string | number | boolean | null | undefined | object;
}

export async function wooCommerceRequest<T>(
  endpoint: string,
  method: RequestMethod = 'GET',
  data?: RequestData
): Promise<T> {
  
  const cleanUrl = WC_URL!.replace(/\/$/, ''); 
  const cleanEndpoint = endpoint.replace(/^\//, ''); 
  const url = new URL(`${cleanUrl}/wp-json/wc/v3/${cleanEndpoint}`);

  if (method === 'GET' && data) {
    Object.keys(data).forEach((key) => {
      const value = data[key];
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  const auth = Buffer.from(`${CK}:${CS}`).toString('base64');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': `Basic ${auth}`,
    'User-Agent': 'NextJS-WooCommerce-Client/1.0', 
  };

  const fetchOptions: RequestInit = {
    method,
    headers,
    cache: 'no-store',
  };
  if (method !== 'GET' && data) {
    fetchOptions.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url.toString(), fetchOptions);
    const responseData = await response.json();
    if (!response.ok) {
      throw new Error(
        responseData.message || 
        `WooCommerce API Error: ${response.status} ${response.statusText}`
      );
    }
    return responseData as T;

  } catch (error) {
    console.error(`[WooCommerce API] Failed fetching ${endpoint}:`, error);
    throw error; 
  }
}