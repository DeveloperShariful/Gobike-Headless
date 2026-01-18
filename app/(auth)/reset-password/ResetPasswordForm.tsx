// app/(auth)/reset-password/ResetPasswordForm.tsx
'use client'; 

import { useFormState, useFormStatus } from 'react-dom';
import Link from 'next/link';
import { useState } from 'react';

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

type ActionState = {
  error?: string;
  success?: boolean;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="inline-block w-full py-[0.9rem] px-6 text-[1.05rem] font-semibold border border-transparent rounded-md cursor-pointer text-center transition-all duration-200 bg-[#007bff] text-white hover:bg-[#0056b3] disabled:bg-[#ccc] disabled:cursor-not-allowed" disabled={pending}>
      {pending ? 'Resetting...' : 'Set New Password'}
    </button>
  );
}

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

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  if (state.success) {
    return (
      <div className="text-[#155724] bg-[#d4edda] border border-[#c3e6cb] p-4 rounded-[5px] text-center">
        <p>Password reset successfully!</p>
        <p>
          <Link href="/login" className="font-semibold text-[#155724]">You can now log in with your new password.</Link>
        </p>
      </div>
    );
  }

  return (
    <form action={formAction}>
      {state.error && <p className="text-[#721c24] bg-[#f8d7da] border border-[#f5c6cb] py-3 px-5 rounded-[5px] mb-5 text-center text-[0.95rem]">{state.error}</p>}

      <div className="mb-5">
        <label htmlFor="newPassword" className="block mb-2 font-semibold text-[#333] text-[0.95rem]">New Password:</label>
        <div className="relative w-full">
          <input
            id="newPassword"
            name="newPassword"
            type={showPassword ? 'text' : 'password'}
            className="block w-full py-[0.85rem] px-4 pr-[40px] text-base border border-[#ccc] rounded-md transition-all duration-200 focus:border-[#007bff] focus:shadow-[0_0_0_3px_rgba(0,123,255,0.2)] focus:outline-none"
            required
          />
          <button
            type="button"
            className="absolute top-1/2 right-[10px] -translate-y-1/2 bg-transparent border-none cursor-pointer p-[5px] text-[#555] flex"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeClosedIcon /> : <EyeOpenIcon />}
          </button>
        </div>
      </div>

      <div className="mb-5">
        <label htmlFor="confirmPassword" className="block mb-2 font-semibold text-[#333] text-[0.95rem]">Confirm New Password:</label>
        <div className="relative w-full">
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            className="block w-full py-[0.85rem] px-4 pr-[40px] text-base border border-[#ccc] rounded-md transition-all duration-200 focus:border-[#007bff] focus:shadow-[0_0_0_3px_rgba(0,123,255,0.2)] focus:outline-none"
            required
          />
          <button
            type="button"
            className="absolute top-1/2 right-[10px] -translate-y-1/2 bg-transparent border-none cursor-pointer p-[5px] text-[#555] flex"
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