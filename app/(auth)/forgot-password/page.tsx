// app/(auth)/forgot-password/page.tsx
import ForgotPasswordForm from './ForgotPasswordForm';
import { revalidatePath } from 'next/cache';

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
    // ★ কন্টেইনারে Tailwind CSS যোগ করা হয়েছে
    <div className="max-w-[420px] mx-auto my-16 p-10 bg-white border border-[#e0e0e0] rounded-xl shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
      <h2 className="text-center text-[2rem] font-bold text-[#333] mb-4">
        Forgot Password?
      </h2>
      
      <ForgotPasswordForm sendResetLinkAction={sendResetLinkAction} />
      
      {/* ★ লিংক সেকশনে Tailwind CSS যোগ করা হয়েছে */}
      <div className="mt-6 text-center text-[0.95rem] text-[#555]">
        <p>
          Remembered your password?{' '}
          <a href="/login" className="text-[#007bff] font-semibold no-underline hover:underline">
            Login here
          </a>
        </p>
      </div>
    </div>
  );
}