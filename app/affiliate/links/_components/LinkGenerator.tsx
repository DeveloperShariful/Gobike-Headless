//app/affiliate/links/_components/LinkGenerator.tsx

'use client';

import { useState } from 'react';
import { IoCopyOutline, IoCheckmarkOutline } from 'react-icons/io5';

export default function LinkGenerator({ affiliateId, referralUrl }: { affiliateId: number, referralUrl: string }) {
  const [inputUrl, setInputUrl] = useState('');
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    if (!inputUrl) return;
    
    // Check if URL is valid
    let cleanUrl = inputUrl.trim();
    if (!cleanUrl.startsWith('http')) {
        cleanUrl = 'https://' + cleanUrl;
    }

    // Append query param
    const separator = cleanUrl.includes('?') ? '&' : '?';
    const finalUrl = `${cleanUrl}${separator}sld=${affiliateId}`;
    
    setGeneratedUrl(finalUrl);
  };

  const handleCopy = () => {
    if (!generatedUrl) return;
    navigator.clipboard.writeText(generatedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-4">URL Generator</h3>
        
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">1) Enter any page URL from our site</label>
            <input 
                type="text" 
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="https://gobike.au/bikes/some-product"
                className="w-full border border-gray-300 rounded-md px-4 py-2.5 focus:outline-none focus:border-black text-sm"
            />
        </div>

        {inputUrl && (
             <div className="mb-6">
                <button 
                    onClick={handleGenerate}
                    className="bg-black text-white px-6 py-2 rounded text-sm font-bold hover:bg-gray-800 transition"
                >
                    Generate Link
                </button>
             </div>
        )}

        <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">2) Your generated affiliate link</label>
            <div className="flex gap-0">
                <input 
                    type="text" 
                    readOnly
                    value={generatedUrl || referralUrl} // Show default if nothing generated
                    className="w-full border border-gray-300 border-r-0 rounded-l-md px-4 py-2.5 bg-gray-50 text-gray-600 text-sm font-mono"
                />
                <button 
                    onClick={generatedUrl ? handleCopy : () => navigator.clipboard.writeText(referralUrl)}
                    className="bg-gray-100 border border-gray-300 rounded-r-md px-4 flex items-center gap-2 hover:bg-gray-200 transition text-gray-700 font-medium text-sm"
                >
                    {copied ? <IoCheckmarkOutline className="text-green-600" size={18} /> : <IoCopyOutline size={18} />}
                    {copied ? 'Copied' : 'Copy'}
                </button>
            </div>
        </div>
    </div>
  );
}