// components/HomePageReviews.tsx

'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaStar } from 'react-icons/fa';

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

// --- স্টার রেটিং কম্পোনেন্ট ---
const StarRating = ({ rating, size = 1, alignLeft = false }: { rating: number, size?: number, alignLeft?: boolean }) => {
    const totalStars = 5;
    const fullStars = Math.floor(rating);
    const emptyStars = totalStars - fullStars;
    return (
        // .starRating replaced
        <div 
            className={`flex gap-1 text-black mt-[0.1rem] ${alignLeft ? 'justify-start' : 'justify-center'}`} 
            style={{ fontSize: `${size}rem` }}
        >
            {[...Array(fullStars)].map((_, i) => <FaStar key={`full-${i}`} />)}
            {[...Array(emptyStars)].map((_, i) => <FaStar key={`empty-${i}`} className="text-[#e4e5e9]" />)}
        </div>
    );
};

// --- মূল রিভিউ সেকশন কম্পোনেন্ট ---
export default function HomePageReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleReviews, setVisibleReviews] = useState(3);
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  
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

  const scroll = (direction: 'left' | 'right') => {
      if (sliderRef.current) {
          const { current } = sliderRef;
          const scrollAmount = direction === 'left' 
              ? -(current.offsetWidth * 0.9) 
              : (current.offsetWidth * 0.9);
          
          current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
  };

  if (loading) {
    return (
        <section className="pb-12 bg-white">
            <div className="max-w-[1500px] mx-auto px-4">
                <p>Loading Reviews...</p>
            </div>
        </section>
    );
  }

  if (reviews.length === 0) {
    return null;
  }
  
  const ratingPercentages = summary?.rating_counts.map(item =>
    summary.review_count > 0 ? (item.count / summary.review_count) * 100 : 0
  );

  return (
    // .reviewsSection replaced
    <section className="pb-12 bg-white font-sans">
      {/* .container replaced */}
      <div className="max-w-[1500px] mx-auto px-4">
        
        {/* .sectionHeader replaced */}
        <div className="text-center mb-12 mt-4">
          {/* .sectionTitle replaced */}
          <h2 className="text-[1.7rem] md:text-[2rem] font-extrabold mb-2 tracking-tight text-[#1a1a1a]">
            What our customers are saying about Gobike
          </h2>
        </div>

        {summary && summary.review_count > 0 && (
          // .summaryBox replaced
          <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr_auto] gap-y-8 gap-x-12 items-center p-6 lg:p-10 bg-[#f8f9fa] rounded-[20px] mb-16 border border-[#e7e7e7]">
              
              {/* .summaryAverage replaced */}
              <div className="text-center pr-0 lg:pr-12 border-b lg:border-b-0 lg:border-r border-[#e0e0e0] pb-8 lg:pb-0">
                  {/* .averageRatingValue replaced */}
                  <div className="text-[4rem] font-extrabold leading-none text-black">{summary.average_rating.toFixed(1)}</div>
                  <StarRating rating={summary.average_rating} size={1.2} />
                  {/* .basedOnReviews replaced */}
                  <div className="text-[0.9rem] text-[#555] mt-4">Based on {summary.review_count} reviews</div>
              </div>
              
              {/* .summaryBreakdown replaced */}
              <div className="flex flex-col gap-3 w-full">
                  {ratingPercentages?.map((percent, index) => (
                      // .ratingBarRow replaced
                      <div className="flex items-center gap-4 text-[0.9rem] text-[#555]" key={5 - index}>
                          <span className="w-[50px]">{5 - index} star</span>
                          {/* .ratingBar replaced */}
                          <div className="flex-grow h-2 bg-[#e9ecef] rounded overflow-hidden">
                              <div className="h-full bg-[#f5b327]" style={{ width: `${percent}%` }}></div>
                          </div>
                          <span>{Math.round(percent)}%</span>
                      </div>
                  ))}
              </div>
              
              {/* .addReviewWrapper replaced */}
              <div className="text-center pl-0 lg:pl-12 border-t lg:border-t-0 lg:border-l border-[#e0e0e0] pt-8 lg:pt-0">
                  {/* .addReviewButton replaced */}
                  <span className="inline-block bg-[#1a1a1a] text-white border-none py-[0.9rem] px-8 rounded-lg cursor-pointer font-semibold transition-colors duration-200 hover:bg-[#333]">
                    Add a review
                  </span>
              </div>
          </div>
        )}

        {/* .reviewsSliderContainer replaced */}
        <div className="relative">
            {/* .reviewsGrid replaced */}
            {/* Desktop: Grid layout | Mobile: Horizontal Scroll Snap layout */}
            <div 
                className="
                    grid grid-cols-1 md:grid-cols-[repeat(auto-fill,minmax(350px,1fr))] gap-8 
                    md:overflow-visible
                    max-md:flex max-md:overflow-x-auto max-md:snap-x max-md:snap-mandatory max-md:scrollbar-none max-md:gap-4 max-md:-mx-4 max-md:px-4 max-md:pb-4
                " 
                ref={sliderRef}
            >
            {reviews.slice(0, visibleReviews).map((review) => {
                const productSlug = review.product_permalink.split('/').filter(Boolean).pop() || '';
                return (
                    // .reviewCard replaced
                    <div 
                        key={review.id} 
                        className="
                            bg-[#f8f9fa] rounded-2xl p-6 border border-[#e7e7e7] flex flex-col shadow-[0_4px_12px_rgba(0,0,0,0.03)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.07)]
                            max-md:flex-none max-md:w-[90%] max-md:snap-start
                        "
                    >
                        {/* .reviewCardHeader replaced */}
                        <div className="flex items-center mb-4 gap-3">
                            {/* .authorAvatar replaced */}
                            <div className="w-10 h-10 rounded-full bg-[#e9ecef] text-[#333] flex items-center justify-center font-bold text-[1.1rem] flex-shrink-0">
                                {review.reviewer.substring(0, 1)}
                            </div>
                            {/* .authorDetails replaced */}
                            <div className="flex flex-col items-start">
                                <strong className="font-semibold text-base">{review.reviewer}</strong>
                                {/* .verifiedBadge replaced */}
                                <span className="text-[0.8rem] text-[#17a2b8] font-medium">✓ Verified</span>
                            </div>
                        </div>

                        <StarRating rating={review.rating} alignLeft={true} />
                        
                        {/* .reviewContent replaced */}
                        <div 
                            className="text-[#333] leading-[1.6] text-[0.95rem] mb-4 flex-grow [&>p:last-child]:mb-0"
                            dangerouslySetInnerHTML={{ __html: review.review }}
                        />

                        {/* .reviewProductInfo replaced */}
                        <div className="flex items-center gap-3 text-[0.9rem] text-[#555] mt-auto pt-4 border-t border-[#e9ecef]">
                            {review.product_image && (
                                <Link href={`/product/${productSlug}`}>
                                    <Image src={review.product_image} alt={review.product_name} width={40} height={40} className="rounded-md" />
                                </Link>
                            )}
                            <span>on <Link href={`/product/${productSlug}`} className="text-[#1a1a1a] font-semibold hover:underline">{review.product_name}</Link></span>
                        </div>
                    </div>
                );
            })}
            </div>

            {/* .reviewsNav replaced */}
            {/* Mobile Navigation Buttons (Hidden on Desktop) */}
            <button 
                onClick={() => scroll('left')} 
                className="md:hidden absolute top-1/2 -translate-y-1/2 left-0 bg-black/50 text-white border-none rounded-full w-10 h-10 text-lg cursor-pointer z-10 transition-colors duration-300 flex items-center justify-center hover:bg-black/80"
                aria-label="Previous review"
            >
                &#10094;
            </button>
            <button 
                onClick={() => scroll('right')} 
                className="md:hidden absolute top-1/2 -translate-y-1/2 right-0 bg-black/50 text-white border-none rounded-full w-10 h-10 text-lg cursor-pointer z-10 transition-colors duration-300 flex items-center justify-center hover:bg-black/80"
                aria-label="Next review"
            >
                &#10095;
            </button>
        </div>
        
        {reviews.length > visibleReviews && (
            // .showMoreContainer replaced
            <div className="text-center mt-12">
                {/* .showMoreButton replaced */}
                <button 
                    onClick={() => setVisibleReviews(reviews.length)} 
                    className="bg-transparent border border-[#ccc] py-[0.8rem] px-10 rounded-lg cursor-pointer font-semibold text-base text-[#1a1a1a] transition-all duration-200 hover:bg-[#f0f0f0] hover:border-[#aaa]"
                >
                    Show more reviews ({reviews.length - visibleReviews} more)
                </button>
            </div>
        )}

      </div>
    </section>
  );
}