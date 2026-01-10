// app/product/[slug]/ReviewForm.tsx

'use client';

import { useState, FormEvent, useEffect } from 'react';
import toast from 'react-hot-toast';
// import styles from './ReviewForm.module.css'; // CSS Module সরানো হয়েছে
import { FaStar } from 'react-icons/fa';
import Image from 'next/image';

// --- Interfaces ---
interface ReviewEdge {
  node: {
    id: string;
    author: { node: { name: string; avatar?: { url: string } }; };
    content: string;
    date: string;
  };
  rating: number;
}

interface ReviewFormProps {
  productId: number;
  averageRating: number | null | undefined;
  reviewCount: number | null | undefined;
  reviews: ReviewEdge[];
}

// --- Helper Components (Converted to Tailwind) ---
const StarRatingDisplay = ({ rating }: { rating: number }) => {
  const [starRating, setStarRating] = useState({ full: 0, empty: 5 });
  useEffect(() => {
    const totalStars = 5;
    const fullStars = Math.round(rating || 0);
    const emptyStars = totalStars - fullStars;
    setStarRating({ full: fullStars, empty: emptyStars });
  }, [rating]);

  return (
    // .starDisplay replaced
    <div className="flex gap-1 text-[1.5rem] my-2 text-amber-500">
      {[...Array(starRating.full)].map((_, i) => <FaStar key={`full-${i}`} color="#ffc107" />)}
      {[...Array(starRating.empty)].map((_, i) => <FaStar key={`empty-${i}`} color="#e4e5e9" />)}
    </div>
  );
};

const FormattedDate = ({ dateString }: { dateString: string }) => {
  const [formattedDate, setFormattedDate] = useState<string | null>(null);
  useEffect(() => { setFormattedDate(new Date(dateString).toLocaleDateString()); }, [dateString]);
  if (!formattedDate) return <span className="text-[0.85rem] text-gray-400 mt-0.5"></span>;
  // .reviewDate replaced
  return <span className="text-[0.85rem] text-gray-400 mt-0.5">{formattedDate}</span>;
};

export default function ReviewForm({ productId, averageRating, reviewCount, reviews }: ReviewFormProps) {
  // --- Form States ---
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [author, setAuthor] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- List States ---
  const INITIAL_REVIEWS_TO_SHOW = 5;
  const [visibleReviews, setVisibleReviews] = useState(INITIAL_REVIEWS_TO_SHOW);

  // --- Derived Data ---
  const customerImages = reviews.map((edge) => edge.node.author.node.avatar?.url).filter(Boolean) || [];
  const hasMoreReviews = reviews.length > visibleReviews;
  const currentRating = typeof averageRating === 'number' ? averageRating : 0;
  const currentReviewCount = typeof reviewCount === 'number' ? reviewCount : 0;

  // --- Handlers ---
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (rating === 0) { toast.error("Please select a star rating."); return; }
    setIsSubmitting(true);
    toast.loading('Submitting your review...');
    
    const formData = new FormData();
    formData.append('author', author);
    formData.append('email', email);
    formData.append('comment', comment);
    formData.append('rating', String(rating));
    formData.append('comment_post_ID', String(productId));
    formData.append('submit', 'Post Comment');
    
    try {
      const response = await fetch('/api/submit-review', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      toast.dismiss();

      if (result.success) {
        toast.success('Review submitted! It will appear after approval.');
        setAuthor(''); setEmail(''); setComment(''); setRating(0); setShowForm(false);
      } else {
        throw new Error(result.message || 'Failed to submit review.');
      }
    } catch (error: unknown) {
        toast.dismiss();
        let errorMessage = 'An error occurred.';
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    // .reviewWidgetContainer & .reviewWidget replaced
    <div className="w-full box-border">
        
        {/* --- Review Summary & Form Toggle --- */}
        {/* .reviewsSummary replaced */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-8 p-6 md:p-10 bg-[#f9fafb] border border-[#e5e7eb] rounded-xl mb-12 items-center">
            {/* .summaryAverage replaced */}
            <div className="flex flex-col items-center justify-center text-center md:border-r md:border-[#e5e7eb] md:pr-8">
                {/* .averageRatingValue replaced */}
                <div className="text-[3rem] font-extrabold text-gray-900 leading-none">{currentRating.toFixed(1)}</div>
                <StarRatingDisplay rating={currentRating} />
                {/* .basedOnReviews replaced */}
                <div className="text-sm text-gray-500 mb-5">Based on {currentReviewCount} reviews</div>
                {/* .addReviewButton replaced */}
                <button 
                    className="w-full sm:w-auto py-3 px-6 bg-white border border-[#d1d5db] rounded-md font-semibold text-gray-700 cursor-pointer transition-all duration-200 text-sm hover:bg-[#f3f4f6] hover:border-[#9ca3af]" 
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? 'Cancel Review' : 'Add a review'}
                </button>
            </div>
            
            {/* .summaryBreakdown replaced */}
            <div className="w-full flex flex-col gap-3">
                {/* .ratingBarRow replaced */}
                <div className="flex items-center gap-3 text-[0.85rem] text-gray-600">
                    <span className="min-w-[45px] font-medium">5 star</span>
                    {/* .ratingBar replaced */}
                    <div className="flex-grow h-2 bg-[#e5e7eb] rounded overflow-hidden">
                        <div className="h-full bg-amber-500 w-full"></div>
                    </div>
                    <span className="min-w-[35px] text-right">100%</span>
                </div>
                <div className="flex items-center gap-3 text-[0.85rem] text-gray-600">
                    <span className="min-w-[45px] font-medium">4 star</span>
                    <div className="flex-grow h-2 bg-[#e5e7eb] rounded overflow-hidden">
                        <div className="h-full bg-amber-500 w-0"></div>
                    </div>
                    <span className="min-w-[35px] text-right">0%</span>
                </div>
                <div className="flex items-center gap-3 text-[0.85rem] text-gray-600">
                    <span className="min-w-[45px] font-medium">3 star</span>
                    <div className="flex-grow h-2 bg-[#e5e7eb] rounded overflow-hidden">
                        <div className="h-full bg-amber-500 w-0"></div>
                    </div>
                    <span className="min-w-[35px] text-right">0%</span>
                </div>
                <div className="flex items-center gap-3 text-[0.85rem] text-gray-600">
                    <span className="min-w-[45px] font-medium">2 star</span>
                    <div className="flex-grow h-2 bg-[#e5e7eb] rounded overflow-hidden">
                        <div className="h-full bg-amber-500 w-0"></div>
                    </div>
                    <span className="min-w-[35px] text-right">0%</span>
                </div>
                <div className="flex items-center gap-3 text-[0.85rem] text-gray-600">
                    <span className="min-w-[45px] font-medium">1 star</span>
                    <div className="flex-grow h-2 bg-[#e5e7eb] rounded overflow-hidden">
                        <div className="h-full bg-amber-500 w-0"></div>
                    </div>
                    <span className="min-w-[35px] text-right">0%</span>
                </div>
            </div>
        </div>
        
        {/* --- Review Submission Form --- */}
        {showForm && (
            // .reviewForm replaced
            <form onSubmit={handleSubmit} className="mt-6 p-6 md:p-8 border border-[#e5e7eb] rounded-lg bg-white">
                <h4 className="text-xl font-bold m-0 mb-2 text-[#111]">Write a Review</h4>
                <p className="text-gray-500 m-0 mb-6 text-sm">Your email address will not be published. Required fields are marked *</p>
                
                {/* .ratingInput replaced */}
                <div className="mb-6">
                    <label className="block mb-2 font-semibold text-gray-700">Your rating *</label>
                    {/* .stars replaced */}
                    <div className="flex gap-2 text-[1.8rem]">
                        {[...Array(5)].map((_, index) => {
                        const ratingValue = index + 1;
                        return (
                            <label key={index} className="cursor-pointer">
                            <input type="radio" name="rating" value={ratingValue} onClick={() => setRating(ratingValue)} className="hidden" />
                            <FaStar 
                                className={`transition-colors duration-200 hover:text-amber-300 ${ratingValue <= (hover || rating) ? 'text-amber-400' : 'text-[#d1d5db]'}`} 
                                onMouseEnter={() => setHover(ratingValue)}
                                onMouseLeave={() => setHover(0)}
                            />
                            </label>
                        );
                        })}
                    </div>
                </div>

                {/* .formGroup replaced */}
                <div className="mb-5">
                    <label htmlFor='comment' className="block mb-2 font-semibold text-sm text-gray-700">Your review *</label>
                    <textarea 
                        id='comment' 
                        value={comment} 
                        onChange={e => setComment(e.target.value)} 
                        required 
                        className="w-full p-3 border border-[#d1d5db] rounded-md text-[0.95rem] font-sans box-border min-h-[100px] resize-y"
                    />
                </div>

                {/* .formRow replaced */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="mb-5">
                        <label htmlFor='author' className="block mb-2 font-semibold text-sm text-gray-700">Your Name *</label>
                        <input 
                            id='author' 
                            type="text" 
                            value={author} 
                            onChange={e => setAuthor(e.target.value)} 
                            required 
                            className="w-full p-3 border border-[#d1d5db] rounded-md text-[0.95rem] font-sans box-border"
                        />
                    </div>
                    <div className="mb-5">
                        <label htmlFor='email' className="block mb-2 font-semibold text-sm text-gray-700">Your Email *</label>
                        <input 
                            id='email' 
                            type="email" 
                            value={email} 
                            onChange={e => setEmail(e.target.value)} 
                            required 
                            className="w-full p-3 border border-[#d1d5db] rounded-md text-[0.95rem] font-sans box-border"
                        />
                    </div>
                </div>

                {/* .submitButton replaced */}
                <button 
                    type="submit" 
                    className="bg-gray-900 text-white border-none py-3 px-8 text-base font-semibold rounded-md cursor-pointer w-full sm:w-auto transition-colors duration-200 hover:bg-black disabled:bg-gray-400 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
            </form>
        )}

        {/* --- Customer Images --- */}
        {customerImages.length > 0 && (
            // .customerImagesSection replaced
            <div className="mb-10">
                <h3 className="text-xl font-bold mb-4 text-[#111]">Customer Images</h3>
                {/* .customerImagesGrid replaced */}
                <div className="flex gap-2.5 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-gray-100">
                    {customerImages.map((imageUrl, index) => (
                        imageUrl && (
                            // .customerImageWrapper replaced
                            <div key={index} className="relative w-[80px] h-[80px] flex-shrink-0 rounded-lg overflow-hidden border border-[#e5e7eb]">
                                <Image src={imageUrl} alt={`Customer image ${index + 1}`} fill style={{objectFit: 'cover'}} sizes="100px" />
                            </div>
                        )
                    ))}
                </div>
            </div>
        )}

        {/* --- Reviews List --- */}
        {/* .reviewsListContainer replaced */}
        <div className="mt-8 border-t border-[#e5e7eb] pt-8">
            {/* .reviewsListHeader replaced */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                {/* .reviewSearchInput replaced */}
                <input 
                    type="search" 
                    placeholder="Search customer reviews" 
                    className="p-2.5 px-4 border border-[#d1d5db] rounded-md w-full md:w-[300px] text-[0.9rem]" 
                />
                <span>{`1-${Math.min(visibleReviews, reviews.length)} of ${reviews.length} reviews`}</span>
                {/* .reviewSortDropdown replaced */}
                <select className="p-2.5 pr-8 pl-4 border border-[#d1d5db] rounded-md text-[0.9rem] bg-white cursor-pointer">
                    <option>Most Recent</option>
                    <option>Highest Rating</option>
                    <option>Lowest Rating</option>
                </select>
            </div>

            {reviews.length > 0 ? (
                reviews.slice(0, visibleReviews).map((edge: ReviewEdge) => (
                    // .reviewItem replaced
                    <div key={edge.node.id} className="flex gap-4 sm:gap-6 py-6 border-b border-[#f3f4f6] items-start last:border-b-0">
                        {/* .reviewAuthor replaced */}
                        <div className="flex-shrink-0 w-[50px]">
                            {/* .authorAvatar replaced */}
                            <div className="w-12 h-12 rounded-full bg-[#e5e7eb] text-gray-700 flex items-center justify-center font-bold text-[1.1rem] relative after:content-['✓'] after:absolute after:-bottom-0.5 after:-right-0.5 after:bg-emerald-500 after:text-white after:w-[18px] after:h-[18px] after:rounded-full after:border-2 after:border-white after:flex after:items-center after:justify-center after:text-[10px] after:font-bold">
                                {edge.node.author.node.name.substring(0, 2).toUpperCase()}
                            </div>
                        </div>
                        
                        {/* .reviewDetails replaced */}
                        <div className="flex-grow w-full">
                            {/* .reviewHeader replaced */}
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-1">
                                <strong className="text-base text-gray-900 font-bold">{edge.node.author.node.name}</strong>
                                <FormattedDate dateString={edge.node.date} />
                            </div>
                            {typeof edge.rating === 'number' && edge.rating > 0 && 
                                // .reviewRating replaced
                                <div className="flex gap-0.5 text-base text-amber-500 mb-2">
                                    <StarRatingDisplay rating={edge.rating} />
                                </div>
                            }
                            {/* .verifiedLink replaced */}
                            <div className="text-[0.8rem] text-emerald-500 font-semibold inline-block mb-3">✓ Verified review</div>
                            {/* .reviewContent replaced */}
                            <div className="text-[0.95rem] leading-[1.6] text-gray-600" dangerouslySetInnerHTML={{ __html: edge.node.content }} />
                        </div>
                    </div>
                ))
            ) : ( <p>There are no reviews yet.</p> )}
            
            {hasMoreReviews && (
                // .showMoreContainer replaced
                <div className="text-center mt-8 pt-4">
                    {/* .showMoreButton replaced */}
                    <button 
                        className="bg-transparent border border-[#d1d5db] py-3 px-8 rounded-md cursor-pointer font-semibold text-gray-700 transition-all duration-200 hover:bg-[#f3f4f6] hover:border-[#9ca3af]" 
                        onClick={() => setVisibleReviews(reviews.length)}
                    >
                        Show All {reviews.length} Reviews
                    </button>
                </div>
            )}
        </div>
    </div>
  );
}