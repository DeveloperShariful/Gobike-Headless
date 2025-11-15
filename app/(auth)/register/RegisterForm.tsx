// app/(auth)/register/RegisterForm.tsx
'use client';

import { useFormState, useFormStatus } from 'react-dom';
import Link from 'next/link';
import { useState } from 'react';
import styles from './register.module.css';

// SVG আইকন
const EyeOpenIcon = () => ( <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z" /><path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" /></svg> );
const EyeClosedIcon = () => ( <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7.029 7.029 0 0 0 2.79-.588zM5.21 3.088A7.028 7.028 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474L5.21 3.089z" /><path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829l-2.83-2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12-.708.708z" /></svg> );
const UserIcon = () => ( <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/></svg> );
const EmailIcon = () => ( <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M.05 3.555A2 2 0 0 1 2 2h12a2 2 0 0 1 1.95 1.555L8 8.414.05 3.555ZM0 4.697v7.104l5.803-3.558L0 4.697ZM6.761 8.83l-6.57 4.027A2 2 0 0 0 2 14h12a2 2 0 0 0 1.808-1.144l-6.57-4.027L8 9.586l-1.239-.757Zm3.436-.586L16 11.801V4.697l-5.803 3.546Z"/></svg> );

type ActionState = { error?: string; success?: boolean; };

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button type="submit" className={styles.btn} disabled={pending}>
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
            <div className={styles.successMessage}>
                <p><strong>Registration successful!</strong></p>
                <p>
                    <Link href="/login">Please click here to log in.</Link>
                </p>
            </div>
        );
    }

    return (
        <form action={formAction}>
            {state.error && <p className={styles.errorMessage}>{state.error}</p>}

            {/* First Name এবং Last Name পাশাপাশি */}
            <div className={styles.nameFields}>
                <div className={styles.formGroup}>
                    <label htmlFor="firstName" className={styles.label}>First Name:</label>
                    <div className={styles.inputWrapper}>
                        <span className={styles.inputIcon}><UserIcon /></span>
                        <input id="firstName" name="firstName" type="text" className={styles.formInput} required />
                    </div>
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="lastName" className={styles.label}>Last Name:</label>
                    <div className={styles.inputWrapper}>
                        <span className={styles.inputIcon}><UserIcon /></span>
                        <input id="lastName" name="lastName" type="text" className={styles.formInput} required />
                    </div>
                </div>
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.label}>Email:</label>
                <div className={styles.inputWrapper}>
                    <span className={styles.inputIcon}><EmailIcon /></span>
                    <input id="email" name="email" type="email" className={styles.formInput} required />
                </div>
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="password" className={styles.label}>Password:</label>
                <div className={styles.inputWrapper}>
                    <span className={styles.inputIcon}>
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/></svg>
                    </span>
                    <input id="password" name="password" type={showPassword ? 'text' : 'password'} className={styles.passwordInput} required />
                    <button type="button" className={styles.passwordToggleBtn} onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeClosedIcon /> : <EyeOpenIcon />}
                    </button>
                </div>
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="confirmPassword" className={styles.label}>Confirm Password:</label>
                <div className={styles.inputWrapper}>
                     <span className={styles.inputIcon}>
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/></svg>
                    </span>
                    <input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} className={styles.passwordInput} required />
                    <button type="button" className={styles.passwordToggleBtn} onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                        {showConfirmPassword ? <EyeClosedIcon /> : <EyeOpenIcon />}
                    </button>
                </div>
            </div>

            <SubmitButton />
        </form>
    );
}