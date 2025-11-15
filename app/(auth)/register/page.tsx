// app/(auth)/register/page.tsx
import RegisterForm from './RegisterForm';
import { revalidatePath } from 'next/cache';
import styles from './register.module.css'; 

// --- টাইপ ডিফাইন করা ---
type ActionState = {
  error?: string;
  success?: boolean;
};

// ★★★ GraphQL Mutation আপডেট করা হয়েছে ★★★
const REGISTER_CUSTOMER_MUTATION = `
mutation RegisterCustomer(
  $email: String!, 
  $password: String!, 
  $firstName: String!, 
  $lastName: String!
) {
  registerCustomer(
    input: {
      username: $email, 
      email: $email,
      password: $password,
      firstName: $firstName,
      lastName: $lastName
    }
  ) {
    customer {
      id
    }
  }
}
`;

// --- হেল্পার ফাংশন: GraphQL-এ রিকোয়েস্ট পাঠানো (অপরিবর্তিত) ---
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

// --- ★★★ Server Action: Register User (আপডেট করা হয়েছে) ★★★ ---
async function registerUser(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  'use server';

  // নতুন ফিল্ডগুলো পড়া
  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  // সার্ভার-সাইড ভ্যালিডেশন
  if (!firstName || !lastName || !email || !password) {
    return { error: 'Please fill out all required fields.' };
  }

  // ★ পাসওয়ার্ড ম্যাচিং চেক
  if (password !== confirmPassword) {
    return { error: 'Passwords do not match. Please try again.' };
  }

  try {
    // ★ মিউটেশনে নতুন ভেরিয়েবল পাস করা
    await fetchPublicGraphQL(REGISTER_CUSTOMER_MUTATION, {
      email: email,
      password: password,
      firstName: firstName,
      lastName: lastName,
    });
    
    revalidatePath('/register');
    return { success: true }; 

  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'An unknown error occurred during registration.' };
  }
}

// --- মূল পেজ কম্পোনেন্ট (অপরিবর্তিত) ---
export default function RegisterPage() {
  return (
    <div className={styles.registerContainer}> 
      <h2 className={styles.title}>Register</h2>
      <RegisterForm registerAction={registerUser} />
      <div className={styles.links}>
        <p>
          Already have an account? <a href="/login">Login here</a>
        </p>
      </div>
    </div>
  );
}