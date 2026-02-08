// app/contact/ContactPageClient.tsx

"use client";

import { useState, FormEvent, ChangeEvent } from 'react';
import toast from 'react-hot-toast';
import Image from 'next/image';
import Breadcrumbs from '../../components/Breadcrumbs';
import Link from 'next/link';

export default function ContactPageClient() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    toast.loading('Sending your message...');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      toast.dismiss();

      if (response.ok) {
        setStatus('success');
        toast.success(result.message || 'Message sent successfully!');
        setFormData({ name: '', email: '', phone: '', message: '' });
      } else {
        throw new Error(result.message || 'An unknown error occurred.');
      }
    } catch (error: unknown) {
      toast.dismiss();
      setStatus('error');
      let errorMessage = 'An error occurred while sending the message.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    }
  };

  return (
    <div>
      <Breadcrumbs pageTitle="Contact Us" />
      {/* .gobikeContactPageWrapper replaced */}
      <div className="pr-0 md:pr-8 font-sans">
        {/* .contactContainer replaced */}
        <div className="max-w-[1100px] mx-auto px-4">
          
          {/* Top Section: Intro */}
          {/* .contactIntroGrid replaced */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
              
              {/* .contactIntroText replaced */}
              <div className="text-left">
                  <h1 className="text-[2rem] font-extrabold leading-[1.2] mb-6 text-gray-900">
                    Get in Touch With an Ebike Expert
                  </h1>
                  <p className="text-[1.1rem] leading-[1.7] text-gray-600 mb-6">
                    Whether you&apos;re looking for the perfect kids <strong>Ebike</strong>, need help with a recent <strong>ebike order</strong>, or just want to chat about bikes, our friendly Australian support team is here to help.
                  </p>
                  <p className="text-[1.1rem] leading-[1.7] text-gray-600 mb-6">
                    We aim to respond within the hour via email at <a href="mailto:gobike@gobike.au" className="text-blue-600 font-medium hover:underline">gobike@gobike.au</a>. For the quickest response, message us on:
                  </p>
                  
                  {/* .contactSocialLinks replaced */}
                  <div className="flex gap-4 mb-6">
                      <a 
                        href="https://www.facebook.com/Go-Bike-104997195659873" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="px-6 py-3 rounded-lg font-semibold text-white bg-[#1877F2] hover:opacity-90 transition-opacity"
                      >
                        Facebook
                      </a>
                      <a 
                        href="https://www.instagram.com/gobikeoz/" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="px-6 py-3 rounded-lg font-semibold text-white bg-[linear-gradient(45deg,#f09433_0%,#e6683c_25%,#dc2743_50%,#cc2366_75%,#bc1888_100%)] hover:opacity-90 transition-opacity"
                      >
                        Instagram
                      </a>
                  </div>

                  {/* .contactInfoBox replaced */}
                  <div className="bg-gray-50 rounded-lg p-6 text-sm leading-[1.6] border-l-4 border-blue-600 text-gray-800">
                      <p className="mb-2"><strong>Warehouse Location:</strong> CAMDEN SOUTH NSW. Please note, pickup is available by request only.</p>
                      <p><strong>Retailer Locations:</strong><br /> NSW – ON TWO WHEELS GLEDSWOOD HILLS – CAMDEN CYCLES – ENGADINE CYCLES AND SCOOTERS – SINGLETON BIKE SHOP<br /> VIC – TBC in 2026.<br />QLD – TBC in 2026</p>
                  </div>
              </div>

              {/* .contactIntroImage replaced */}
              <div className="text-center order-first md:order-none">
                  <Image 
                      src="https://gobikes.au/wp-content/uploads/2025/10/j1.webp" 
                      alt="A child GoBike electric balance bikes battery"
                      width={500}
                      height={500}
                      sizes="(max-width: 768px) 100vw, 50vw"
                      style={{ width: '100%', height: 'auto', borderRadius: '12px' }}
                  />
              </div>
          </div>

          {/* Middle Section: Contact Form */}
          {/* .gobikeFormContainer replaced */}
          <div className="max-w-[800px] mx-auto my-16 bg-white p-4 rounded-xl border border-[#e7e7e7] shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
            <h2 className="text-center text-[2rem] font-bold mb-8 text-[#1a1a1a]">Send Us a Message</h2>
              <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col">
                  <input 
                    type="text" 
                    id="name" 
                    name="name" 
                    placeholder="Your Name *" 
                    value={formData.name} 
                    onChange={handleInputChange} 
                    required 
                    className="w-full p-4 border border-[#dcdcdc] rounded-lg text-base bg-[#f9f9f9] transition-all duration-200 focus:outline-none focus:border-black focus:shadow-[0_0_0_2px_rgba(0,0,0,0.1)]"
                  />
                </div>
                <div className="flex flex-col">
                  <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    placeholder="Your Email *" 
                    value={formData.email} 
                    onChange={handleInputChange} 
                    required 
                    className="w-full p-4 border border-[#dcdcdc] rounded-lg text-base bg-[#f9f9f9] transition-all duration-200 focus:outline-none focus:border-black focus:shadow-[0_0_0_2px_rgba(0,0,0,0.1)]"
                  />
                </div>
                {/* .formGroupFull replaced */}
                <div className="col-span-1 md:col-span-2">
                  <input 
                    type="tel" 
                    id="phone" 
                    name="phone" 
                    placeholder="Your Phone" 
                    value={formData.phone} 
                    onChange={handleInputChange} 
                    className="w-full p-4 border border-[#dcdcdc] rounded-lg text-base bg-[#f9f9f9] transition-all duration-200 focus:outline-none focus:border-black focus:shadow-[0_0_0_2px_rgba(0,0,0,0.1)]"
                  />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <textarea 
                    id="message" 
                    name="message" 
                    placeholder="Your Message *" 
                    value={formData.message} 
                    onChange={handleInputChange} 
                    required 
                    rows={5}
                    className="w-full p-4 border border-[#dcdcdc] rounded-lg text-base bg-[#f9f9f9] transition-all duration-200 focus:outline-none focus:border-black focus:shadow-[0_0_0_2px_rgba(0,0,0,0.1)] resize-y"
                  ></textarea>
                </div>
                <div className="col-span-1 md:col-span-2">
                  <button 
                    type="submit" 
                    disabled={status === 'loading'}
                    className="bg-[#1a1a1a] text-white border-none p-4 text-[1.1rem] font-semibold rounded-lg cursor-pointer w-full transition-colors duration-200 hover:bg-[#333] disabled:bg-[#ccc] disabled:cursor-not-allowed"
                  >
                    {status === 'loading' ? 'Sending...' : 'Send Message'}
                  </button>
               </div>
             </form>
           {/* Feedback Messages */}
           {status === 'success' && <p className="text-center mt-6 p-4 rounded-lg bg-[#d4edda] text-[#155724]">Thank you for your message!</p>}
           {status === 'error' && <p className="text-center mt-6 p-4 rounded-lg bg-[#f8d7da] text-[#721c24]">Something went wrong. Please try again.</p>}
          </div>

          {/* Bottom Section: Consumer Rights */}
          {/* .consumerRightsSection replaced */}
          <div className="bg-black text-white p-12 rounded-2xl text-center mb-8">
              <div className="flex flex-col items-center">
                  <div className="mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#007bff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
                  </div>
                  <h2 className="text-[1.8rem] mb-4 font-bold">Your Rights When Buying an Ebike in Australia</h2>
                  <p className="max-w-[700px] mx-auto mb-6 leading-[1.7] text-[#ccc]">
                    At <Link href="https://gobike.au/" className="text-white font-bold hover:underline">GoBike Australia</Link>, we are committed to fair and transparent practices. We adhere strictly to all guidelines set by the <strong>Australian Consumer Law</strong> to ensure your rights are protected when purchasing a kids electric bike.
                  </p>
                  <p className="max-w-[700px] mx-auto mb-6 leading-[1.7] text-[#ccc]">
                    You have the right to a repair, replacement, or refund for a major failure and compensation for any other reasonably foreseeable loss or damage.
                  </p>
                  <a 
                    href="https://www.accc.gov.au/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-block bg-white text-black px-8 py-3 rounded-lg font-semibold no-underline hover:bg-gray-200 transition-colors"
                  >
                    Learn More at ACCC Website
                  </a>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}