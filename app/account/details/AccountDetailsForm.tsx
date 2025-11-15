// app/account/details/AccountDetailsForm.tsx
'use client'; 

import { useFormState, useFormStatus } from 'react-dom';
import { useState } from 'react';
import styles from './details.module.css'; // ★ লোকাল CSS ইম্পোর্ট

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

// সার্ভার অ্যাকশন স্টেট-এর টাইপ (অপরিবর্তিত)
type ActionState = {
  error?: string;
  success?: boolean;
};

// ইউজার টাইপ (অপরিবর্তিত)
type User = {
  firstName: string;
  lastName: string;
  email: string;
};

// সাবমিট বাটন
function SubmitButton({ text }: { text: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={styles.btn} disabled={pending}>
      {pending ? 'Saving...' : text}
    </button>
  );
}

// --- মূল ফর্ম কম্পোনেন্ট ---
export default function AccountDetailsForm({
  user,
  updateDetailsAction,
  changePasswordAction,
}: {
  user: User;
  updateDetailsAction: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  changePasswordAction: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
}) {
  const initialState: ActionState = {};
  const [detailsState, detailsFormAction] = useFormState(updateDetailsAction, initialState);
  const [passwordState, passwordFormAction] = useFormState(changePasswordAction, initialState);

  // ★ তিনটি পাসওয়ার্ড ফিল্ডের জন্য স্টেট
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div>
      {/* --- ফর্ম ১: ডিটেইলস আপডেটের জন্য --- */}
      <form action={detailsFormAction} className={styles.formSection}>
        <h3>Update Details</h3>
        {detailsState.success && (
          <p className={styles.successMessage}>Details saved successfully!</p>
        )}
        {detailsState.error && (
          <p className={styles.errorMessage}>{detailsState.error}</p>
        )}

        <div className={styles.formGroup}>
          <label htmlFor="firstName" className={styles.label}>First Name:</label>
          <input 
            id="firstName"
            name="firstName" 
            className={styles.formInput}
            defaultValue={user.firstName || ''} 
            required 
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="lastName" className={styles.label}>Last Name:</label>
          <input 
            id="lastName"
            name="lastName" 
            className={styles.formInput}
            defaultValue={user.lastName || ''} 
            required 
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="email" className={styles.label}>Email:</label>
          <input
            id="email"
            name="email"
            type="email"
            className={styles.formInput}
            defaultValue={user.email || ''}
            required
          />
        </div>
        <SubmitButton text="Save Details" />
      </form>

      {/* --- ফর্ম ২: পাসওয়ার্ড পরিবর্তনের জন্য --- */}
      <form action={passwordFormAction} className={styles.formSection}>
        <h3>Change Password</h3>
        {passwordState.success && (
          <p className={styles.successMessage}>Password changed successfully!</p>
        )}
        {passwordState.error && (
          <p className={styles.errorMessage}>{passwordState.error}</p>
        )}

        <div className={styles.formGroup}>
          <label htmlFor="currentPassword" className={styles.label}>Current Password:</label>
          <div className={styles.passwordWrapper}>
            <input 
              id="currentPassword"
              name="currentPassword" 
              type={showCurrent ? 'text' : 'password'}
              className={styles.passwordInput} 
              required 
            />
            <button
              type="button"
              className={styles.passwordToggleBtn}
              onClick={() => setShowCurrent(!showCurrent)}
            >
              {showCurrent ? <EyeClosedIcon /> : <EyeOpenIcon />}
            </button>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="newPassword" className={styles.label}>New Password:</label>
          <div className={styles.passwordWrapper}>
            <input 
              id="newPassword"
              name="newPassword" 
              type={showNew ? 'text' : 'password'}
              className={styles.passwordInput} 
              required 
            />
            <button
              type="button"
              className={styles.passwordToggleBtn}
              onClick={() => setShowNew(!showNew)}
            >
              {showNew ? <EyeClosedIcon /> : <EyeOpenIcon />}
            </button>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="confirmPassword" className={styles.label}>Confirm New Password:</label>
          <div className={styles.passwordWrapper}>
            <input 
              id="confirmPassword"
              name="confirmPassword" 
              type={showConfirm ? 'text' : 'password'}
              className={styles.passwordInput} 
              required 
            />
            <button
              type="button"
              className={styles.passwordToggleBtn}
              onClick={() => setShowConfirm(!showConfirm)}
            >
              {showConfirm ? <EyeClosedIcon /> : <EyeOpenIcon />}
            </button>
          </div>
        </div>

        <SubmitButton text="Change Password" />
      </form>
    </div>
  );
}