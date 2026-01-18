// app/(auth)/register/RegisterForm.tsx
'use client';

import { useFormState, useFormStatus } from 'react-dom';
import Link from 'next/link';
import { useState } from 'react';

const EyeOpenIcon = () => ( <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z" /><path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" /></svg> );
const EyeClosedIcon = () => ( <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7.029 7.029 0 0 0 2.79-.588zM5.21 3.088A7.028 7.028 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474L5.21 3.089z" /><path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829l-2.83-2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12-.708.708z" /></svg> );
const UserIcon = () => ( <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/></svg> );
const EmailIcon = () => ( <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M.05 3.555A2 2 0 0 1 2 2h12a2 2 0 0 1 1.95 1.555L8 8.414.05 3.555ZM0 4.697v7.104l5.803-3.558L0 4.697ZM6.761 8.83l-6.57 4.027A2 2 0 0 0 2 14h12a2 2 0 0 0 1.808-1.144l-6.57-4.027L8 9.586l-1.239-.757Zm3.436-.586L16 11.801V4.697l-5.803 3.546Z"/></svg> );

type ActionState = { error?: string; success?: boolean; };

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button type="submit" className="w-full p-4 text-base font-bold rounded-lg cursor-pointer border-none transition-all duration-300 bg-gradient-to-r from-[#3182ce] to-[#2b6cb0] text-white mt-4 shadow-[0_4px_15px_rgba(49,130,206,0.3)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(49,130,206,0.4)] disabled:bg-none disabled:bg-[#a0aec0] disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none" disabled={pending}>
            {pending ? 'Registering...' : 'Create Account'}
        </button>
    );
}

export default function RegisterForm({ registerAction }: { registerAction: (prevState: ActionState, formData: FormData) => Promise<ActionState>; }) {
    const initialState: ActionState = {};
    const [state, formAction] = useFormState(registerAction, initialState);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    if (state.success) {
        return (
            <div className="text-[#2f855a] bg-[#c6f6d5] border border-[#9ae6b4] p-6 rounded-lg text-center">
                <p className="my-2"><strong>Registration successful!</strong></p>
                <p className="my-2">
                    <Link href="/login" className="font-bold text-[#2c5282]">Please click here to log in.</Link>
                </p>
            </div>
        );
    }

    return (
        <form action={formAction}>
            {state.error && <p className="text-[#c53030] bg-[#fed7d7] border border-[#fbb6b6] py-[0.9rem] px-5 rounded-lg mb-6 text-center text-[0.95rem] font-medium">{state.error}</p>}

            <div className="flex gap-6 w-full">
                <div className="mb-6 flex-1">
                    <label htmlFor="firstName" className="block mb-2.5 font-semibold text-[#4a5568] text-[0.9rem]">First Name:</label>
                    <div className="relative flex items-center">
                        <span className="absolute left-[15px] text-[#a0aec0] pointer-events-none"><UserIcon /></span>
                        <input id="firstName" name="firstName" type="text" className="w-full py-[0.9rem] pr-4 pl-[2.75rem] text-base border border-[#e2e8f0] rounded-lg bg-[#f7fafc] text-[#2d3748] transition-all duration-200 focus:border-[#3182ce] focus:bg-white focus:shadow-[0_0_0_3px_rgba(66,153,225,0.2)] focus:outline-none" required />
                    </div>
                </div>
                <div className="mb-6 flex-1">
                    <label htmlFor="lastName" className="block mb-2.5 font-semibold text-[#4a5568] text-[0.9rem]">Last Name:</label>
                    <div className="relative flex items-center">
                        <span className="absolute left-[15px] text-[#a0aec0] pointer-events-none"><UserIcon /></span>
                        <input id="lastName" name="lastName" type="text" className="w-full py-[0.9rem] pr-4 pl-[2.75rem] text-base border border-[#e2e8f0] rounded-lg bg-[#f7fafc] text-[#2d3748] transition-all duration-200 focus:border-[#3182ce] focus:bg-white focus:shadow-[0_0_0_3px_rgba(66,153,225,0.2)] focus:outline-none" required />
                    </div>
                </div>
            </div>

            <div className="mb-6">
                <label htmlFor="email" className="block mb-2.5 font-semibold text-[#4a5568] text-[0.9rem]">Email:</label>
                <div className="relative flex items-center">
                    <span className="absolute left-[15px] text-[#a0aec0] pointer-events-none"><EmailIcon /></span>
                    <input id="email" name="email" type="email" className="w-full py-[0.9rem] pr-4 pl-[2.75rem] text-base border border-[#e2e8f0] rounded-lg bg-[#f7fafc] text-[#2d3748] transition-all duration-200 focus:border-[#3182ce] focus:bg-white focus:shadow-[0_0_0_3px_rgba(66,153,225,0.2)] focus:outline-none" required />
                </div>
            </div>

            <div className="mb-6">
                <label htmlFor="password" className="block mb-2.5 font-semibold text-[#4a5568] text-[0.9rem]">Password:</label>
                <div className="relative flex items-center">
                    <span className="absolute left-[15px] text-[#a0aec0] pointer-events-none">
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/></svg>
                    </span>
                    <input id="password" name="password" type={showPassword ? 'text' : 'password'} className="w-full py-[0.9rem] px-[2.75rem] text-base border border-[#e2e8f0] rounded-lg bg-[#f7fafc] text-[#2d3748] transition-all duration-200 focus:border-[#3182ce] focus:bg-white focus:shadow-[0_0_0_3px_rgba(66,153,225,0.2)] focus:outline-none" required />
                    <button type="button" className="absolute right-[15px] bg-transparent border-none cursor-pointer text-[#a0aec0] flex hover:text-[#2d3748]" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeClosedIcon /> : <EyeOpenIcon />}
                    </button>
                </div>
            </div>

            <div className="mb-6">
                <label htmlFor="confirmPassword" className="block mb-2.5 font-semibold text-[#4a5568] text-[0.9rem]">Confirm Password:</label>
                <div className="relative flex items-center">
                     <span className="absolute left-[15px] text-[#a0aec0] pointer-events-none">
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/></svg>
                    </span>
                    <input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} className="w-full py-[0.9rem] px-[2.75rem] text-base border border-[#e2e8f0] rounded-lg bg-[#f7fafc] text-[#2d3748] transition-all duration-200 focus:border-[#3182ce] focus:bg-white focus:shadow-[0_0_0_3px_rgba(66,153,225,0.2)] focus:outline-none" required />
                    <button type="button" className="absolute right-[15px] bg-transparent border-none cursor-pointer text-[#a0aec0] flex hover:text-[#2d3748]" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                        {showConfirmPassword ? <EyeClosedIcon /> : <EyeOpenIcon />}
                    </button>
                </div>
            </div>

            <SubmitButton />
        </form>
    );
}