// components/Footer.tsx
'use client';
import { FaFacebookF, FaInstagram, FaYoutube, FaTiktok } from 'react-icons/fa';
import Image from 'next/image';
import { useState } from 'react';
import Link from 'next/link';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubscription = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    setFeedbackMessage('Subscribing...');

    try {
        const response = await fetch('/api/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email })
        });
        
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'An error occurred.');
        }

        setStatus('success');
        setFeedbackMessage(result.message);
        setEmail('');

    } catch (error: unknown) {
        setStatus('error');
        let errorMessage = 'Failed to subscribe. Please try again.';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    setFeedbackMessage(errorMessage);
    
    } finally {
        setTimeout(() => {
            setFeedbackMessage('');
            setStatus('idle');
        }, 5000);
    }
  };

  return (
    <footer id="colophon" className="font-sans bg-white">
      
      {/* Subscription Section */}
      <div className="bg-[#fdf5f5] px-5 py-10 items-center">
          <div className="max-w-[1500px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                  <h3 className="text-lg md:text-xl font-bold mb-2 uppercase tracking-widest">SIGN UP FOR YOUR CHANCE TO WIN A GOBIKE!</h3>
                  <p className="text-[#555] leading-relaxed">We are giving away a new Gobike to one of our subscribers. All you need to do is subscribe, and you could be our winner! Good luck 👍</p>
              </div>
              
              <div>
                  <form className="flex bg-white border border-[#ddd] rounded-lg overflow-hidden max-w-full md:max-w-[400px]" onSubmit={handleSubscription}>
                      <input 
                        type="email" 
                        name="subscriber_email" 
                        placeholder="email@address.com" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                        className="flex-grow border-none p-3 text-base outline-none w-full" 
                      />
                      <button 
                        type="submit" 
                        className="bg-black text-white border-none py-2 px-4 text-sm md:text-base font-semibold cursor-pointer flex items-center gap-2 whitespace-nowrap"
                      >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                          <span>Sign Up</span>
                      </button>
                  </form>
                  {feedbackMessage && (
                    <p className={`text-sm font-bold mt-2.5 ${status === 'success' ? 'text-[#28a745]' : 'text-[#dc3545]'}`}>
                        {feedbackMessage}
                    </p>
                  )}
              </div>
          </div>
      </div>

      {/* Main Footer Content */}
      <div className="bg-white text-[#1a1a1a] py-12 px-4 border-t border-[#e9e9e9]">
          
          <div className="grid max-w-[1500px] mx-auto gap-x-8 gap-y-10 grid-cols-2 lg:grid-cols-5">
              
              {/* Logo Column - (Fixed Vertical Alignment) */}
              <div className="col-span-2 lg:col-span-1 flex justify-center lg:justify-start lg:items-start mb-2 lg:mb-0 border-b lg:border-none pb-1 lg:pb-0 border-[#f0f0f0]">
                 <Link href="/">
                  <Image 
                    src="https://gobikes.au/wp-content/uploads/2025/06/GOBIKE-Electric-Bike-for-kids.webp" 
                    alt="GoBike Australia Logo"  
                    width={1861} 
                    height={430} 
                    className="w-[200px] md:w-[250px] h-auto" 
                  />
                  </Link>
              </div>

              {/* Follow Us Column */}
              <div>
                <h3 className="text-lg font-bold mb-4 capitalize border-b-2 border-[#1a1a1a] pb-2 inline-block">Follow Us</h3>
                <ul className="list-none p-0 m-0 space-y-3">
                    <li>
                      <a href="https://www.facebook.com/Go-Bike-104997195659873" target="_blank" rel="noopener noreferrer" className="text-[#555] flex items-center gap-3 hover:text-black font-medium transition-colors">
                        <FaFacebookF className="w-6 h-6 text-white bg-[#1877F2] rounded-full p-1" />
                        <span>Facebook</span>
                      </a>
                    </li>
                    <li>
                      <a href="https://www.instagram.com/gobikeoz/" target="_blank" rel="noopener noreferrer" className="text-[#555] flex items-center gap-3 hover:text-black font-medium transition-colors">
                        <FaInstagram className="w-6 h-6 text-white bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] rounded-full p-1" />
                        <span>Instagram</span>
                      </a>
                    </li>
                    <li>
                      <a href="https://www.youtube.com/@Gobike-r7b" target="_blank" rel="noopener noreferrer" className="text-[#555] flex items-center gap-3 hover:text-black font-medium transition-colors">
                        <FaYoutube className="w-6 h-6 text-[#ff0000] bg-white" />
                        <span>Youtube</span>
                      </a>
                    </li>
                    <li>
                      <a href="https://www.tiktok.com/@gobikeoz" target="_blank" rel="noopener noreferrer" className="text-[#555] flex items-center gap-3 hover:text-black font-medium transition-colors">
                        <FaTiktok className="w-6 h-6 text-black bg-white" />
                        <span>TikTok</span>
                      </a>
                    </li>
                </ul>
              </div>

              {/* Quick Links Column */}
              <div>
                  <h3 className="text-lg font-bold mb-4 capitalize border-b-2 border-[#1a1a1a] pb-2 inline-block">Quick Links</h3>
                  <ul className="list-none p-0 m-0 space-y-2">
                      {['/', '/bikes', '/products', '/about', '/blog'].map((path) => (
                        <li key={path}>
                            <Link href={path} className="text-[#555] hover:text-black hover:font-bold transition-all">
                                {path === '/' ? 'Home' : path === '/products' ? 'Spare Parts' : path.substring(1).replace(/^\w/, c => c.toUpperCase())}
                            </Link>
                        </li>
                      ))}
                  </ul>
              </div>

              {/* Customers Column */}
              <div>
                  <h3 className="text-lg font-bold mb-4 capitalize border-b-2 border-[#1a1a1a] pb-2 inline-block">Customers</h3>
                  <ul className="list-none p-0 m-0 space-y-2">
                      <li><a href="https://gobikes.au/my-account/" className="text-[#555] hover:text-black hover:font-bold transition-all">Log In/Register</a></li>
                      {['/contact', '/faq', '/terms-and-conditions', '/privacy-policy', '/refund-and-returns-policy'].map((path) => (
                        <li key={path}>
                            <Link href={path} className="text-[#555] hover:text-black hover:font-bold transition-all">
                                {path === '/contact' ? 'Contact Us' : path === '/faq' ? 'FAQs' : path === '/terms-and-conditions' ? 'Terms & Condition' : path.substring(1).replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </Link>
                        </li>
                      ))}
                  </ul>
              </div>

              {/* Our Promise Column */}
              <div>
                  <h3 className="text-lg font-bold mb-4 capitalize border-b-2 border-[#1a1a1a] pb-2 inline-block">Our Promise</h3>
                  <div className="space-y-3">
                    {[
                        { text: '1 Year Full Warranty', iconPath: "M9 12l2 2 4-4", extra: <circle cx="12" cy="12" r="10"></circle> },
                        { text: 'Fast Shipping Aus-Wide', iconPath: "M2.5 2.5h3l2.7 12.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6l1.6-8.4H7.1" },
                        { text: 'Expert Aussie Support', iconPath: "M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2", extra: <><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline></> },
                        { text: '100% Secure Checkout', iconPath: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" },
                        { text: 'Easy 30 days returns', iconPath: "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" },
                    ].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 text-[#555] hover:text-black font-medium transition-colors">
                            <svg className="w-5 h-5 text-[#333]" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                {item.extra}
                                <path d={item.iconPath}></path>
                            </svg>
                            <span>{item.text}</span>
                        </div>
                    ))}
                  </div>
              </div>
          </div>
      </div>
      
      {/* Bottom Bar */}
      <div className="bg-black text-white p-5 text-sm">
          <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row flex-wrap justify-between items-center gap-4 text-center md:text-left">
              <div>Copyright &copy; {new Date().getFullYear()} GoBike All Rights Reserved</div>
              <div>
                  <Image src="https://gobikes.au/wp-content/uploads/2018/07/trust-symbols_b.jpg" width={1600} height={168} alt="Secure Payment Methods" className="max-h-[35px] w-auto" />
              </div>
          </div>
      </div>
    </footer>
  );
}