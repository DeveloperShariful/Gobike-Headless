// app/account/details/page.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import AccountDetailsForm from './AccountDetailsForm'; // ক্লায়েন্ট ফর্ম ইম্পোর্ট

// --- টাইপ ডিফাইন করা ---
type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

type ActionState = {
  error?: string;
  success?: boolean;
};

// --- GraphQL কোয়েরি এবং মিউটেশন ---
const GET_VIEWER_DETAILS_QUERY = `
query GetViewerDetails {
  viewer {
    id
    firstName
    lastName
    email
  }
}
`;

const UPDATE_CUSTOMER_DETAILS_MUTATION = `
mutation UpdateCustomerDetails($firstName: String!, $lastName: String!, $email: String!) {
  updateCustomer(
    input: {
      firstName: $firstName
      lastName: $lastName
      email: $email
    }
  ) {
    customer { id }
  }
}
`;

const CHANGE_PASSWORD_MUTATION = `
mutation ChangePassword($currentPassword: String!, $newPassword: String!) {
  changePassword(
    input: {
      currentPassword: $currentPassword
      newPassword: $newPassword
    }
  ) {
    clientMutationId
  }
}
`;

// --- হেল্পার ফাংশন: GraphQL-এ রিকোয়েস্ট পাঠানো ---
// ★★★ সমাধান: 'any' এর বদলে 'unknown' ব্যবহার ★★★
async function fetchGraphQL(authToken: string, query: string, variables: Record<string, unknown> = {}) {
  const endpoint = process.env.WORDPRESS_GRAPHQL_ENDPOINT;
  if (!endpoint) throw new Error('GraphQL endpoint is not set.');

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({ query, variables }),
      cache: 'no-store',
    });

    const data = await response.json();
    if (data.errors) {
      console.error("GraphQL Errors:", data.errors);
      const errorMessage = data.errors[0]?.message || 'An error occurred.';
      throw new Error(errorMessage);
    }
    return data.data;

  } catch (error) {
    console.error("Fetch Error:", error);
    throw error;
  }
}

// --- ★★★ Server Action ১: Update Details ★★★ ---
async function updateDetails(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  'use server';

  const authToken = (await cookies()).get('auth-token')?.value;
  if (!authToken) return { error: 'Not authenticated.' };

  try {
    await fetchGraphQL(authToken, UPDATE_CUSTOMER_DETAILS_MUTATION, {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
    });

    revalidatePath('/account/details');
    return { success: true };

  } catch (error) {
    // ★★★ সমাধান: 'error' কে সঠিকভাবে টাইপ চেক করা ★★★
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'An unknown error occurred during update.' };
  }
}

// --- ★★★ Server Action ২: Change Password ★★★ ---
async function changePassword(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  'use server';

  const authToken = (await cookies()).get('auth-token')?.value;
  if (!authToken) return { error: 'Not authenticated.' };

  const newPassword = formData.get('newPassword') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (newPassword !== confirmPassword) {
    return { error: 'New passwords do not match.' };
  }

  try {
    await fetchGraphQL(authToken, CHANGE_PASSWORD_MUTATION, {
      currentPassword: formData.get('currentPassword') as string,
      newPassword: newPassword,
    });
    
    return { success: true };

  } catch (error) {
    // ★★★ সমাধান: 'error' কে সঠিকভাবে টাইপ চেক করা ★★★
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'An unknown error occurred during password change.' };
  }
}

// --- মূল পেজ কম্পোনেন্ট ---
export default async function AccountDetailsPage() {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('auth-token')?.value;

  if (!authToken) {
    redirect('/login');
  }

  let user: User;
  try {
    const data = await fetchGraphQL(authToken, GET_VIEWER_DETAILS_QUERY);
    user = data.viewer;
  } catch (error) {
    // ★★★ সমাধান: 'error' ভেরিয়েবলটি ব্যবহার করা (logging) ★★★
    console.error("Failed to fetch viewer details:", error);
    redirect('/login'); // টোকেন এক্সপায়ার হলে লগইনে পাঠাও
  }

  return (
    <div>
      <h2>Account Details</h2>
      <AccountDetailsForm
        user={user}
        updateDetailsAction={updateDetails}
        changePasswordAction={changePassword}
      />
    </div>
  );
}