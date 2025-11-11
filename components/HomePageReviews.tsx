// components/HomePageReviews.tsx

'use client';

// --- পরিবর্তন ১: useRef ইম্পোর্ট করা হয়েছে ---
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaStar } from 'react-icons/fa';
import styles from './HomePageReviews.module.css';

// --- টাইপ ইন্টারফেস (অপরিবর্তিত) ---
interface ReviewSummary {
  review_count: number;
  average_rating: number;
  rating_counts: { rating: number; count: number; }[];
}
interface Review {
  id: number;
  reviewer: string;
  review: string;
  rating: number;
  date: string;
  product_name: string;
  product_permalink: string;
  product_image?: string;
}
interface ReviewsData {
  summary: ReviewSummary;
  reviews: Review[];
}

// --- স্টার রেটিং কম্পোনেন্ট (অপরিবর্তিত) ---
const StarRating = ({ rating, size = 1 }: { rating: number, size?: number }) => {
    const totalStars = 5;
    const fullStars = Math.floor(rating);
    const emptyStars = totalStars - fullStars;
    return (
        <div className={styles.starRating} style={{ fontSize: `${size}rem` }}>
            {[...Array(fullStars)].map((_, i) => <FaStar key={`full-${i}`} />)}
            {[...Array(emptyStars)].map((_, i) => <FaStar key={`empty-${i}`} style={{ color: '#e4e5e9' }} />)}
        </div>
    );
};


// --- মূল রিভিউ সেকশন কম্পוננט ---
export default function HomePageReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleReviews, setVisibleReviews] = useState(3);
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  
  // --- পরিবর্তন ২: স্লাইডার কন্টেইনারের জন্য ref তৈরি করা হয়েছে ---
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchReviewsData() {
      try {
        const response = await fetch('https://gobikes.au/wp-json/gobike/v1/reviews-summary');
        if (!response.ok) throw new Error('Failed to fetch reviews data');
        
        const result: ReviewsData = await response.json();

        if (result && Array.isArray(result.reviews) && result.summary) {
            setReviews(result.reviews);
            setSummary(result.summary);
        }
      } catch (error) {
        console.error("Error fetching reviews data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchReviewsData();
  }, []);

  // --- পরিবর্তন ৩: স্ক্রল করার জন্য ফাংশন যোগ করা হয়েছে ---
  const scroll = (direction: 'left' | 'right') => {
      if (sliderRef.current) {
          const { current } = sliderRef;
          // প্রতিটি কার্ডের প্রস্থ এবং গ্যাপ অনুযায়ী স্ক্রল করা হবে
          const scrollAmount = direction === 'left' 
              ? -(current.offsetWidth * 0.9) // একবারে একটি কার্ডের সমান বামে যাবে
              : (current.offsetWidth * 0.9); // একবারে একটি কার্ডের সমান ডানে যাবে
          
          current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
  };


  if (loading) {
    return <section className={styles.reviewsSection}><div className={styles.container}><p>Loading Reviews...</p></div></section>;
  }

  if (reviews.length === 0) {
    return null;
  }
  
  const ratingPercentages = summary?.rating_counts.map(item =>
    summary.review_count > 0 ? (item.count / summary.review_count) * 100 : 0
  );

  return (
    <section className={styles.reviewsSection}>
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>What our customers are saying about Gobike</h2>
        </div>

        {summary && summary.review_count > 0 && (
          <div className={styles.summaryBox}>
              <div className={styles.summaryAverage}>
                  <div className={styles.averageRatingValue}>{summary.average_rating.toFixed(1)}</div>
                  <StarRating rating={summary.average_rating} size={1.2} />
                  <div className={styles.basedOnReviews}>Based on {summary.review_count} reviews</div>
              </div>
              <div className={styles.summaryBreakdown}>
                  {ratingPercentages?.map((percent, index) => (
                      <div className={styles.ratingBarRow} key={5 - index}>
                          <span>{5 - index} star</span>
                          <div className={styles.ratingBar}><div style={{ width: `${percent}%` }}></div></div>
                          <span>{Math.round(percent)}%</span>
                      </div>
                  ))}
              </div>
              <div className={styles.addReviewWrapper}>
                  <span className={styles.addReviewButton}>Add a review</span>
              </div>
          </div>
        )}

        {/* --- পরিবর্তন ৪: স্লাইডার কন্টেইনার এবং নেভিগেশন বাটন যোগ করা হয়েছে --- */}
        <div className={styles.reviewsSliderContainer}>
            <div className={styles.reviewsGrid} ref={sliderRef}>
            {reviews.slice(0, visibleReviews).map((review) => {
                const productSlug = review.product_permalink.split('/').filter(Boolean).pop() || '';
                return (
                    <div key={review.id} className={styles.reviewCard}>
                        <div className={styles.reviewCardHeader}>
                            <div className={styles.authorAvatar}>{review.reviewer.substring(0, 1)}</div>
                            <div className={styles.authorDetails}>
                                <strong>{review.reviewer}</strong>
                                <span className={styles.verifiedBadge}>✓ Verified</span>
                            </div>
                        </div>

                        <StarRating rating={review.rating} />
                        
                        <div 
                            className={styles.reviewContent}
                            dangerouslySetInnerHTML={{ __html: review.review }}
                        />

                        <div className={styles.reviewProductInfo}>
                            {review.product_image && (
                                <Link href={`/product/${productSlug}`}>
                                    <Image src={review.product_image} alt={review.product_name} width={40} height={40} />
                                </Link>
                            )}
                            <span>on <Link href={`/product/${productSlug}`}>{review.product_name}</Link></span>
                        </div>
                    </div>
                );
            })}
            </div>

            {/* স্লাইডার নেভিগেশন বাটন */}
            <button onClick={() => scroll('left')} className={`${styles.reviewsNav} ${styles.prev}`} aria-label="Previous review">&#10094;</button>
            <button onClick={() => scroll('right')} className={`${styles.reviewsNav} ${styles.next}`} aria-label="Next review">&#10095;</button>
        </div>
        
        {reviews.length > visibleReviews && (
            <div className={styles.showMoreContainer}>
                <button onClick={() => setVisibleReviews(reviews.length)} className={styles.showMoreButton}>
                    Show more reviews ({reviews.length - visibleReviews} more)
                </button>
            </div>
        )}

      </div>
    </section>
  );
}