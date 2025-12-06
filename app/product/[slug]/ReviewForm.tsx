'use client';

import { useState, FormEvent, useEffect } from 'react';
import toast from 'react-hot-toast';
import styles from './ReviewForm.module.css'; // নিশ্চিত করুন CSS গুলো এখানে আছে
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
  reviews: ReviewEdge[]; // নতুন প্রপ: রিভিউ লিস্ট
}

// --- Helper Components (Moved from ProductClient) ---
const StarRatingDisplay = ({ rating }: { rating: number }) => {
    const [starRating, setStarRating] = useState({ full: 0, empty: 5 });
    useEffect(() => {
        const totalStars = 5;
        const fullStars = Math.round(rating || 0);
        const emptyStars = totalStars - fullStars;
        setStarRating({ full: fullStars, empty: emptyStars });
    }, [rating]);

    return (
        <div className={styles.starDisplay}>
            {[...Array(starRating.full)].map((_, i) => <FaStar key={`full-${i}`} color="#ffc107" />)}
            {[...Array(starRating.empty)].map((_, i) => <FaStar key={`empty-${i}`} color="#e4e5e9" />)}
        </div>
    );
};

const FormattedDate = ({ dateString }: { dateString: string }) => {
    const [formattedDate, setFormattedDate] = useState<string | null>(null);
    useEffect(() => { setFormattedDate(new Date(dateString).toLocaleDateString()); }, [dateString]);
    if (!formattedDate) return <span className={styles.reviewDate}></span>;
    return <span className={styles.reviewDate}>{formattedDate}</span>;
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
    <div className={styles.reviewWidgetContainer}>
        {/* --- Review Summary & Form Toggle --- */}
        <div className={styles.reviewWidget}>
            <div className={styles.reviewsSummary}>
                <div className={styles.summaryAverage}>
                    <div className={styles.averageRatingValue}>{currentRating.toFixed(1)}</div>
                    <StarRatingDisplay rating={currentRating} />
                    <div className={styles.basedOnReviews}>Based on {currentReviewCount} reviews</div>
                    <button className={styles.addReviewButton} onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'Cancel Review' : 'Add a review'}
                    </button>
                </div>
                <div className={styles.summaryBreakdown}>
                     {/* Breakdown Bars (Static for UI as per requirement) */}
                    <div className={styles.ratingBarRow}><span>5 star</span><div className={styles.ratingBar}><div style={{width: '100%'}}></div></div><span>100%</span></div>
                    <div className={styles.ratingBarRow}><span>4 star</span><div className={styles.ratingBar}><div style={{width: '0%'}}></div></div><span>0%</span></div>
                    <div className={styles.ratingBarRow}><span>3 star</span><div className={styles.ratingBar}><div style={{width: '0%'}}></div></div><span>0%</span></div>
                    <div className={styles.ratingBarRow}><span>2 star</span><div className={styles.ratingBar}><div style={{width: '0%'}}></div></div><span>0%</span></div>
                    <div className={styles.ratingBarRow}><span>1 star</span><div className={styles.ratingBar}><div style={{width: '0%'}}></div></div><span>0%</span></div>
                </div>
            </div>
            
            {/* --- Review Submission Form --- */}
            {showForm && (
                <form onSubmit={handleSubmit} className={styles.reviewForm}>
                    <h4>Write a Review</h4>
                    <p>Your email address will not be published. Required fields are marked *</p>
                    <div className={styles.ratingInput}>
                        <label>Your rating *</label>
                        <div className={styles.stars}>
                            {[...Array(5)].map((_, index) => {
                            const ratingValue = index + 1;
                            return (
                                <label key={index}>
                                <input type="radio" name="rating" value={ratingValue} onClick={() => setRating(ratingValue)} />
                                <FaStar 
                                    className={styles.star} 
                                    color={ratingValue <= (hover || rating) ? "#ffc107" : "#e4e5e9"} 
                                    onMouseEnter={() => setHover(ratingValue)}
                                    onMouseLeave={() => setHover(0)}
                                />
                                </label>
                            );
                            })}
                        </div>
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor='comment'>Your review *</label>
                        <textarea id='comment' value={comment} onChange={e => setComment(e.target.value)} required />
                    </div>
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label htmlFor='author'>Your Name *</label>
                            <input id='author' type="text" value={author} onChange={e => setAuthor(e.target.value)} required />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor='email'>Your Email *</label>
                            <input id='email' type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                        </div>
                    </div>
                    <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
                        {isSubmitting ? 'Submitting...' : 'Submit Review'}
                    </button>
                </form>
            )}
        </div>

        {/* --- Customer Images --- */}
        {customerImages.length > 0 && (
            <div className={styles.customerImagesSection}>
                <h3>Customer Images</h3>
                <div className={styles.customerImagesGrid}>
                    {customerImages.map((imageUrl, index) => (
                        imageUrl && (
                            <div key={index} className={styles.customerImageWrapper}>
                                <Image src={imageUrl} alt={`Customer image ${index + 1}`} fill style={{objectFit: 'cover'}} sizes="100px" />
                            </div>
                        )
                    ))}
                </div>
            </div>
        )}

        {/* --- Reviews List --- */}
        <div className={styles.reviewsListContainer}>
            <div className={styles.reviewsListHeader}>
                <input type="search" placeholder="Search customer reviews" className={styles.reviewSearchInput} />
                <span>{`1-${Math.min(visibleReviews, reviews.length)} of ${reviews.length} reviews`}</span>
                <select className={styles.reviewSortDropdown}>
                    <option>Most Recent</option>
                    <option>Highest Rating</option>
                    <option>Lowest Rating</option>
                </select>
            </div>

            {reviews.length > 0 ? (
                reviews.slice(0, visibleReviews).map((edge: ReviewEdge) => (
                    <div key={edge.node.id} className={styles.reviewItem}>
                        <div className={styles.reviewAuthor}>
                            <div className={styles.authorAvatar}>{edge.node.author.node.name.substring(0, 2).toUpperCase()}</div>
                        </div>
                        <div className={styles.reviewDetails}>
                            <div className={styles.reviewHeader}>
                                <strong>{edge.node.author.node.name}</strong>
                                <FormattedDate dateString={edge.node.date} />
                            </div>
                            {typeof edge.rating === 'number' && edge.rating > 0 && 
                                <div className={styles.reviewRating}>
                                    <StarRatingDisplay rating={edge.rating} />
                                </div>
                            }
                            <div className={styles.verifiedLink}>✓ Verified review</div>
                            <div className={styles.reviewContent} dangerouslySetInnerHTML={{ __html: edge.node.content }} />
                        </div>
                    </div>
                ))
            ) : ( <p>There are no reviews yet.</p> )}
            
            {hasMoreReviews && (
                <div className={styles.showMoreContainer}>
                    <button 
                        className={styles.showMoreButton} 
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