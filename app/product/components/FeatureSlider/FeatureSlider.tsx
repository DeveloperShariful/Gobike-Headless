// ফাইল পাথ: app/product/components/FeatureSlider/FeatureSlider.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './FeatureSlider.module.css';
import { useWindowSize } from './useWindowSize'; // <-- নতুন hook import করা হয়েছে

interface Feature {
  imageSrc: string;
  imageAlt: string;
  title: string;
  description: string;
}

interface FeatureSliderProps {
  title: string;
  features: Feature[];
}

export default function FeatureSlider({ title, features }: FeatureSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { width } = useWindowSize(); // <-- স্ক্রিনের প্রস্থ জানা হচ্ছে

  // === মূল পরিবর্তন: স্ক্রিন সাইজ অনুযায়ী কতগুলো আইটেম দেখাবে তা নির্ধারণ করা ===
  const [itemsPerPage, setItemsPerPage] = useState(3);

  useEffect(() => {
    if (width < 768) {
      setItemsPerPage(1); // মোবাইল
    } else if (width < 1024) {
      setItemsPerPage(2); // ট্যাবলেট
    } else {
      setItemsPerPage(3); // ডেস্কটপ
    }
  }, [width]);
  // =======================================================================

  const canSlide = features.length > itemsPerPage;

  const goToPrevious = () => {
    if (!canSlide) return;
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? features.length - itemsPerPage : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = () => {
    if (!canSlide) return;
    const isLastSlide = currentIndex >= features.length - itemsPerPage;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  return (
    <div className={styles.sliderComponent}>
      <div className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        {canSlide && (
          <div className={styles.navArrows}>
            <button onClick={goToPrevious} className={styles.arrow}>&#10094;</button>
            <button onClick={goToNext} className={styles.arrow}>&#10095;</button>
          </div>
        )}
      </div>

      <div className={styles.sliderContainer}>
        <div 
          className={styles.sliderTrack}
          // === মূল পরিবর্তন: স্লাইড করার দূরত্ব এখন ডাইনামিক ===
          style={{ 
            width: `${(100 / itemsPerPage) * features.length}%`,
            transform: `translateX(-${(100 / features.length) * currentIndex}%)` 
          }}
        >
          {features.map((feature, index) => (
            <div key={index} className={styles.slide}>
              <div className={styles.card}>
                <div className={styles.imageWrapper}>
                  <Image src={feature.imageSrc} alt={feature.imageAlt} fill style={{ objectFit: 'cover' }} sizes="33vw"/>
                </div>
                <div className={styles.contentWrapper}>
                  <h3 className={styles.featureTitle}>{feature.title}</h3>
                  <p className={styles.description}>{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {canSlide && (
        <div className={styles.progressBarContainer}>
            <div 
                className={styles.progressFill}
                style={{ width: `${(100 / (features.length - itemsPerPage + 1)) * (currentIndex + 1)}%` }}
            ></div>
        </div>
      )}
    </div>
  );
}