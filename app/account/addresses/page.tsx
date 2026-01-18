// app/account/addresses/page.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import AddressForm from './AddressForm';
import { AUTH_COOKIE_NAME } from '@/lib/constants';

const GET_ADDRESSES_QUERY = `
query GetAddressesByKey($key: String) {
  customerAddressesByKey(secretKey: $key) {
    billing {
      firstName
      lastName
      address1
      address2
      city
      state
      postcode
      country
      email
      phone
    }
    shipping {
      firstName
      lastName
      address1
      address2
      city
      state
      postcode
      country
    }
  }
}
`;

const UPDATE_ADDRESS_MUTATION = `
mutation UpdateAddresses($key: String!, $billing: CustomerAddressInput!, $shipping: CustomerAddressInput!) {
  updateCustomerByKey(input: {
    secretKey: $key,
    billing: $billing,
    shipping: $shipping
  }) {
    success
  }
}
`;

async function getAddresses(secretKey: string) {
  const endpoint = process.env.WORDPRESS_GRAPHQL_ENDPOINT;
  if (!endpoint) return null;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
          query: GET_ADDRESSES_QUERY,
          variables: { key: secretKey }
      }),
      cache: 'no-store',
    });
    const data = await response.json();
    
    if (data.errors || !data?.data?.customerAddressesByKey) return null;
    return data.data.customerAddressesByKey;

  } catch (error) {
    return null;
  }
}

async function updateAddresses(prevState: any, formData: FormData) {
  'use server';
  const secretKey = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
  if (!secretKey) return { error: 'Not authenticated.' };

  const billingData = {
    firstName: formData.get('billing_firstName'),
    lastName: formData.get('billing_lastName'),
    address1: formData.get('billing_address1'),
    city: formData.get('billing_city'),
    postcode: formData.get('billing_postcode'),
    country: formData.get('billing_country'),
    email: formData.get('billing_email'),
    phone: formData.get('billing_phone'),
  };

  const shippingData = {
    firstName: formData.get('shipping_firstName'),
    lastName: formData.get('shipping_lastName'),
    address1: formData.get('shipping_address1'),
    city: formData.get('shipping_city'),
    postcode: formData.get('shipping_postcode'),
    country: formData.get('shipping_country'),
  };

  const endpoint = process.env.WORDPRESS_GRAPHQL_ENDPOINT;
  if (!endpoint) return { error: 'Server error' };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: UPDATE_ADDRESS_MUTATION,
        variables: { key: secretKey, billing: billingData, shipping: shippingData },
      }),
    });
    const data = await response.json();
    
    if (data.errors) return { error: 'Update failed' };
    
    revalidatePath('/account/addresses');
    return { success: true };
  } catch (error) {
    return { error: 'Network error' };
  }
}

export default async function AccountAddressesPage() {
  const cookieStore = await cookies();
  const secretKey = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!secretKey) redirect('/login');

  const addresses = await getAddresses(secretKey);

  if (!addresses) {
    redirect('/api/auth/logout?redirect=/login');
  }

  return (
    <div>
      <p className="text-[1rem] text-[#555] mb-6">Edit your billing and shipping addresses.</p>
      <AddressForm addresses={addresses} updateAction={updateAddresses} />
    </div>
  );
}