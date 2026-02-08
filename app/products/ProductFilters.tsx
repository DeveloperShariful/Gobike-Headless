// app/products/ProductFilters.tsx

'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { IoChevronDown } from 'react-icons/io5';

interface Category {
  id: string;
  name: string;
  slug: string;
}
interface ProductFiltersProps {
  categories: Category[];
}

export default function ProductFilters({ categories }: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const activeCategorySlug = searchParams.get('category') || 'all';
  const activeCategory = categories.find(c => c.slug === activeCategorySlug) || { name: 'All Products' };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const handleCategoryChange = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (slug === 'all') {
      params.delete('category');
    } else {
      params.set('category', slug);
    }
    params.delete('after');
    params.delete('before');
    router.push(`${pathname}?${params.toString()}`);
    setIsOpen(false); 
  };

  return (
    // .filterBar replaced
    <div className="flex justify-center mb-12">
        {/* .dropdownWrapper replaced */}
        <div className="relative w-[280px]" ref={wrapperRef}>
            <button 
                // .dropdownButton replaced
                className="w-full flex justify-between items-center px-5 py-3 bg-white border border-gray-300 rounded-lg text-base font-medium cursor-pointer text-left hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span>{activeCategory.name}</span>
                <IoChevronDown 
                    style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} 
                />
            </button>
            
            {isOpen && (
                // .dropdownMenu replaced
                <ul className="absolute top-[calc(100%+5px)] left-0 w-full bg-white border border-gray-200 rounded-lg shadow-lg list-none p-2 m-0 z-10 max-h-[300px] overflow-y-auto">
                    <li 
                        className="px-4 py-3 cursor-pointer rounded-md hover:bg-gray-100 transition-colors"
                        onClick={() => handleCategoryChange('all')}
                    >
                        All Products
                    </li>
                    {categories.map((category) => (
                        <li 
                            key={category.id} 
                            className={`px-4 py-3 cursor-pointer rounded-md hover:bg-gray-100 transition-colors ${activeCategorySlug === category.slug ? 'bg-gray-50 font-semibold' : ''}`}
                            onClick={() => handleCategoryChange(category.slug)}
                        >
                            {category.name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    </div>
  );
}