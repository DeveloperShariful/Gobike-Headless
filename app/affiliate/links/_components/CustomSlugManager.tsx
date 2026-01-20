//app/affiliate/links/_components/CustomSlugManager.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IoSaveOutline } from 'react-icons/io5';

// --------------------------------------------------------------------
// 1. MUTATION
// --------------------------------------------------------------------
const SAVE_SLUG_MUTATION = `
mutation SaveSlug($key: String!, $slug: String!) {
  saveCustomSlug(input: {secretKey: $key, slug: $slug}) {
    success
    message
  }
}
`;

// --------------------------------------------------------------------
// 2. COMPONENT
// --------------------------------------------------------------------
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

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mt-8">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Custom Slug</h3>
            <p className="text-sm text-gray-500 mb-4">
                Create a personalized alias for your links (e.g. <code>/ref/mybrand</code>).
            </p>

            <div className="flex gap-4 items-start">
                <div className="flex-1">
                    <input 
                        type="text" 
                        value={slug}
                        onChange={(e) => setSlug(e.target.value.replace(/[^a-zA-Z0-9-_]/g, ''))} 
                        placeholder="my-brand-name"
                        className="w-full border border-gray-300 rounded-md px-4 py-2.5 focus:outline-none focus:border-black text-sm"
                    />
                    {msg.text && (
                        <p className={`text-xs mt-2 ${msg.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                            {msg.text}
                        </p>
                    )}
                </div>
                <button 
                    onClick={handleSave}
                    disabled={loading || slug === currentSlug}
                    className="bg-black text-white px-6 py-2.5 rounded text-sm font-bold hover:bg-gray-800 transition disabled:opacity-50 flex items-center gap-2"
                >
                    {loading ? 'Saving...' : <><IoSaveOutline size={18} /> Save Slug</>}
                </button>
            </div>
        </div>
    );
}