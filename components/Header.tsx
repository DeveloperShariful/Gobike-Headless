// components/Header.tsx
// components/Header.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '../context/CartContext';
import { useAuth } from '@/app/providers/AuthProvider';
import SearchOverlay from './SearchOverlay';
import MiniCart from './MiniCart';
import Image from 'next/image';

// IoPersonOutline রিমুভ করা হয়েছে কারণ এখন আর আইকন লাগবে না
import { IoSearch, IoMenu, IoClose } from "react-icons/io5";

export default function Header() {
  const { cartItems, isMiniCartOpen, openMiniCart, closeMiniCart } = useCart();
  const { user } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

  const closeAllOverlays = () => {
    setIsMenuOpen(false);
    setIsSearchOpen(false);
  }

  return (
    <>
      <header className="bg-white border-b border-[#eaeaea] py-1.5 sticky top-[55px] z-50 transition-[top] duration-300 ease-in-out md:top-[48px]">
        
        <div className="max-w-[1400px] mx-auto px-6 flex lg:grid lg:grid-cols-3 items-center justify-between relative">
          
          <div className="flex flex-1 lg:flex-none items-center justify-start">
            <button 
                onClick={() => setIsMenuOpen(true)} 
                className="flex lg:hidden bg-transparent border-none cursor-pointer p-2 text-[#333] items-center mr-2"
                aria-label="Menu"
            >
                <IoMenu size={35} />
            </button>
            <div className="hidden lg:block">
              <Link href="/" className="flex items-center no-underline">
                  <Image 
                    src="https://gobikes.au/wp-content/uploads/2025/06/GOBIKE-Electric-Bike-for-kids-1.webp" 
                    alt="GoBike Logo" 
                    width={1846} 
                    height={417} 
                    priority 
                    className="h-[60px] w-auto max-w-full" 
                  />
              </Link>
            </div>
          </div>

          <div className="block lg:hidden absolute left-1/2 -translate-x-1/2">
            <Link href="/" className="flex items-center no-underline">
               <Image 
                src="https://gobikes.au/wp-content/uploads/2025/06/GOBIKE-Electric-Bike-for-kids-1.webp" 
                alt="GoBike Logo" 
                width={1846} 
                height={417} 
                priority 
                className="h-[50px] w-auto max-w-full" 
               />
            </Link>
          </div>
          
          <nav className="hidden lg:flex gap-6 xl:gap-8 items-center justify-self-center">
            {['/', '/bikes', '/spare-parts', '/apparel', '/about', '/contact', '/faq', '/blog'].map((path) => (
                <Link 
                    key={path}
                    href={path} 
                    className={`no-underline text-[15px] xl:text-[16px] font-medium transition-colors duration-200 ease-in-out hover:text-black hover:font-bold whitespace-nowrap ${pathname === path ? 'text-black font-bold' : 'text-[#353535]'}`}
                >
                    {path === '/' ? 'Home' : path.substring(1).replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Link>
            ))}
          </nav>

          <div className="flex flex-1 lg:flex-none items-center justify-end gap-2 justify-self-end">
            <button 
                className="hidden lg:flex items-center gap-2 bg-transparent border-b border-[#d8d8d8] cursor-pointer px-2 pb-0.5 text-[#333] hover:border-black transition-colors" 
                onClick={() => setIsSearchOpen(true)} 
                aria-label="search bar"
            >
              <IoSearch size={22} />
              <span className="text-sm font-medium">Search</span>
            </button>
            
            {/* Desktop Account Link - Icon Removed, Text Added */}
            <Link 
                href={user ? "/account" : "/login"} 
                className="hidden lg:flex bg-transparent border-none cursor-pointer p-2 text-[#333] items-center hover:text-black transition-colors font-medium text-sm whitespace-nowrap"
                aria-label={user ? "My Account" : "Login"}
            >
              {/* IoPersonOutline Removed */}
              <span>{user ? "My Account" : "Login / Register"}</span>
            </Link>
            
            <button 
                className="bg-transparent border-none cursor-pointer relative text-[#333] p-2 hover:text-black transition-colors" 
                onClick={openMiniCart} 
                aria-label="MiniCart" 
            >
              <span className="text-[26px]">🛒</span>
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 bg-black text-white rounded-full h-5 w-5 flex items-center justify-center text-[10px] font-bold">
                    {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <div 
        className={`fixed top-0 left-0 w-[350px] h-[95vh] bg-white z-[1001] transition-transform duration-300 ease-in-out flex flex-col p-6 shadow-[5px_0_15px_rgba(0,0,0,0.1)] ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
          <div className="flex justify-between items-center mb-8 border-b border-[#f0f0f0] pb-4">
             <button 
                className="flex items-center gap-3 w-full bg-transparent border-none border-b border-[#e0e0e0] p-3 mr-4 text-[1.1rem] font-medium text-[#333] cursor-pointer text-left" 
                onClick={() => setIsSearchOpen(true) } 
                aria-label="SearchBar"
             >
              <IoSearch size={22} />
              <span>Search products</span>
            </button>
            <button 
                className="bg-transparent border-none cursor-pointer text-[#333] flex items-center p-2" 
                onClick={() => setIsMenuOpen(false)} 
                aria-label="Close Menu"
            >
                <IoClose size={28} />
            </button>
          </div>
            
            <nav className="flex flex-col gap-6 flex-grow overflow-y-auto">
                {['/', '/bikes', '/spare-parts', '/apparel', '/about', '/faq', '/contact', '/blog'].map((path) => (
                    <Link 
                        key={path}
                        href={path} 
                        className={`text-[1.2rem] font-medium text-[#333] no-underline flex items-center gap-3 bg-transparent border-b border-[#ececec] w-full text-left cursor-pointer p-0 hover:text-black hover:font-bold ${pathname === path ? 'text-black font-bold' : ''}`}
                        onClick={closeAllOverlays}
                    >
                        {path === '/' ? 'Home' : path === '/contact' ? 'Contact us' : path.substring(1).replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Link>
                ))}
            </nav>
          
          <div className="border-t border-[#f0f0f0] pt-4 mt-6">
            {/* Mobile Account Link - Icon Removed */}
            <Link 
                href={user ? "/account" : "/login"}
                className={`text-[1.2rem] font-medium text-[#333] no-underline flex items-center gap-3 bg-transparent border-b border-[#ececec] w-full text-left cursor-pointer p-0 hover:text-black hover:font-bold ${pathname === '/account' || pathname === '/login' ? 'text-black font-bold' : ''}`} 
                onClick={closeAllOverlays} 
                aria-label={user ? "My Account" : "Login"}
            >
                {/* IoPersonOutline Removed */}
                <span>{user ? "My Account" : "Login / Register"}</span>
            </Link>
          </div>
      </div>
      
      {isMenuOpen && (
        <div 
            className="fixed top-0 left-0 w-full h-full bg-black/50 z-[1000]" 
            onClick={() => setIsMenuOpen(false)} 
            aria-label="Close"
        ></div>
      )}
      
      {isSearchOpen && <SearchOverlay onClose={() => setIsSearchOpen(false)} aria-label="Close searchber"/>}
      <MiniCart isOpen={isMiniCartOpen} onClose={closeMiniCart} />
    </>
  );
}