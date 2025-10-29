// ফাইল পাথ: app/product/components/ImageSlider/ImageSlider.tsx
'use client';

import { useState, useEffect, useCallback } from 'react'; // <-- useCallback এখানে import করা হয়েছে
import Image from 'next/image';
import styles from './ImageSlider.module.css';

interface ImageSliderProps {
  images: {
    src: string;
    alt: string;
  }[];
  title?: string;
}

export default function ImageSlider({ images, title }: ImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // === মূল পরিবর্তন: ফাংশনগুলোকে useCallback দিয়ে মুড়ে দেওয়া হয়েছে ===
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

  }, [currentIndex, images.length, goToNext]); // <-- goToNext কে dependency হিসেবে যোগ করা হয়েছে

  if (!images || images.length === 0) {
    return <div>No images to display.</div>;
  }

  return (
    <div className={styles.sliderComponent}>
      {title && (
          <div className={styles.header}>
            <h2 className={styles.title}>{title}</h2>
            {images.length > 1 && (
                <div className={styles.navArrows}>
                    <button onClick={goToPrevious} className={styles.arrow}>&#10094;</button>
                    <button onClick={goToNext} className={styles.arrow}>&#10095;</button>
                </div>
            )}
          </div>
      )}

      <div className={styles.sliderContainer}>
        <div 
          className={styles.sliderTrack} 
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {images.map((image, index) => (
            <div className={styles.slide} key={index}>
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
                <button onClick={goToPrevious} className={`${styles.navButton} ${styles.prevButton}`}>
                    &#10094;
                </button>
                <button onClick={goToNext} className={`${styles.navButton} ${styles.nextButton}`}>
                    &#10095;
                </button>
            </>
        )}
      </div>

      {images.length > 1 && (
          <div className={styles.progressBarContainer}>
            <div 
                className={styles.progressFill}
                style={{ width: `${((currentIndex + 1) / images.length) * 100}%` }}
            ></div>
          </div>
      )}
    </div>
  );
}