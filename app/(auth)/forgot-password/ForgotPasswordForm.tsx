// app/(auth)/forgot-password/ForgotPasswordForm.tsx
'use client'; 

import { useActionState } from 'react'; 
import { useFormStatus } from 'react-dom';
import Link from 'next/link';

type ActionState = {
  error?: string;
  success?: boolean;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button 
        type="submit" 
        className="w-full py-3.5 mt-2 text-[1.05rem] font-bold text-white rounded-xl shadow-lg shadow-blue-500/30 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none" 
        disabled={pending}
    >
        {pending ? (
            <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="opacity-25"></circle><path d="M4 12a8 8 0 018-8v8H4z" fill="currentColor" className="opacity-75"></path></svg>
                Sending Link...
            </span>
        ) : 'Send Reset Link'}
    </button>
  );
}

export default function ForgotPasswordForm({
  sendResetLinkAction,
}: {
  sendResetLinkAction: (
    prevState: ActionState,
    formData: FormData
  ) => Promise<ActionState>;
}) {
  const initialState: ActionState = {};
  const [state, formAction] = useActionState(sendResetLinkAction, initialState);

  if (state.success) {
    return (
      <div className="text-[#2f855a] bg-[#c6f6d5] border border-[#9ae6b4] p-8 rounded-2xl text-center shadow-sm animate-fade-in-up">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
        </div>
        <h3 className="text-xl font-bold text-green-800 mb-2">Check Your Email</h3>
        <p className="text-green-700">Password reset link sent! Please check your inbox (and spam folder) for instructions.</p>
        <div className="mt-6">
             <Link href="/login" className="font-bold text-green-800 hover:underline">Return to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fadeInUp 0.6s ease-out forwards; }
      `}</style>
      
      <form action={formAction} className="animate-fade-in-up">
        
        <p className="text-center text-gray-500 mb-8 text-[0.95rem]">
          Don&apos;t worry! Enter your email address and we will send you a secure link to reset your password.
        </p>
        
        {state.error && (
            <div className="p-4 mb-6 bg-red-50 border-l-4 border-red-500 rounded-r-lg text-red-700 text-sm font-medium animate-pulse">
                {state.error}
            </div>
        )}

        <div className="mb-6">
          <label htmlFor="email" className="block mb-1.5 text-sm font-semibold text-gray-700">
            Email Address
          </label>
          <input 
            id="email"
            name="email" 
            type="email" 
            placeholder="Enter your registered email"
            required 
            className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all duration-300 outline-none"
          />
        </div>

        <SubmitButton />
      </form>
    </>
  );
}