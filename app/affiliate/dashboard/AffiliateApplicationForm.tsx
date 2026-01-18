//app/affiliate/dashboard/AffiliateApplicationForm.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IoCheckmarkCircle, IoAlertCircle } from "react-icons/io5";

const REGISTER_AFFILIATE_MUTATION = `
mutation RegisterAffiliate($key: String!, $email: String!, $notes: String!) {
  registerAffiliate(input: {
    secretKey: $key,
    paymentEmail: $email,
    promotionMethod: $notes
  }) {
    success
    message
  }
}
`;

export default function AffiliateApplicationForm({ secretKey }: { secretKey: string }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus('idle');

    const endpoint = process.env.NEXT_PUBLIC_WORDPRESS_GRAPHQL_ENDPOINT;
    if (!endpoint) return;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: REGISTER_AFFILIATE_MUTATION,
          variables: { key: secretKey, email, notes }
        }),
      });

      const data = await response.json();

      if (data.errors) {
        setStatus('error');
        setMessage('Submission failed. Please try again.');
      } else {
        const result = data.data.registerAffiliate;
        if (result.success) {
          setStatus('success');
          setMessage(result.message);
          // পেজ রিফ্রেশ করে স্ট্যাটাস আপডেট দেখানোর জন্য
          setTimeout(() => {
             router.refresh();
          }, 2000);
        } else {
          setStatus('error');
          setMessage(result.message);
        }
      }
    } catch (error) {
      setStatus('error');
      setMessage('Network error. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'success') {
    return (
      <div className="bg-green-50 border border-green-200 p-8 rounded-lg text-center animate-fadeIn">
        <div className="flex justify-center mb-4 text-green-600">
            <IoCheckmarkCircle size={50} />
        </div>
        <h3 className="text-xl font-bold text-green-800 mb-2">Application Received!</h3>
        <p className="text-green-700">{message}</p>
        <p className="text-sm text-green-600 mt-4">We will review your application shortly.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#e0e0e0] p-6 md:p-8 rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold text-[#333] mb-6">Affiliate Application</h2>
      
      {status === 'error' && (
        <div className="bg-red-50 text-red-700 p-4 rounded mb-6 flex items-center gap-2 border border-red-200">
            <IoAlertCircle size={20} />
            {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-5">
          <label className="block text-sm font-bold text-[#333] mb-2">PayPal Email Address</label>
          <input
            type="email"
            required
            placeholder="Where should we send your payouts?"
            className="w-full p-3 border border-[#ddd] rounded focus:outline-none focus:border-[#007bff]"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <p className="text-xs text-[#666] mt-1">We use PayPal for commission payouts.</p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-bold text-[#333] mb-2">How will you promote us?</label>
          <textarea
            required
            rows={4}
            placeholder="Tell us about your audience, website, or social media channels..."
            className="w-full p-3 border border-[#ddd] rounded focus:outline-none focus:border-[#007bff]"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#333] text-white py-3 px-6 rounded font-bold hover:bg-black transition disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Submitting...' : 'Apply Now'}
        </button>
      </form>
    </div>
  );
}