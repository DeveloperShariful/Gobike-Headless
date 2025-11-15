// app/account/addresses/page.tsx

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import AddressForm from './AddressForm';
import styles from './addresses.module.css';

type Address = {
  firstName: string;
  lastName: string;
  company: string | null;
  address1: string;
  address2: string | null;
  city: string;
  state: string | null;
  postcode: string;
  country: string;
  email?: string;
  phone?: string;
};

type UpdateActionState = {
  error?: string;
  success?: boolean;
};

const GET_CUSTOMER_ADDRESSES_QUERY = `
query GetCustomerAddresses {
  customer {
    billing {
      firstName
      lastName
      company
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
      company
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

const UPDATE_CUSTOMER_ADDRESSES_MUTATION = `
mutation UpdateCustomerAddresses($billing: CustomerAddressInput!, $shipping: CustomerAddressInput!) {
  updateCustomer(input: {
    billing: $billing,
    shipping: $shipping
  }) {
    customer {
      id
    }
  }
}
`;

async function getCustomerAddresses(authToken: string): Promise<{
  billing: Address;
  shipping: Address;
} | null> {
  const endpoint = process.env.WORDPRESS_GRAPHQL_ENDPOINT;
  if (!endpoint) throw new Error('GraphQL endpoint is not set.');

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ query: GET_CUSTOMER_ADDRESSES_QUERY }),
      cache: 'no-store',
    });
    const data = await response.json();
    if (data.errors) {
      console.error("GraphQL Errors (Get):", data.errors);
      return null;
    }
    return data.data.customer;
  } catch (error) {
    console.error("Fetch Error (Get):", error);
    return null;
  }
}

async function updateAddresses(
  prevState: UpdateActionState,
  formData: FormData
): Promise<UpdateActionState> {
  'use server';
  const authToken = (await cookies()).get('auth-token')?.value;
  if (!authToken) return { error: 'You are not authenticated.' };

  const billingData = {
    firstName: formData.get('billing_firstName') as string,
    lastName: formData.get('billing_lastName') as string,
    address1: formData.get('billing_address1') as string,
    city: formData.get('billing_city') as string,
    postcode: formData.get('billing_postcode') as string,
    country: formData.get('billing_country') as string,
    email: formData.get('billing_email') as string,
    phone: formData.get('billing_phone') as string,
  };

  const shippingData = {
    firstName: formData.get('shipping_firstName') as string,
    lastName: formData.get('shipping_lastName') as string,
    address1: formData.get('shipping_address1') as string,
    city: formData.get('shipping_city') as string,
    postcode: formData.get('shipping_postcode') as string,
    country: formData.get('shipping_country') as string,
  };

  const endpoint = process.env.WORDPRESS_GRAPHQL_ENDPOINT;
  if (!endpoint) throw new Error('GraphQL endpoint is not set.');

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        query: UPDATE_CUSTOMER_ADDRESSES_MUTATION,
        variables: { billing: billingData, shipping: shippingData },
      }),
    });
    const data = await response.json();
    if (data.errors) {
      console.error("GraphQL Errors (Update):", data.errors);
      return { error: 'Failed to update addresses.' };
    }
    revalidatePath('/account/addresses');
    return { success: true };
  } catch (error) {
    console.error("Fetch Error (Update):", error);
    return { error: 'An unexpected error occurred.' };
  }
}

export default async function AccountAddressesPage() {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('auth-token')?.value;

  if (!authToken) redirect('/login');

  const addresses = await getCustomerAddresses(authToken);

  if (!addresses) {
    return (
      <div>
        <p>Could not fetch addresses. Please try again later.</p>
      </div>
    );
  }

  return (
    <div>
      <p className={styles.introText}>
        Edit your billing and shipping addresses.
      </p>
      <AddressForm
        addresses={addresses}
        updateAction={updateAddresses}
      />
    </div>
  );
}