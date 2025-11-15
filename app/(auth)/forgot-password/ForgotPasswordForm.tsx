// app/(auth)/forgot-password/ForgotPasswordForm.tsx
'use client'; 

import { useFormState, useFormStatus } from 'react-dom';
import styles from './forgot-password.module.css'; // ★ লোকাল CSS ইম্পোর্ট

// সার্ভার অ্যাকশন স্টেট-এর টাইপ
type ActionState = {
  error?: string;
  success?: boolean;
};

// সাবমিট বাটন
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={styles.btn} disabled={pending}>
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

  // যদি সফল হয়, ফর্ম না দেখিয়ে মেসেজ দেখাও
  if (state.success) {
    return (
      <div className={styles.successMessage}>
        <p>Password reset link sent!</p>
        <p>Please check your email (including spam folder) for instructions.</p>
      </div>
    );
  }

  return (
    <form action={formAction}>
      <p className={styles.description}>
        Enter your email address and we will send you a link to reset your password.
      </p>
      
      {state.error && <p className={styles.errorMessage}>{state.error}</p>}

      <div className={styles.formGroup}>
        <label htmlFor="email" className={styles.label}>Email:</label>
        <input 
          id="email"
          name="email" 
          type="email" 
          className={styles.formInput}
          required 
        />
      </div>

      <SubmitButton />
    </form>
  );
}