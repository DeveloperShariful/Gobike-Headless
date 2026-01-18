// app/account/details/page.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import AccountDetailsForm from './AccountDetailsForm';
import { AUTH_COOKIE_NAME } from '@/lib/constants';

const GET_VIEWER_KEY_QUERY = `
query GetViewerByKey($key: String) {
  viewerByKey(secretKey: $key) {
    id
    firstName
    lastName
    email
  }
}
`;

const UPDATE_DETAILS_MUTATION = `
mutation UpdateDetails($key: String!, $firstName: String!, $lastName: String!, $email: String!) {
  updateCustomerByKey(input: {
    secretKey: $key,
    firstName: $firstName,
    lastName: $lastName,
    email: $email
  }) {
    success
  }
}
`;

const CHANGE_PASSWORD_MUTATION = `
mutation ChangePassword($key: String!, $newPassword: String!) {
  changePasswordByKey(input: {
    secretKey: $key,
    newPassword: $newPassword
  }) {
    success
  }
}
`;

async function getViewer(secretKey: string) {
    const endpoint = process.env.WORDPRESS_GRAPHQL_ENDPOINT;
    if (!endpoint) return null;
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: GET_VIEWER_KEY_QUERY, variables: { key: secretKey } }),
            cache: 'no-store',
        });
        const data = await response.json();
        return data?.data?.viewerByKey || null;
    } catch(e) { return null; }
}

async function updateDetails(prevState: any, formData: FormData) {
  'use server';
  const secretKey = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
  if (!secretKey) return { error: 'Not authenticated.' };

  const endpoint = process.env.WORDPRESS_GRAPHQL_ENDPOINT;
  if(!endpoint) return { error: 'Server error' };

  try {
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            query: UPDATE_DETAILS_MUTATION,
            variables: {
                key: secretKey,
                firstName: formData.get('firstName'),
                lastName: formData.get('lastName'),
                email: formData.get('email')
            }
        })
    });
    const data = await response.json();
    if(data.errors) return { error: 'Update failed' };
    
    revalidatePath('/account/details');
    return { success: true };
  } catch(e) { return { error: 'Error' }; }
}

async function changePassword(prevState: any, formData: FormData) {
  'use server';
  const secretKey = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
  if (!secretKey) return { error: 'Not authenticated.' };
  
  const newPass = formData.get('newPassword') as string;
  const confirmPass = formData.get('confirmPassword') as string;

  if(newPass !== confirmPass) return { error: 'Passwords do not match' };

  const endpoint = process.env.WORDPRESS_GRAPHQL_ENDPOINT;
  if(!endpoint) return { error: 'Server error' };

  try {
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            query: CHANGE_PASSWORD_MUTATION,
            variables: { key: secretKey, newPassword: newPass }
        })
    });
    const data = await response.json();
    if(data.errors) return { error: 'Failed to change password' };
    
    return { success: true };
  } catch(e) { return { error: 'Error' }; }
}

export default async function AccountDetailsPage() {
  const cookieStore = await cookies();
  const secretKey = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!secretKey) redirect('/login');

  const user = await getViewer(secretKey);
  if (!user) redirect('/api/auth/logout?redirect=/login');

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Account Details</h2>
      <AccountDetailsForm user={user} updateDetailsAction={updateDetails} changePasswordAction={changePassword} />
    </div>
  );
}