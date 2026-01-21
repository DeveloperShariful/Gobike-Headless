// components/Header.tsx

'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCart } from '../context/CartContext';
import { useAuth } from '@/app/providers';
import SearchOverlay from './SearchOverlay';
import MiniCart from './MiniCart';
import Image from 'next/image';
import { 
  IoSearch, 
  IoMenu, 
  IoClose, 
  IoPersonOutline, 
  IoLogOutOutline, 
  IoTrendingUpOutline, 
  IoPersonCircleOutline, 
  IoSpeedometerOutline 
} from "react-icons/io5";

export default function Header() {
  const { cartItems, isMiniCartOpen, openMiniCart, closeMiniCart } = useCart();
  const { user, logout } = useAuth(); 
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // ড্রপডাউন স্টেট
  const [isAuthDropdownOpen, setIsAuthDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const pathname = usePathname();
  const router = useRouter();

  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

  // Affiliate Status Check (Case Insensitive)
  const status = user?.affiliateStatus ? user.affiliateStatus.toLowerCase() : '';
  const isAffiliate = status === 'active' || status === 'pending' || status === 'approved';

  const closeAllOverlays = () => {
    setIsMenuOpen(false);
    setIsSearchOpen(false);
    setIsAuthDropdownOpen(false);
  }

  // ড্রপডাউনের বাইরে ক্লিক হ্যান্ডেল করা
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsAuthDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    setIsAuthDropdownOpen(!isAuthDropdownOpen);
  };

  const handleLogout = async () => {
    await logout();
    closeAllOverlays();
  };

  return (
    <>
      <header className="bg-white border-b border-[#eaeaea] py-1.5 sticky top-[55px] z-50 transition-[top] duration-300 ease-in-out md:top-[48px]">
        
        <div className="max-w-[1400px] mx-auto px-6 flex lg:grid lg:grid-cols-3 items-center justify-between relative">
          
          {/* Logo & Mobile Menu Button */}
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

          {/* Mobile Logo Center */}
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
          
          {/* Desktop Nav */}
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

          {/* Right Icons */}
          <div className="flex flex-1 lg:flex-none items-center justify-end gap-2 justify-self-end">
            <button 
                className="hidden lg:flex items-center gap-2 bg-transparent border-b border-[#d8d8d8] cursor-pointer px-2 pb-0.5 text-[#333] hover:border-black transition-colors" 
                onClick={() => setIsSearchOpen(true)} 
                aria-label="search bar"
            >
              <IoSearch size={22} />
              <span className="text-sm font-medium">Search</span>
            </button>
            
            {/* ★★★ DYNAMIC AUTH DROPDOWN (Desktop) ★★★ */}
            <div className="relative" ref={dropdownRef}>
                <button 
                    onClick={toggleDropdown}
                    className="hidden lg:flex bg-transparent border-none cursor-pointer p-2 text-[#333] items-center gap-2 hover:text-black transition-colors font-medium text-sm whitespace-nowrap"
                    aria-label="Account"
                >
                  <IoPersonOutline size={24} />
                  {/* লগইন থাকলে 'My Account' দেখাবে, না থাকলে শুধু আইকন */}
                  {user && <span>My Account</span>}
                </button>

                {isAuthDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-60 bg-white border border-[#e0e0e0] rounded-lg shadow-lg z-50 overflow-hidden animate-fadeIn">
                        
                        {/* CASE 1: NOT LOGGED IN */}
                        {!user && (
                            <>
                                <Link 
                                    href="/login" 
                                    className="flex items-center gap-3 px-4 py-3 text-sm text-[#333] hover:bg-[#f8f9fa] border-b border-[#f0f0f0]"
                                    onClick={closeAllOverlays}
                                >
                                    <IoPersonCircleOutline size={20} />
                                    <div className="flex flex-col">
                                        <span className="font-semibold">Login / Register</span>
                                        <span className="text-xs text-gray-500">Access your orders</span>
                                    </div>
                                </Link>
                                <Link 
                                    href="/affiliate-portal" 
                                    className="flex items-center gap-3 px-4 py-3 text-sm text-[#333] hover:bg-[#f8f9fa]"
                                    onClick={closeAllOverlays}
                                >
                                    <IoTrendingUpOutline size={20} />
                                    <div className="flex flex-col">
                                        <span className="font-semibold">Affiliate Portal</span>
                                        <span className="text-xs text-gray-500">Earn commissions</span>
                                    </div>
                                </Link>
                            </>
                        )}

                        {/* CASE 2: LOGGED IN */}
                        {user && (
                            <>
                                <div className="px-4 py-3 bg-gray-50 border-b border-[#f0f0f0]">
                                    <p className="text-xs text-gray-500">Signed in as</p>
                                    <p className="text-sm font-bold text-[#333] truncate">{user.firstName || user.email}</p>
                                </div>
                                
                                <Link 
                                    href="/account" 
                                    className="flex items-center gap-3 px-4 py-3 text-sm text-[#333] hover:bg-[#f8f9fa] border-b border-[#f0f0f0]"
                                    onClick={closeAllOverlays}
                                >
                                    <IoPersonOutline size={18} />
                                    My Account
                                </Link>

                                {/* ★★★ শুধু অ্যাফিলিয়েট হলে এই অপশন আসবে ★★★ */}
                                {isAffiliate && (
                                    <Link 
                                        href="/affiliate/dashboard" 
                                        className="flex items-center gap-3 px-4 py-3 text-sm text-[#333] hover:bg-[#f0f8ff] border-b border-[#f0f0f0]"
                                        onClick={closeAllOverlays}
                                    >
                                        <IoSpeedometerOutline size={18} className="text-blue-600"/>
                                        <span className="font-semibold text-blue-600">Affiliate Dashboard</span>
                                    </Link>
                                )}

                                <button 
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 text-left transition-colors"
                                >
                                    <IoLogOutOutline size={18} />
                                    Logout
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
            
            {/* Cart Icon */}
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

      {/* MOBILE MENU */}
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
            {/* ★★★ Mobile Auth Links (Dynamic) ★★★ */}
            {user ? (
                <>
                 <Link 
                    href="/account"
                    className="text-[1.2rem] font-medium text-[#333] no-underline flex items-center gap-3 bg-transparent border-b border-[#ececec] w-full text-left cursor-pointer p-0 hover:text-black hover:font-bold mb-4"
                    onClick={closeAllOverlays}
                 >
                    <IoPersonOutline />
                    <span>My Account</span>
                 </Link>
                 
                 {isAffiliate && (
                    <Link 
                        href="/affiliate/dashboard"
                        className="text-[1.2rem] font-medium text-blue-600 no-underline flex items-center gap-3 bg-transparent border-b border-[#ececec] w-full text-left cursor-pointer p-0 hover:text-blue-800 hover:font-bold mb-4"
                        onClick={closeAllOverlays}
                    >
                        <IoSpeedometerOutline />
                        <span>Affiliate Dashboard</span>
                    </Link>
                 )}

                 <button 
                    onClick={handleLogout}
                    className="text-[1.2rem] font-medium text-red-600 flex items-center gap-3 w-full text-left p-0 mt-2"
                 >
                    <IoLogOutOutline />
                    <span>Logout</span>
                 </button>
                </>
            ) : (
                <div className="flex flex-col gap-4">
                    <Link 
                        href="/login"
                        className="text-[1.2rem] font-medium text-[#333] no-underline flex items-center gap-3 bg-transparent border-b border-[#ececec] w-full text-left cursor-pointer p-0 hover:text-black hover:font-bold"
                        onClick={closeAllOverlays}
                    >
                        <IoPersonCircleOutline />
                        <span>Login / Register</span>
                    </Link>
                     <Link 
                        href="/affiliate-portal"
                        className="text-[1.2rem] font-medium text-[#333] no-underline flex items-center gap-3 bg-transparent border-b border-[#ececec] w-full text-left cursor-pointer p-0 hover:text-black hover:font-bold"
                        onClick={closeAllOverlays}
                    >
                        <IoTrendingUpOutline />
                        <span>Affiliate Portal</span>
                    </Link>
                </div>
            )}
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