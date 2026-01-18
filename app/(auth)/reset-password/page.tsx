// app/(auth)/reset-password/page.tsx
import ResetPasswordForm from './ResetPasswordForm';
import { revalidatePath } from 'next/cache';

type ActionState = {
  error?: string;
  success?: boolean;
};

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

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: { key?: string; login?: string };
}) {
  const { key, login } = searchParams;

  if (!key || !login) {
    return (
      <div className="max-w-[420px] mx-auto my-16 p-10 bg-white border border-[#e0e0e0] rounded-xl shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
        <h2 className="text-center text-[2rem] font-bold text-[#333] mb-8">Invalid Link</h2>
        <p className="text-[#721c24] bg-[#f8d7da] border border-[#f5c6cb] py-3 px-5 rounded-[5px] mb-5 text-left text-[0.95rem]">
          This password reset link is incomplete or invalid.
        </p>
        <div className="mt-6 text-center text-[0.95rem] text-[#555]">
          <p>
            Please <a href="/forgot-password" className="text-[#007bff] font-semibold no-underline hover:underline">request a new reset link</a>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[420px] mx-auto my-16 p-10 bg-white border border-[#e0e0e0] rounded-xl shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
      <h2 className="text-center text-[2rem] font-bold text-[#333] mb-8">Set New Password</h2>
      <ResetPasswordForm
        resetPasswordAction={resetPasswordAction}
        resetKey={key}
        login={login}
      />
    </div>
  );
}