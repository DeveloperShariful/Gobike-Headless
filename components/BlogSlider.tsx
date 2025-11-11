"use client";

import React, { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PostData } from '../lib/posts';
import styles from './BlogSection.module.css';

type BlogSliderProps = {
  posts: PostData[];
};

export default function BlogSlider({ posts }: BlogSliderProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollerRef.current) {
      const scrollAmount = scrollerRef.current.firstElementChild!.clientWidth + 30;

      scrollerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className={styles.scrollerWrapper}>
      <button 
        className={`${styles.scrollerArrow} ${styles.arrowLeft}`} 
        onClick={() => scroll('left')}
        aria-label="Previous Posts"
      >
        &#10094;
      </button>

      <div className={styles.cardScroller} ref={scrollerRef}>
        {posts.map(({ slug, frontmatter }) => (
          <Link key={slug} href={`/blog/${slug}`} className={styles.seoBlogCard}>
            <div className={styles.seoBlogImageWrapper}>
              <Image
                loading="lazy"
                src={frontmatter.cover_image}
                alt={frontmatter.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                style={{ objectFit: 'cover' }}
              />
              
              {/* 👇 ★★★ এই লাইনটি পরিবর্তন করা হয়েছে ★★★ 👇 */}
              {typeof frontmatter.badge === 'string' && frontmatter.badge && (
                <span className={styles.seoBlogBadge}>{frontmatter.badge}</span>
              )}

            </div>
            <div className={styles.seoBlogContent}>
              <h3 className={styles.seoBlogTitle}>{frontmatter.title}</h3>
              <p className={styles.seoBlogExcerpt}>{frontmatter.excerpt}</p>
              <span className={styles.seoBlogReadMore}>Read The Full Story »</span>
            </div>
          </Link>
        ))}
      </div>

      <button 
        className={`${styles.scrollerArrow} ${styles.arrowRight}`} 
        onClick={() => scroll('right')}
        aria-label="Next Posts"
      >
        &#10095;
      </button>
    </div>
  );
}