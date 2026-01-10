// ফাইল পাথ: app/product/components/ImageSlider/ImageSlider.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
// import styles from './ImageSlider.module.css'; // CSS Module সরানো হয়েছে

interface ImageSliderProps {
  images: {
    src: string;
    alt: string;
  }[];
  title?: string;
}

export default function ImageSlider({ images, title }: ImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // === মূল পরিবর্তন: ফাংশনগুলোকে useCallback দিয়ে মুড়ে দেওয়া হয়েছে ===
  const goToNext = useCallback(() => {
    setCurrentIndex(prevIndex => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  }, [images.length]);

  const goToPrevious = () => {
    setCurrentIndex(prevIndex => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };
  // ==========================================================

  // Auto-slide functionality
  useEffect(() => {
    if (images.length <= 1) return;

    const timer = setTimeout(goToNext, 5000);
    return () => clearTimeout(timer);

  }, [currentIndex, images.length, goToNext]);

  if (!images || images.length === 0) {
    return <div>No images to display.</div>;
  }

  return (
    // .sliderComponent replaced
    <div className="w-full">
      {title && (
          // .header replaced
          <div className="flex justify-between items-center mb-4">
            {/* .title replaced */}
            <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
            {images.length > 1 && (
                // .navArrows replaced
                <div className="flex gap-2">
                    <button 
                        onClick={goToPrevious} 
                        // .arrow replaced
                        className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-lg text-slate-600 cursor-pointer transition-all duration-200 ease-in-out hover:bg-slate-200 hover:text-slate-900"
                    >
                        &#10094;
                    </button>
                    <button 
                        onClick={goToNext} 
                        className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-lg text-slate-600 cursor-pointer transition-all duration-200 ease-in-out hover:bg-slate-200 hover:text-slate-900"
                    >
                        &#10095;
                    </button>
                </div>
            )}
          </div>
      )}

      {/* .sliderContainer replaced */}
      <div className="relative w-full aspect-[4/3] overflow-hidden rounded-xl">
        <div 
          // .sliderTrack replaced
          className="flex h-full transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {images.map((image, index) => (
            // .slide replaced
            <div className="flex-none w-full h-full relative" key={index}>
              <Image 
                src={image.src} 
                alt={image.alt} 
                fill 
                style={{ objectFit: 'cover' }}
                sizes="(max-width: 768px) 100vw, 50vw"
                priority={index === 0}
              />
            </div>
          ))}
        </div>

        {!title && images.length > 1 && (
            <>
                {/* .navButton & .prevButton replaced */}
                <button 
                    onClick={goToPrevious} 
                    className="absolute top-1/2 -translate-y-1/2 left-4 w-10 h-10 rounded-full bg-white/80 backdrop-blur-[4px] border border-black/5 text-[#333] flex items-center justify-center text-xl z-10 cursor-pointer transition-colors duration-200 ease-in-out hover:bg-white"
                >
                    &#10094;
                </button>
                {/* .navButton & .nextButton replaced */}
                <button 
                    onClick={goToNext} 
                    className="absolute top-1/2 -translate-y-1/2 right-4 w-10 h-10 rounded-full bg-white/80 backdrop-blur-[4px] border border-black/5 text-[#333] flex items-center justify-center text-xl z-10 cursor-pointer transition-colors duration-200 ease-in-out hover:bg-white"
                >
                    &#10095;
                </button>
            </>
        )}
      </div>

      {images.length > 1 && (
          // .progressBarContainer replaced
          <div className="w-full h-1 bg-slate-200 rounded-sm mt-6">
            <div 
                // .progressFill replaced
                className="h-full bg-blue-500 rounded-sm transition-[width] duration-300 ease-in-out"
                style={{ width: `${((currentIndex + 1) / images.length) * 100}%` }}
            ></div>
          </div>
      )}
    </div>
  );
}