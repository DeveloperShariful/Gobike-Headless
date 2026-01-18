// app/account/details/AccountDetailsForm.tsx


'use client'; 

// ★★★ পরিবর্তন ১: ইম্পোর্ট 'react-dom' থেকে 'react' এ moved এবং useFormState -> useActionState হয়েছে ★★★
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom'; // দ্রষ্টব্য: Next.js এর কিছু ভার্সনে useFormStatus এখনো react-dom এ থাকতে পারে, তবে React 19 এ এটি react এ। আপনার এররটি শুধু useFormState নিয়ে। যদি useFormStatus নিয়ে এরর দেয় তবে সেটা 'react' থেকে আনবেন। আপাতত useFormState ঠিক করছি।

// React 19 এর জন্য সঠিক ইম্পোর্ট (যদি পুরোপুরি React 19 সাপোর্ট থাকে):
// import { useActionState, useFormStatus } from 'react'; 

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

type User = {
  firstName: string;
  lastName: string;
  email: string;
};

function SubmitButton({ text }: { text: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="inline-block w-full md:w-auto md:min-w-[150px] py-[0.85rem] md:py-[0.9rem] px-6 text-base font-semibold border border-transparent rounded-md cursor-pointer text-center transition-all duration-200 bg-[#007bff] text-white mt-2 hover:bg-[#0056b3] disabled:bg-[#ccc] disabled:cursor-not-allowed" disabled={pending}>
      {pending ? 'Saving...' : text}
    </button>
  );
}

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

  // ★★★ পরিবর্তন ২: useFormState এর বদলে useActionState ব্যবহার করা হয়েছে ★★★
  const [detailsState, detailsFormAction] = useActionState(updateDetailsAction, initialState);
  const [passwordState, passwordFormAction] = useActionState(changePasswordAction, initialState);

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div>
      <form action={detailsFormAction} className="mb-8 pb-6 border-b border-[#eee] last:mb-0 last:pb-0 last:border-b-0 md:mb-10 md:pb-8">
        <h3 className="text-[1.3rem] md:text-[1.5rem] font-bold text-[#333] mt-0 mb-6">Update Details</h3>
        {detailsState.success && (
          <p className="text-[#155724] bg-[#d4edda] border border-[#c3e6cb] py-3 px-5 rounded-[5px] mb-5 text-left text-[0.95rem] max-w-[500px]">Details saved successfully!</p>
        )}
        {detailsState.error && (
          <p className="text-[#721c24] bg-[#f8d7da] border border-[#f5c6cb] py-3 px-5 rounded-[5px] mb-5 text-left text-[0.95rem] max-w-[500px]">{detailsState.error}</p>
        )}

        <div className="mb-5 max-w-[500px]">
          <label htmlFor="firstName" className="block mb-2 font-semibold text-[#333] text-[0.95rem]">First Name:</label>
          <input 
            id="firstName"
            name="firstName" 
            className="block w-full py-[0.8rem] md:py-[0.85rem] px-4 text-[0.95rem] md:text-[1rem] border border-[#ccc] rounded-md box-border transition-all duration-200 focus:border-[#007bff] focus:shadow-[0_0_0_3px_rgba(0,123,255,0.2)] focus:outline-none"
            defaultValue={user.firstName || ''} 
            required 
          />
        </div>

        <div className="mb-5 max-w-[500px]">
          <label htmlFor="lastName" className="block mb-2 font-semibold text-[#333] text-[0.95rem]">Last Name:</label>
          <input 
            id="lastName"
            name="lastName" 
            className="block w-full py-[0.8rem] md:py-[0.85rem] px-4 text-[0.95rem] md:text-[1rem] border border-[#ccc] rounded-md box-border transition-all duration-200 focus:border-[#007bff] focus:shadow-[0_0_0_3px_rgba(0,123,255,0.2)] focus:outline-none"
            defaultValue={user.lastName || ''} 
            required 
          />
        </div>

        <div className="mb-5 max-w-[500px]">
          <label htmlFor="email" className="block mb-2 font-semibold text-[#333] text-[0.95rem]">Email:</label>
          <input
            id="email"
            name="email"
            type="email"
            className="block w-full py-[0.8rem] md:py-[0.85rem] px-4 text-[0.95rem] md:text-[1rem] border border-[#ccc] rounded-md box-border transition-all duration-200 focus:border-[#007bff] focus:shadow-[0_0_0_3px_rgba(0,123,255,0.2)] focus:outline-none"
            defaultValue={user.email || ''}
            required
          />
        </div>
        <SubmitButton text="Save Details" />
      </form>

      <form action={passwordFormAction} className="mb-8 pb-6 border-b border-[#eee] last:mb-0 last:pb-0 last:border-b-0 md:mb-10 md:pb-8">
        <h3 className="text-[1.3rem] md:text-[1.5rem] font-bold text-[#333] mt-0 mb-6">Change Password</h3>
        {passwordState.success && (
          <p className="text-[#155724] bg-[#d4edda] border border-[#c3e6cb] py-3 px-5 rounded-[5px] mb-5 text-left text-[0.95rem] max-w-[500px]">Password changed successfully!</p>
        )}
        {passwordState.error && (
          <p className="text-[#721c24] bg-[#f8d7da] border border-[#f5c6cb] py-3 px-5 rounded-[5px] mb-5 text-left text-[0.95rem] max-w-[500px]">{passwordState.error}</p>
        )}

        <div className="mb-5 max-w-[500px]">
          <label htmlFor="currentPassword" className="block mb-2 font-semibold text-[#333] text-[0.95rem]">Current Password:</label>
          <div className="relative w-full">
            <input 
              id="currentPassword"
              name="currentPassword" 
              type={showCurrent ? 'text' : 'password'}
              className="block w-full py-[0.8rem] md:py-[0.85rem] px-4 pr-[40px] text-[0.95rem] md:text-[1rem] border border-[#ccc] rounded-md box-border transition-all duration-200 focus:border-[#007bff] focus:shadow-[0_0_0_3px_rgba(0,123,255,0.2)] focus:outline-none" 
              required 
            />
            <button
              type="button"
              className="absolute top-1/2 right-[10px] -translate-y-1/2 bg-transparent border-none cursor-pointer p-[5px] text-[#555] flex items-center"
              onClick={() => setShowCurrent(!showCurrent)}
            >
              {showCurrent ? <EyeClosedIcon /> : <EyeOpenIcon />}
            </button>
          </div>
        </div>

        <div className="mb-5 max-w-[500px]">
          <label htmlFor="newPassword" className="block mb-2 font-semibold text-[#333] text-[0.95rem]">New Password:</label>
          <div className="relative w-full">
            <input 
              id="newPassword"
              name="newPassword" 
              type={showNew ? 'text' : 'password'}
              className="block w-full py-[0.8rem] md:py-[0.85rem] px-4 pr-[40px] text-[0.95rem] md:text-[1rem] border border-[#ccc] rounded-md box-border transition-all duration-200 focus:border-[#007bff] focus:shadow-[0_0_0_3px_rgba(0,123,255,0.2)] focus:outline-none" 
              required 
            />
            <button
              type="button"
              className="absolute top-1/2 right-[10px] -translate-y-1/2 bg-transparent border-none cursor-pointer p-[5px] text-[#555] flex items-center"
              onClick={() => setShowNew(!showNew)}
            >
              {showNew ? <EyeClosedIcon /> : <EyeOpenIcon />}
            </button>
          </div>
        </div>

        <div className="mb-5 max-w-[500px]">
          <label htmlFor="confirmPassword" className="block mb-2 font-semibold text-[#333] text-[0.95rem]">Confirm New Password:</label>
          <div className="relative w-full">
            <input 
              id="confirmPassword"
              name="confirmPassword" 
              type={showConfirm ? 'text' : 'password'}
              className="block w-full py-[0.8rem] md:py-[0.85rem] px-4 pr-[40px] text-[0.95rem] md:text-[1rem] border border-[#ccc] rounded-md box-border transition-all duration-200 focus:border-[#007bff] focus:shadow-[0_0_0_3px_rgba(0,123,255,0.2)] focus:outline-none" 
              required 
            />
            <button
              type="button"
              className="absolute top-1/2 right-[10px] -translate-y-1/2 bg-transparent border-none cursor-pointer p-[5px] text-[#555] flex items-center"
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