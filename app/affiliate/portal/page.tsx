//app/affiliate/portal/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/providers/AuthProvider';

const REGISTER_USER_AND_AFFILIATE = `
mutation RegisterUserAndAffiliate($username: String!, $email: String!, $password: String!) {
  registerUserAndAffiliate(input: {username: $username, email: $email, password: $password}) {
    success
    message
    userId
  }
}
`;

export default function AffiliatePortalPage() {
  const router = useRouter();
  const { login } = useAuth();
  
  // Registration States
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const [regMessage, setRegMessage] = useState({ type: '', text: '' });
  const [agreed, setAgreed] = useState(false);

  // Login States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Handle Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault(); // পেজ রিলোড বন্ধ করা
    console.log("Register Button Clicked!"); // ডিবাগিং

    // ১. চেকবক্স ভ্যালিডেশন
    if (!agreed) {
        alert("Please agree to the Terms of Service first.");
        return;
    }

    setRegLoading(true);
    setRegMessage({ type: '', text: '' });

    const endpoint = process.env.NEXT_PUBLIC_WORDPRESS_GRAPHQL_ENDPOINT;
    
    // ২. এন্ডপয়েন্ট চেক
    if (!endpoint) {
        setRegMessage({ type: 'error', text: 'Configuration Error: GraphQL Endpoint missing.' });
        setRegLoading(false);
        return;
    }

    try {
        console.log("Sending request to backend...");
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: REGISTER_USER_AND_AFFILIATE,
                variables: { username: regUsername, email: regEmail, password: regPassword }
            }),
        });

        const data = await response.json();
        console.log("Response received:", data);
        
        if (data.errors) {
            console.error("GraphQL Errors:", data.errors);
            setRegMessage({ type: 'error', text: data.errors[0].message || 'Registration failed.' });
        } else {
            const result = data.data.registerUserAndAffiliate;
            if (result.success) {
                setRegMessage({ type: 'success', text: 'Success! ' + result.message });
                // ফর্ম রিসেট
                setRegUsername('');
                setRegEmail('');
                setRegPassword('');
                setAgreed(false);
            } else {
                setRegMessage({ type: 'error', text: result.message });
            }
        }
    } catch (err) {
        console.error("Network Error:", err);
        setRegMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
        setRegLoading(false);
    }
  };

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    try {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: loginEmail, password: loginPassword }),
        });

        const data = await res.json();

        if (data.success) {
            login(data.user);
            router.push('/affiliate/dashboard');
        } else {
            setLoginError('Invalid username or password.');
        }
    } catch (err) {
        setLoginError('Login failed. Try again.');
    } finally {
        setLoginLoading(false);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-10 md:py-16">
        <div className="mb-8">
             <div className="text-sm text-gray-500 mb-2">
                <Link href="/" className="hover:text-black">Home</Link> / Affiliate Portal
             </div>
             <h1 className="text-3xl font-bold text-[#333]">Affiliate Portal</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            
            {/* REGISTER FORM */}
            <div className="bg-white p-8 border border-[#e0e0e0] rounded-lg shadow-sm">
                <h2 className="text-2xl font-normal text-[#333] mb-2">Register as Affiliate</h2>
                <p className="text-sm text-[#666] mb-6">
                    Create a new account to become an affiliate.
                </p>

                {regMessage.text && (
                    <div className={`p-4 mb-4 rounded text-sm ${regMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {regMessage.text}
                    </div>
                )}

                <form onSubmit={handleRegister} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-bold text-[#333] mb-1">Username</label>
                        <input 
                            type="text" required 
                            className="w-full p-3 border border-[#ddd] rounded focus:outline-none focus:border-black"
                            placeholder="Your username"
                            value={regUsername}
                            onChange={(e) => setRegUsername(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-[#333] mb-1">Account Email</label>
                        <input 
                            type="email" required 
                            className="w-full p-3 border border-[#ddd] rounded focus:outline-none focus:border-black"
                            placeholder="Your primary email"
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-[#333] mb-1">Password</label>
                        <input 
                            type="password" required 
                            className="w-full p-3 border border-[#ddd] rounded focus:outline-none focus:border-black"
                            placeholder="Create a password"
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-2 mt-2 bg-gray-50 p-3 rounded border border-gray-100">
                        <input 
                            type="checkbox" 
                            id="terms" 
                            className="w-4 h-4 cursor-pointer accent-black"
                            checked={agreed}
                            onChange={(e) => setAgreed(e.target.checked)}
                        />
                        <label htmlFor="terms" className="text-sm text-[#333] cursor-pointer select-none">
                            I agree to the <Link href="/terms" className="underline font-bold">Terms of Service</Link>
                        </label>
                    </div>

                    <button 
                        type="submit" 
                        disabled={regLoading || !agreed}
                        className={`font-bold py-3 mt-2 rounded transition text-white ${
                            regLoading || !agreed 
                                ? 'bg-gray-400 cursor-not-allowed opacity-70' 
                                : 'bg-black hover:bg-[#333] cursor-pointer'
                        }`}
                    >
                        {regLoading ? 'Processing...' : 'Register as Affiliate'}
                    </button>
                    
                    {!agreed && (
                        <p className="text-xs text-red-500 mt-1">* You must check the box to register.</p>
                    )}
                </form>
            </div>

            {/* LOGIN FORM (Right Side) */}
            <div className="bg-white p-8 border border-[#e0e0e0] rounded-lg shadow-sm h-fit">
                <h2 className="text-2xl font-normal text-[#333] mb-6">Login as Affiliate</h2>

                {loginError && (
                    <div className="bg-red-50 text-red-700 p-3 mb-4 rounded text-sm">
                        {loginError}
                    </div>
                )}

                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-bold text-[#333] mb-1">Account email or username</label>
                        <input 
                            type="text" required 
                            className="w-full p-3 border border-[#ddd] rounded focus:outline-none focus:border-black"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-[#333] mb-1">Password</label>
                        <input 
                            type="password" required 
                            className="w-full p-3 border border-[#ddd] rounded focus:outline-none focus:border-black"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                        />
                    </div>
                    
                    <Link href="/forgot-password" className="text-sm text-[#666] hover:text-black mb-2">
                        Forgot your password?
                    </Link>

                    <button 
                        type="submit" 
                        disabled={loginLoading}
                        className="bg-black text-white font-bold py-3 rounded hover:bg-[#333] transition disabled:opacity-70"
                    >
                        {loginLoading ? 'Logging in...' : 'Login as Affiliate'}
                    </button>
                </form>
            </div>

        </div>
    </div>
  );
}