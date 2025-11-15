// app/(auth)/reset-password/ResetPasswordForm.tsx
'use client'; 

import { useFormState, useFormStatus } from 'react-dom';
import Link from 'next/link';
import { useState } from 'react'; // ★ Show/Hide এর জন্য ইম্পোর্ট
import styles from './reset-password.module.css'; // ★ লোকাল CSS ইম্পোর্ট

// SVG আইকন (ফাইলের ভেতরেই)
const EyeOpenIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
    <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z" />
    <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" />
  </svg>
);
const EyeClosedIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
    <path d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7.029 7.029 0 0 0 2.79-.588zM5.21 3.088A7.028 7.028 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474L5.21 3.089z" />
    <path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829l-2.83-2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12-.708.708z" />
  </svg>
);

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
      {pending ? 'Resetting...' : 'Set New Password'}
    </button>
  );
}

// --- মূল ফর্ম কম্পোনেন্ট ---
export default function ResetPasswordForm({
  resetPasswordAction,
  resetKey,
  login,
}: {
  resetPasswordAction: (
    prevState: ActionState,
    formData: FormData
  ) => Promise<ActionState>;
  resetKey: string;
  login: string;
}) {
  const initialState: ActionState = {};
  const [state, formAction] = useFormState(resetPasswordAction, initialState);

  // ★ দুটি পাসওয়ার্ড ফিল্ডের জন্য দুটি আলাদা স্টেট
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  if (state.success) {
    return (
      <div className={styles.successMessage}>
        <p>Password reset successfully!</p>
        <p>
          <Link href="/login">You can now log in with your new password.</Link>
        </p>
      </div>
    );
  }

  return (
    <form action={formAction}>
      {state.error && <p className={styles.errorMessage}>{state.error}</p>}

      <div className={styles.formGroup}>
        <label htmlFor="newPassword" className={styles.label}>New Password:</label>
        <div className={styles.passwordWrapper}>
          <input
            id="newPassword"
            name="newPassword"
            type={showPassword ? 'text' : 'password'}
            className={styles.passwordInput}
            required
          />
          <button
            type="button"
            className={styles.passwordToggleBtn}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeClosedIcon /> : <EyeOpenIcon />}
          </button>
        </div>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="confirmPassword" className={styles.label}>Confirm New Password:</label>
        <div className={styles.passwordWrapper}>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            className={styles.passwordInput}
            required
          />
          <button
            type="button"
            className={styles.passwordToggleBtn}
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <EyeClosedIcon /> : <EyeOpenIcon />}
          </button>
        </div>
      </div>

      <input type="hidden" name="resetKey" value={resetKey} />
      <input type="hidden" name="login" value={login} />

      <SubmitButton />
    </form>
  );
}