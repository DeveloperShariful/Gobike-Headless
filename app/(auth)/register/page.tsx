// app/(auth)/register/page.tsx
import RegisterForm from './RegisterForm';
import { revalidatePath } from 'next/cache';

type ActionState = {
  error?: string;
  success?: boolean;
};

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

async function registerUser(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  'use server';

  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (!firstName || !lastName || !email || !password) {
    return { error: 'Please fill out all required fields.' };
  }

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match. Please try again.' };
  }

  try {
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

export default function RegisterPage() {
  return (
    <div className="max-w-[480px] mx-auto my-16 p-12 bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] border border-[#f0f0f0]"> 
      <h2 className="text-center text-4xl font-bold text-[#1a202c] mb-10">Register</h2>
      <RegisterForm registerAction={registerUser} />
      <div className="mt-8 text-center text-[0.95rem] text-[#4a5568]">
        <p>
          Already have an account? <a href="/login" className="text-[#3182ce] font-semibold no-underline hover:underline">Login here</a>
        </p>
      </div>
    </div>
 );
}