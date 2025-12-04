// app/product/[slug]/ProductClient.tsx

'use client';

import { useState, useEffect, useRef, ComponentType } from 'react';
import styles from './ProductPage.module.css';
import Image from 'next/image';
import QuantityAddToCart from './QuantityAddToCart';
import ReviewForm from './ReviewForm';
import ProductCard from '../../products/ProductCard';
import { gtmViewItem } from '../../../lib/gtm';
import { klaviyoTrackViewedProduct } from '../../../lib/klaviyo';
import { productVideoMap } from '../productVideos';
import LazyLoadYouTube from '../components/YouTubVideo/LazyLoadYouTube';
import StickyAddToCart from './StickyAddToCart';
import { productLayoutMap } from '../productLayoutMap';
import { productInfoPanelsMap } from '../productInfoPanelsMap';
import SlideOutPanel from '../components/SlideOutPanel/SlideOutPanel';

// --- Interfaces Update (Variable Product Support Added) ---
interface ImageNode { sourceUrl: string; }
interface Attribute { name: string; options: string[]; label?: string; }
interface VariationAttribute { name: string; value: string; }

// ভেরিয়েশনের টাইপ ডেফিনিশন
interface Variation {
    databaseId: number;
    price?: string;
    regularPrice?: string;
    salePrice?: string;
    stockStatus?: string;
    stockQuantity?: number;
    name?: string;
    attributes: { nodes: VariationAttribute[] };
    image?: ImageNode;
}

interface ReviewEdge {
    rating: number;
    node: {
        id: string;
        author: { node: { name: string; avatar?: { url: string } }; };
        content: string;
        date: string;
    };
}

interface RelatedProduct { id: string; databaseId: number; name: string; slug: string; image?: ImageNode; price?: string; onSale: boolean; }

interface Product {
    id: string;
    databaseId: number;
    slug: string;
    name: string;
    description: string;
    shortDescription?: string;
    image?: ImageNode;
    galleryImages: { nodes: ImageNode[]; };
    price?: string;
    onSale: boolean;
    regularPrice?: string;
    salePrice?: string;
    stockStatus?: string | null;
    stockQuantity?: number | null;
    attributes: { nodes: Attribute[]; };
    variations?: { nodes: Variation[]; }; // ভেরিয়েশন লিস্ট
    averageRating: number;
    reviewCount: number;
    reviews: { edges: ReviewEdge[]; };
    related: { nodes: RelatedProduct[]; };
    weight?: number;
    length?: number;
    width?: number;
    height?: number;
}
// --- Helper Functions ---
const cleanStr = (str: string) => {
    if (!str) return '';
    return str.toLowerCase().replace(/pa_/g, '').replace(/[^a-z0-9]/g, ''); 
};

const formatLabel = (name: string) => {
    const clean = name.replace(/^pa_/, '').replace(/_/g, ' ');
    return clean.charAt(0).toUpperCase() + clean.slice(1);
};

// --- Sub-Components ---
const StarRating = ({ rating }: { rating: number }) => {
    const [starRating, setStarRating] = useState({ full: 0, empty: 5 });
    useEffect(() => {
        const totalStars = 5;
        const fullStars = Math.round(rating || 0);
        const emptyStars = totalStars - fullStars;
        setStarRating({ full: fullStars, empty: emptyStars });
    }, [rating]);
    return (
        <div className={styles.starRating}>
            {[...Array(starRating.full)].map((_, i) => <span key={`full-${i}`}>★</span>)}
            {[...Array(starRating.empty)].map((_, i) => <span key={`empty-${i}`}>☆</span>)}
        </div>
    );
};

const FormattedDate = ({ dateString }: { dateString: string }) => {
    const [formattedDate, setFormattedDate] = useState<string | null>(null);
    useEffect(() => { setFormattedDate(new Date(dateString).toLocaleDateString()); }, [dateString]);
    if (!formattedDate) return <span className={styles.reviewDate}></span>;
    return <span className={styles.reviewDate}>{formattedDate}</span>;
};

const SIZE_ORDER = ['110', '120', '130', '140', '150', '160', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL'];

export default function ProductClient({ product }: { product: Product }) {
    // --- State Management ---
    const [mainImage, setMainImage] = useState<string | undefined>(product.image?.sourceUrl);
    
    // ভেরিয়েবল প্রোডাক্টের স্টেট
    const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
    const [currentVariation, setCurrentVariation] = useState<Variation | null>(null);
    const isVariableProduct = product.variations && product.variations.nodes && product.variations.nodes.length > 0;

    // --- Helper Logic ---
    const parsePrice = (priceStr?: string): number => {
        if (!priceStr) return 0;
        return parseFloat(priceStr.replace(/[^0-9.]/g, ''));
    };

    // --- Attribute Selection Logic ---
    const handleAttributeSelect = (attributeName: string, value: string) => {
        const newAttributes = { ...selectedAttributes, [attributeName]: value };
        setSelectedAttributes(newAttributes);

        if (!isVariableProduct) return;

        // ভেরিয়েশন ম্যাচিং লজিক
        const matchingVariation = product.variations?.nodes.find(variation => {
            const isMatch = variation.attributes.nodes.every(varAttr => {
                const varName = cleanStr(varAttr.name);
                const varValue = cleanStr(varAttr.value);
                if (!varValue) return true; // Any value

                const userKey = Object.keys(newAttributes).find(k => cleanStr(k) === varName);
                if (!userKey) return false; 
                return varValue === cleanStr(newAttributes[userKey]);
            });
            return isMatch;
        });

        const requiredAttributeCount = product.attributes.nodes.length;
        const selectedAttributeCount = Object.keys(newAttributes).length;

        if (matchingVariation && selectedAttributeCount >= requiredAttributeCount) {
            // ম্যাচ পাওয়া গেলে ভেরিয়েশন সেট করুন এবং ইমেজ আপডেট করুন
            setCurrentVariation(matchingVariation);
            if (matchingVariation.image?.sourceUrl) {
                setMainImage(matchingVariation.image.sourceUrl);
            }
        } else {
            setCurrentVariation(null);
        }
    };

    // --- Dynamic Display Logic (Price & Stock) ---
    const displayPrice = currentVariation?.price || product.price;
    const displaySalePrice = currentVariation?.salePrice || product.salePrice;
    const displayRegularPrice = currentVariation?.regularPrice || product.regularPrice;
    const isOnSale = currentVariation ? (!!currentVariation.salePrice) : product.onSale;

    const currentStockStatus = currentVariation ? currentVariation.stockStatus : product.stockStatus;
    const currentStockQty = currentVariation ? currentVariation.stockQuantity : product.stockQuantity;
    
    // বাটন ভ্যালিডেশন চেক
    const isSelectionMissing = isVariableProduct && !currentVariation;

    // --- Discount Calculation ---
    const regularPriceNum = parsePrice(displayRegularPrice);
    const salePriceNum = parsePrice(displaySalePrice);
    const discountPercent = regularPriceNum > 0 && salePriceNum < regularPriceNum 
        ? Math.round(((regularPriceNum - salePriceNum) / regularPriceNum) * 100) 
        : 0;

    // --- Refs & Other Hooks ---
    const mainAddToCartRef = useRef<HTMLDivElement | null>(null);
    const [isStickyVisible, setStickyVisible] = useState(false);
    const INITIAL_REVIEWS_TO_SHOW = 5;
    const [visibleReviews, setVisibleReviews] = useState(INITIAL_REVIEWS_TO_SHOW);
    
    // Panels
    const [activePanel, setActivePanel] = useState<string | null>(null);
    const CustomSections = productLayoutMap[product.slug] || [];
    const panelConfigs = productInfoPanelsMap[product.slug] || [];
    const activePanelConfig = panelConfigs.find(p => p.id === activePanel);
    const PanelContentComponent = activePanelConfig?.component as ComponentType<{ product: Product }> | undefined;

    // Sticky Observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                const isAboveViewport = entry.boundingClientRect.top < 0;
                setStickyVisible(!entry.isIntersecting && isAboveViewport);
            },
            { rootMargin: "0px", threshold: [0, 1] } 
        );
        const currentRef = mainAddToCartRef.current;
        if (currentRef) observer.observe(currentRef);
        return () => { if (currentRef) observer.unobserve(currentRef); };
    }, []);

    // Tracking
    useEffect(() => {
        if (product) {
            const priceString = product.salePrice || product.price || '0';
            const priceNum = parseFloat(priceString.replace(/[^0-9.]/g, ''));

            gtmViewItem({ item_name: product.name, item_id: product.databaseId, price: priceNum, quantity: 1 });

            klaviyoTrackViewedProduct({
                ProductID: product.databaseId,
                ProductName: product.name,
                Quantity: 1,
                ItemPrice: priceNum,
                RowTotal: priceNum,
                ProductURL: `${window.location.origin}/product/${product.slug}`,
                ImageURL: product.image?.sourceUrl || '',
            });
        }
    }, [product]);
           
    if (!product) return null;
    const allReviews = product.reviews?.edges || [];
    const hasMoreReviews = allReviews.length > visibleReviews;

    // --- CART OBJECT CONSTRUCTION (Updated for Variation) ---
    const productForCart = {
        id: product.id,
        databaseId: product.databaseId, 
        variationId: currentVariation ? currentVariation.databaseId : undefined, 
        name: product.name + (currentVariation && Object.keys(selectedAttributes).length > 0 ? ` - ${Object.values(selectedAttributes).join(', ')}` : ''),
        price: displayPrice,
        image: product.image?.sourceUrl,
        slug: product.slug,
    };
    // --------------------------------------------------------

    const allImages = [product.image, ...product.galleryImages.nodes].filter(Boolean) as ImageNode[];
    const customerImages = product.reviews?.edges?.map((edge: ReviewEdge) => edge.node.author.node.avatar?.url).filter(Boolean) || [];
    const videoId = productVideoMap[product.slug];   
     const sortedAttributeNodes = product.attributes?.nodes ? [...product.attributes.nodes].sort((a, b) => {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();
        if (nameA.includes('color')) return -1;
        if (nameB.includes('color')) return 1;
        return 0;
    }) : [];

    return (
    <div className={styles.container}>
    <div className={styles.productLayout}>
        <div className={styles.galleryContainer}>
            {mainImage && <Image src={mainImage} alt={product.name} width={1000} height={1000} className={styles.mainImage} />}
            {allImages.length > 1 && (
                <div className={styles.thumbnailGrid}>
                {allImages.map((img, index) => (
                    <Image key={index} src={img.sourceUrl} width={800} height={800} alt={`${product.name} thumbnail ${index + 1}`}
                    className={`${styles.thumbnail} ${mainImage === img.sourceUrl ? styles.activeThumbnail : ''}`}
                    onClick={() => setMainImage(img.sourceUrl)} />
                ))}
                </div>
            )}
        </div>

        <div>
        <h1 className={styles.productTitle}>{product.name}</h1>
        <div className={styles.ratingWrapper}>
            <div className={styles.rating}>★★★★☆</div>
            {product.reviewCount > 0 ? (
                <a href="#reviews" className={styles.reviewsCount}>({product.reviewCount} customer reviews)</a>
            ) : (
                <div className={styles.reviewsCount}>(No reviews yet)</div>
            )}
        </div>
        <div className={styles.priceWrapper}>
            <Image src="https://gobikes.au/wp-content/uploads/2025/08/hot-deal.svg" width={50} height={50} alt="Hot Deal" className={styles.dealBadge} />
            {product.onSale && product.salePrice ? (
                <div className={styles.salePriceContainer}>
                    <span className={styles.regularPriceStriked} dangerouslySetInnerHTML={{ __html: product.regularPrice || '' }} />
                    <span className={styles.salePrice} dangerouslySetInnerHTML={{ __html: product.salePrice }} />
                    {discountPercent > 0 && (
                        <span className={styles.discountBadge}>-{discountPercent}%</span>
                    )}
                </div>
            ) : (
                <div className={styles.productPrice} dangerouslySetInnerHTML={{ __html: product.price || '' }} />
            )}
        </div>
        
        {/* --- সমাধান: স্টকের তথ্য priceWrapper-এর পরে যোগ করা হয়েছে --- */}
        <div className={styles.stockInfo}>
            {product.stockStatus === 'IN_STOCK' ? (
                product.stockQuantity && product.stockQuantity > 0 && product.stockQuantity <= 5 ? 
                    <span className={styles.lowStock}>Hurry! Only {product.stockQuantity} left in stock!</span> :
                    <span className={styles.inStock}>✓ In Stock &amp; Ready to Ship</span>
            ) : product.stockStatus === 'OUT_OF_STOCK' ? (
                <span className={styles.outOfStock}>✗ Out of Stock</span>
            ) : product.stockStatus === 'ON_BACKORDER' ? (
                <span className={styles.onBackorder}>Available on Backorder</span>
            ) : null}
        </div>
        {/* ----------------------------------------------------------- */}

        {product.shortDescription && (
            <div 
            className={styles.shortDescription} 
            dangerouslySetInnerHTML={{ __html: product.shortDescription.replace(/<ul>/g, `<ul class="${styles.featuresGrid}">`).replace(/<li>/g, `<li class="${styles.featureItem}">`) }} 
            />
        )}

        {/* === Attributes Selection (Styled) === */}
        {sortedAttributeNodes.map((attr) => {
            
            // ★★★ ৩. Size Options Sorting Logic ★★★
            let displayOptions = [...attr.options]; 

            if (attr.name.toLowerCase().includes('size')) {
                 displayOptions.sort((a, b) => {
                     const indexA = SIZE_ORDER.indexOf(a.toUpperCase()); // Case insensitive
                     const indexB = SIZE_ORDER.indexOf(b.toUpperCase());
                     
                     // দুটাই যদি লিস্টে থাকে
                     if (indexA !== -1 && indexB !== -1) return indexA - indexB;
                     
                     // যে কোনো একটা থাকলে সেটা আগে যাবে
                     if (indexA !== -1) return -1;
                     if (indexB !== -1) return 1;
                     
                     return 0; 
                 });
            }

            return (
                <div key={attr.name} className={styles.attributeRow}>
                    <div className={styles.attributeLabel}>
                        {formatLabel(attr.name)}: 
                        <span className={styles.selectedValue}>{selectedAttributes[attr.name]}</span>
                    </div>
                    
                    <div className={styles.attributeOptions}>
                        {displayOptions.map((option) => {
                            const isActive = cleanStr(selectedAttributes[attr.name]) === cleanStr(option);
                            return (
                                <button
                                    key={option}
                                    type="button"
                                    onClick={() => handleAttributeSelect(attr.name, option)}
                                    className={`${styles.attributeBtn} ${isActive ? styles.attributeBtnActive : ''}`}
                                >
                                    {option}
                                </button>
                            );
                        })}
                    </div>
                </div>
            );
        })}

        {/* === Add to Cart Section === */}
        <div ref={mainAddToCartRef}>
             {/* যদি ভেরিয়েশন সিলেক্ট না করা হয়, তবে বাটন ডিজেবল থাকবে */}
             {isVariableProduct && !currentVariation ? (
                 <div style={{marginTop: '20px'}}>
                     <button disabled style={{ padding:'15px', width:'100%', background:'#e5e5e5', color: '#888', border:'none', borderRadius: '5px', cursor:'not-allowed', fontWeight: 'bold' }}>
                        {Object.keys(selectedAttributes).length < product.attributes.nodes.length ? "Select Size and Color" : "Unavailable / Out of Stock"}
                     </button>
                 </div>
             ) : (
                 <QuantityAddToCart product={productForCart} />
             )}
        </div>

        {/* === Trust Badges === */}
        <div className={styles.producttrustfeatureswrapper}>
          <div className={styles.trustfeaturesgrid}>
              <div className={styles.trustfeatureitem}>✓ 100% Secure Checkout</div>
              <div className={styles.trustfeatureitem}>✓ 30 Days Easy Returns</div>
              <div className={styles.trustfeatureitem}>✓ 1 Year Full Warranty</div>
              <div className={styles.trustfeatureitem}>✓ Fast Shipping Aus-Wide</div>
           </div>
        </div>
        <div className={styles.checkoutGuarantee}>
            <p className={styles.guaranteeText}>Guaranteed Safe Checkout</p>
            <Image src="https://gobikes.au/wp-content/uploads/2018/07/trust-symbols_b-1.jpg" width={1600} height={160} alt="Payment Methods" className={styles.paymentLogos} />
        </div>
        </div>
    </div>

    {/* === Panels & Custom Sections === */}
    {panelConfigs.length > 0 && (
            <div className={styles.infoTabsSection}>
                {panelConfigs.map((panel) => (
                    <div key={panel.id} className={styles.tabItem} onClick={() => setActivePanel(panel.id)}>
                        <span>{panel.label}</span>
                        <span>&gt;</span>
                    </div>
                ))}
            </div>
        )}

        {/* === কাস্টম কনটেন্ট সেকশন === */}
        {CustomSections.length > 0 && (
            <div className={styles.customSectionsWrapper}>
                {CustomSections.map((SectionComponent, index) => (
                    <SectionComponent key={`custom-section-${index}`} />
                ))}
            </div>
        )}
    {videoId && (
        <section className={styles.productInfoSection}>
            <h2 className={styles.sectionTitle}>From Wobbles to Woo-hoos!</h2>
            <LazyLoadYouTube videoId={videoId} title={product.name} />
        </section>
    )}
    <div className={styles.lowerSectionsWrapper}>
    {product.description && (
        <section className={styles.productInfoSection}>
        <h2 className={styles.sectionTitle}>Description</h2>
        <div className={styles.sectionContent} dangerouslySetInnerHTML={{ __html: product.description }} />
        </section>
    )}

    {(product.weight || (product.length && product.width && product.height) || (product.attributes && product.attributes.nodes.length > 0)) && (
<section className={styles.productInfoSection}>
    <h2 className={styles.sectionTitle}>Additional Information</h2>
    <div className={styles.sectionContent}>
        <table className={styles.attributesTable}>
            <tbody>
                {product.weight && (
                    <tr>
                        <th>Weight</th>
                        <td>{product.weight} kg</td>
                    </tr>
                )}

                {product.length && product.width && product.height && (
                    <tr>
                        <th>Dimensions</th>
                        <td>{`${product.length} × ${product.width} × ${product.height} cm`}</td>
                    </tr>
                )}

                {product.attributes?.nodes.map((attr: { name: string, options: string[] }, index: number) => (
                    <tr key={index}>
                        <th>{attr.name}</th>
                        <td>{attr.options.join(', ')}</td>
                    </tr>
                ))}
             </tbody>
         </table>
      </div>
   </section>
   )}
    
   <section id="reviews" className={styles.productInfoSection}>
<h2 className={styles.sectionTitle}>Customer Reviews</h2>
    <div className={styles.reviewsGrid}>

        <div className={styles.reviewFormWrapper}>
                <ReviewForm 
                    productId={product.databaseId}
                    averageRating={product.averageRating ?? 0}
                    reviewCount={product.reviewCount ?? 0}
                />
        </div>

        <div className={styles.reviewsList}>
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
    <div className={styles.reviewsListContainer}>
        <div className={styles.reviewsListHeader}>
            <input type="search" placeholder="Search customer reviews" className={styles.reviewSearchInput} />
            <span>{`1-${Math.min(visibleReviews, allReviews.length)} of ${allReviews.length} reviews`}</span>
            <select className={styles.reviewSortDropdown}>
                <option>Most Recent</option>
                <option>Highest Rating</option>
                <option>Lowest Rating</option>
            </select>
        </div>

            {allReviews.length > 0 ? (
                allReviews.slice(0, visibleReviews).map((edge: ReviewEdge) => (
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
                        <div className={styles.reviewRating}><StarRating rating={edge.rating} /></div>
                        }
                        <a href="#" className={styles.verifiedLink}>✓ Verified review</a>
                        <div className={styles.reviewContent} dangerouslySetInnerHTML={{ __html: edge.node.content }} />
                    </div>
                </div>
            ))
            ) : ( <p>There are no reviews yet.</p> )}
        
        {hasMoreReviews && (
            <div className={styles.showMoreContainer}>
                <button 
                    className={styles.showMoreButton} 
                    onClick={() => setVisibleReviews(allReviews.length)}
                >
                    Show All {allReviews.length} Reviews
                </button>
            </div>
        )}
        </div>
    </div>
</div>
</section>
    {product.related && product.related.nodes.length > 0 && (
        <div className={styles.relatedProducts}>
        <h2 className={styles.relatedTitle}>Related Products</h2>
        <div className={styles.relatedGrid}>
            {product.related.nodes.map(relatedProduct => (
            <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
        </div>
        </div>
    )}

    {/* === Slide Panel & Sticky Cart === */}
    <SlideOutPanel isOpen={!!activePanelConfig} onClose={() => setActivePanel(null)} title={activePanelConfig?.label || ''} >
            {PanelContentComponent && <PanelContentComponent product={product} />}
    </SlideOutPanel>
    
    <StickyAddToCart 
        product={productForCart} 
        isVisible={isStickyVisible} 
        isValid={!isSelectionMissing} 
    />
    
    </div>
    </div>
   );
}