// app/(auth)/forgot-password/page.tsx
import ForgotPasswordForm from './ForgotPasswordForm';
import { revalidatePath } from 'next/cache';
import styles from './forgot-password.module.css'; // ★ CSS ইম্পোর্ট

// --- টাইপ ডিফাইন করা --- (অপরিবর্তিত)
type ActionState = {
  error?: string;
  success?: boolean;
};

// --- GraphQL Mutation --- (অপরিবর্তিত)
const SEND_PASSWORD_RESET_EMAIL_MUTATION = `
mutation SendPasswordResetEmail($username: String!) {
  sendPasswordResetEmail(
    input: {
      username: $username
    }
  ) {
    user {
      email
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
async function sendResetLinkAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  'use server';

  const email = formData.get('email') as string;
  if (!email) {
    return { error: 'Email address is required.' };
  }

  try {
    await fetchPublicGraphQL(SEND_PASSWORD_RESET_EMAIL_MUTATION, {
      username: email,
    });
    
    revalidatePath('/forgot-password');
    return { success: true };

  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Invalid user') || error.message.includes('empty_email')) {
        return { success: true }; 
      }
      return { error: error.message };
    }
    return { error: 'An unknown error occurred.' };
  }
}

// --- মূল পেজ কম্পোনেন্ট ---
export default function ForgotPasswordPage() {
  return (
    // ★ কন্টেইনারে CSS যোগ করা হয়েছে
    <div className={styles.container}>
      <h2 className={styles.title}>Forgot Password?</h2>
      <ForgotPasswordForm sendResetLinkAction={sendResetLinkAction} />
      <div className={styles.links}> {/* ★ লিংক সেকশনে CSS যোগ করা হয়েছে */}
        <p>
          Remembered your password? <a href="/login">Login here</a>
        </p>
      </div>
    </div>
  );
}