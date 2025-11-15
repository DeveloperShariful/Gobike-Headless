// app/(auth)/reset-password/page.tsx
import ResetPasswordForm from './ResetPasswordForm';
import { revalidatePath } from 'next/cache';
import styles from './reset-password.module.css'; // ★ CSS ইম্পোর্ট

// --- টাইপ ডিফাইন করা --- (অপরিবর্তিত)
type ActionState = {
  error?: string;
  success?: boolean;
};

// --- GraphQL Mutation --- (অপরিবর্তিত)
const RESET_USER_PASSWORD_MUTATION = `
mutation ResetUserPassword($key: String!, $login: String!, $password: String!) {
  resetUserPassword(
    input: {
      key: $key
      login: $login
      password: $password
    }
  ) {
    user {
      id
    }
  }
}
`;

// --- হেল্পার ফাংশন --- (অপরিবর্তিত)
async function fetchPublicGraphQL(query: string, variables: Record<string, unknown>) {
  const endpoint = process.env.WORDPRESS_GRAPHQL_ENDPOINT;
  if (!endpoint) throw new Error('GraphQL endpoint is not set.');

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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

// --- Server Action --- (অপরিবর্তিত)
async function resetPasswordAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  'use server';

  const newPassword = formData.get('newPassword') as string;
  const confirmPassword = formData.get('confirmPassword') as string;
  const resetKey = formData.get('resetKey') as string;
  const login = formData.get('login') as string;

  if (newPassword !== confirmPassword) {
    return { error: 'Passwords do not match.' };
  }
  if (!resetKey || !login) {
    return { error: 'Invalid reset link. Please try again.' };
  }

  try {
    await fetchPublicGraphQL(RESET_USER_PASSWORD_MUTATION, {
      key: resetKey,
      login: login,
      password: newPassword,
    });
    
    revalidatePath('/reset-password');
    return { success: true };

  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'An unknown error occurred.' };
  }
}

// --- মূল পেজ কম্পোনেন্ট ---
export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: { key?: string; login?: string };
}) {
  const { key, login } = searchParams;

  if (!key || !login) {
    return (
      // ★ ইনভ্যালিড লিংকের জন্য কন্টেইনার
      <div className={styles.container}>
        <h2 className={styles.title}>Invalid Link</h2>
        <p className={styles.errorMessage} style={{ textAlign: 'left' }}>
          This password reset link is incomplete or invalid.
        </p>
        <div className={styles.links}>
          <p>
            Please <a href="/forgot-password">request a new reset link</a>.
          </p>
        </div>
      </div>
    );
  }

  return (
    // ★ কন্টেইনারে CSS যোগ করা হয়েছে
    <div className={styles.container}>
      <h2 className={styles.title}>Set New Password</h2>
      <ResetPasswordForm
        resetPasswordAction={resetPasswordAction}
        resetKey={key}
        login={login}
      />
    </div>
  );
}