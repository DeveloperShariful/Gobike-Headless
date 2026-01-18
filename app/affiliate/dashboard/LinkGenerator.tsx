//app/affiliate/dashboard/LinkGenerator.tsx

'use client';

import { useState } from 'react';
import { IoCopyOutline, IoCheckmarkCircleOutline, IoLink } from "react-icons/io5";

export default function LinkGenerator({ affiliateId, referralUrl }: { affiliateId: number, referralUrl: string }) {
  const [inputUrl, setInputUrl] = useState('');
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    // ইনপুট খালি থাকলে ডিফল্ট হোমপেজ লিংক জেনারেট করবে
    let targetUrl = inputUrl.trim();
    
    if (!targetUrl) {
      // ইনপুট না দিলে ডিফল্ট রেফারেল লিংক দেখাবে
      setGeneratedUrl(referralUrl);
      return;
    }

    try {
      // যদি ইউজার 'http' না দেয়, আমরা যোগ করে দেব
      if (!targetUrl.startsWith('http')) {
        targetUrl = `https://${targetUrl}`;
      }

      const url = new URL(targetUrl);
      
      // আপনার ডোমেইন চেক (অপশনাল, তবে ভালো প্র্যাকটিস)
      // if (url.hostname !== 'gobikes.au') {
      //   alert('Please verify this is a gobikes.au link');
      // }

      // প্যারামিটার যোগ করা (?sld=ID)
      url.searchParams.set('sld', affiliateId.toString());
      setGeneratedUrl(url.toString());
      setCopied(false);
    } catch (e) {
      alert('Invalid URL format');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedUrl || referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-[#e0e0e0] shadow-sm mb-8">
      <div className="flex items-center gap-3 mb-4 border-b border-[#f0f0f0] pb-3">
        <div className="bg-[#e6f2ff] p-2 rounded-full text-[#007bff]">
            <IoLink size={24} />
        </div>
        <div>
            <h3 className="text-lg font-bold text-[#333] m-0">Link Generator</h3>
            <p className="text-xs text-[#666] m-0">Create unique links to track your sales</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <input 
          type="text" 
          placeholder="Paste any product URL (e.g., https://gobikes.au/bikes/model-x)" 
          className="flex-1 p-3 border border-[#ddd] rounded-md focus:outline-none focus:border-[#007bff] text-sm"
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
        />
        <button 
          onClick={handleGenerate}
          className="bg-[#333] text-white px-6 py-3 rounded-md font-semibold hover:bg-black transition text-sm whitespace-nowrap"
        >
          Get Link
        </button>
      </div>

      {/* Result Box */}
      {(generatedUrl || !inputUrl) && (
        <div className="bg-[#f8f9fa] p-4 rounded-md border border-[#eee] flex flex-col md:flex-row items-center justify-between gap-4">
          <code className="text-[#007bff] font-medium break-all text-sm">
            {generatedUrl || referralUrl}
          </code>
          <button 
            onClick={copyToClipboard}
            className={`flex items-center gap-2 px-4 py-2 rounded text-xs font-bold transition whitespace-nowrap ${
              copied ? 'bg-[#28a745] text-white border-transparent' : 'bg-white text-[#333] border border-[#ddd] hover:bg-[#f0f0f0]'
            }`}
          >
            {copied ? <IoCheckmarkCircleOutline size={16} /> : <IoCopyOutline size={16} />}
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
      )}
    </div>
  );
}