//app/affiliate/links/_components/CustomSlugManager.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IoSaveOutline, IoTrashOutline, IoCheckmarkCircle } from 'react-icons/io5';

const SAVE_SLUG_MUTATION = `
mutation SaveSlug($key: String!, $slug: String!) {
  saveCustomSlug(input: {secretKey: $key, slug: $slug}) {
    success
    message
  }
}
`;

const DELETE_SLUG_MUTATION = `
mutation DeleteSlug($key: String!) {
  deleteCustomSlug(input: {secretKey: $key}) {
    success
    message
  }
}
`;

export default function CustomSlugManager({ 
    secretKey, 
    currentSlug 
}: { 
    secretKey: string, 
    currentSlug: string 
}) {
    const [slug, setSlug] = useState(currentSlug || '');
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState({ type: '', text: '' });
    const router = useRouter();

    // Save Function
    const handleSave = async () => {
        if (!slug) return;
        setLoading(true);
        setMsg({ type: '', text: '' });

        const endpoint = process.env.NEXT_PUBLIC_WORDPRESS_GRAPHQL_ENDPOINT;
        if (!endpoint) return;

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: SAVE_SLUG_MUTATION,
                    variables: { key: secretKey, slug: slug }
                })
            });
            const json = await res.json();
            const result = json.data?.saveCustomSlug;

            if (result?.success) {
                setMsg({ type: 'success', text: result.message });
                router.refresh(); 
            } else {
                setMsg({ type: 'error', text: result?.message || 'Failed to save.' });
            }
        } catch (error) {
            setMsg({ type: 'error', text: 'Network error.' });
        } finally {
            setLoading(false);
        }
    };

    // Remove Function
    const handleRemove = async () => {
        if (!confirm('Are you sure you want to remove your custom slug?')) return;
        
        setLoading(true);
        setMsg({ type: '', text: '' });

        const endpoint = process.env.NEXT_PUBLIC_WORDPRESS_GRAPHQL_ENDPOINT;
        if (!endpoint) return;

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: DELETE_SLUG_MUTATION,
                    variables: { key: secretKey }
                })
            });
            const json = await res.json();
            const result = json.data?.deleteCustomSlug;

            if (result?.success) {
                setMsg({ type: 'success', text: result.message });
                setSlug(''); // Clear local slug
                router.refresh();
            } else {
                setMsg({ type: 'error', text: result?.message || 'Failed to remove.' });
            }
        } catch (error) {
            setMsg({ type: 'error', text: 'Network error.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mt-8">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Custom Slug</h3>
            <p className="text-sm text-gray-500 mb-4">
                {currentSlug 
                    ? "You have an active custom slug. Links using this slug will track referrals." 
                    : "Create a personalized alias for your links (e.g. /ref/mybrand)."
                }
            </p>

            {currentSlug ? (
                // VIEW MODE (Remove Option)
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-md p-4">
                    <div className="flex items-center gap-2 text-green-800 font-bold">
                        <IoCheckmarkCircle size={22} />
                        <span>{currentSlug}</span>
                    </div>
                    <button 
                        onClick={handleRemove}
                        disabled={loading}
                        className="text-red-600 hover:text-red-800 text-sm font-bold flex items-center gap-1 transition disabled:opacity-50"
                    >
                        <IoTrashOutline size={18} />
                        {loading ? 'Removing...' : 'Remove'}
                    </button>
                </div>
            ) : (
                // EDIT MODE (Save Option)
                <div className="flex gap-4 items-start">
                    <div className="flex-1">
                        <input 
                            type="text" 
                            value={slug}
                            onChange={(e) => setSlug(e.target.value.replace(/[^a-zA-Z0-9-_]/g, ''))} 
                            placeholder="my-brand-name"
                            className="w-full border border-gray-300 rounded-md px-4 py-2.5 focus:outline-none focus:border-black text-sm"
                        />
                    </div>
                    <button 
                        onClick={handleSave}
                        disabled={loading || !slug}
                        className="bg-black text-white px-6 py-2.5 rounded text-sm font-bold hover:bg-gray-800 transition disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? 'Saving...' : <><IoSaveOutline size={18} /> Save Slug</>}
                    </button>
                </div>
            )}

            {msg.text && (
                <p className={`text-xs mt-3 ${msg.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                    {msg.text}
                </p>
            )}
        </div>
    );
}