// app/(auth)/forgot-password/ForgotPasswordForm.tsx
'use client'; 

import { useFormState, useFormStatus } from 'react-dom';

// সার্ভার অ্যাকশন স্টেট-এর টাইপ
type ActionState = {
  error?: string;
  success?: boolean;
};

// সাবমিট বাটন
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button 
      type="submit" 
      disabled={pending}
      className="inline-block w-full padding-[0.9rem_1.5rem] py-3.5 px-6 text-[1.05rem] font-semibold border border-transparent rounded-md cursor-pointer text-center transition-all duration-200 bg-[#007bff] text-white hover:bg-[#0056b3] disabled:bg-[#ccc] disabled:cursor-not-allowed"
    >
      {pending ? 'Sending...' : 'Send Reset Link'}
    </button>
  );
}

// --- মূল ফর্ম কম্পোনেন্ট ---
export default function ForgotPasswordForm({
  sendResetLinkAction,
}: {
  sendResetLinkAction: (
    prevState: ActionState,
    formData: FormData
  ) => Promise<ActionState>;
}) {
  const initialState: ActionState = {};
  const [state, formAction] = useFormState(sendResetLinkAction, initialState);

  // যদি সফল হয়, ফর্ম না দেখিয়ে মেসেজ দেখাও
  if (state.success) {
    return (
      <div className="text-[#155724] bg-[#d4edda] border border-[#c3e6cb] p-4 rounded-[5px] text-center">
        <p>Password reset link sent!</p>
        <p>Please check your email (including spam folder) for instructions.</p>
      </div>
    );
  }

  return (
    <form action={formAction}>
      <p className="text-center text-[#555] mb-8 text-[0.95rem]">
        Enter your email address and we will send you a link to reset your password.
      </p>
      
      {state.error && (
        <p className="text-[#721c24] bg-[#f8d7da] border border-[#f5c6cb] py-3 px-5 rounded-[5px] mb-5 text-center text-[0.95rem]">
          {state.error}
        </p>
      )}

      <div className="mb-5">
        <label htmlFor="email" className="block mb-2 font-semibold text-[#333] text-[0.95rem]">
          Email:
        </label>
        <input 
          id="email"
          name="email" 
          type="email" 
          required 
          className="block w-full py-[0.85rem] px-4 text-base border border-[#ccc] rounded-md box-border transition-all duration-200 focus:border-[#007bff] focus:shadow-[0_0_0_3px_rgba(0,123,255,0.2)] focus:outline-none"
        />
      </div>

      <SubmitButton />
    </form>
  );
}