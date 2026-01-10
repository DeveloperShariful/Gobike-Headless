// app/products/ProductCard.tsx

'use client';
import Image from 'next/image';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; 
// import styles from './products.module.css'; // CSS Module সরানো হয়েছে
import { useCart } from '../../context/CartContext';

// --- Interface Update ---
interface Product {
  id: string;
  databaseId: number;
  name: string;
  slug: string;
  type?: string; 
  __typename?: string; 
  image?: { sourceUrl: string };
  price?: string;
  averageRating?: number;
  reviewCount?: number;
  onSale: boolean;
  regularPrice?: string;
  salePrice?: string;
}

interface ProductCardProps {
  product: Product;
}

const StarRating = ({ rating, count }: { rating: number, count: number }) => {
  const totalStars = 5;
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 !== 0;
  const emptyStars = totalStars - fullStars - (halfStar ? 1 : 0);

  return (
    // .starRating replaced
    <div className="text-black-500 text-base mb-4 flex items-center justify-center gap-0.5">
      {[...Array(fullStars)].map((_, i) => <span key={`full-${i}`}>★</span>)}
      {halfStar && <span key="half">⭐</span>}
      {[...Array(emptyStars)].map((_, i) => <span key={`empty-${i}`}>☆</span>)}
      
      {count > 0 && (
        // .ratingValue replaced
        <span className="text-gray-500 text-xs ml-2 font-normal">
          ({rating.toFixed(1)}) ({count} customer review{count > 1 ? 's' : ''})
        </span>
      )}
    </div>
  );
};

export default function ProductCard({ product }: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const { addToCart } = useCart();
  const router = useRouter();
  const parsePrice = (priceStr?: string): number => {
    if (!priceStr) return 0;
    return parseFloat(priceStr.replace(/[^0-9.]/g, ''));
  };

  const regularPriceNum = parsePrice(product.regularPrice);
  const salePriceNum = parsePrice(product.salePrice);
  const discountPercent = regularPriceNum > 0 && salePriceNum < regularPriceNum 
      ? Math.round(((regularPriceNum - salePriceNum) / regularPriceNum) * 100) 
      : 0;

  const isVariableProduct = product.type === 'VARIABLE' || product.__typename === 'VariableProduct';

  const handleButtonClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    'use client';
    e.preventDefault();
    e.stopPropagation();

    if (isVariableProduct) {
        router.push(`/product/${product.slug}`);
        return;
    }
    if (!product || !product.databaseId) {
      console.error("Incomplete product data in ProductCard:", product);
      return;
    }

    setIsAdding(true);
    
    try {
        await addToCart({
            id: product.id,
            databaseId: product.databaseId,
            name: product.name,
            price: product.price,
            image: product.image?.sourceUrl,
            slug: product.slug,
        }, 1);
    } catch (error) {
        console.error("Error adding item from ProductCard", error);
    } finally {
        setIsAdding(false);
    }
  };

  return (
    // .productCard replaced (Bikes/Spare Parts পেজের কার্ডের মতো ডিজাইন)
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group h-full">
        <Link href={`/product/${product.slug}`} className="flex flex-col flex-grow no-underline text-inherit">
            {/* .productImageContainer replaced */}
            <div className="relative w-full aspect-square bg-gray-50 p-1 overflow-hidden">
                {product.onSale && discountPercent > 0 && (
                    // .discountBadge replaced
                    <div className="absolute top-3 left-3 bg-red-600 text-white px-2 py-1 rounded-md text-xs font-bold z-10 shadow-sm">
                        -{discountPercent}%
                    </div>
                )}
                {product.image?.sourceUrl ? ( 
                  // .productImage replaced
                  <Image 
                    src={product.image.sourceUrl} 
                    width={1000} 
                    height={1000} 
                    alt={product.name} 
                    className="w-full h-full object-contain transition-transform duration-500 ease-in-out group-hover:scale-110" 
                  /> 
                ) : ( 
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">No Image</div> 
                )}
            </div>
            {/* .productInfo replaced */}
            <div className="p-5 text-center flex flex-col flex-grow">
                 {/* .productName replaced */}
                 <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight min-h-[3rem] line-clamp-2">
                    {product.name}
                 </h3>

                {typeof product.averageRating === 'number' ? (
                    <StarRating rating={product.averageRating} count={product.reviewCount || 0} />
                ) : (
                    <div className="h-6 mb-4"></div> // Placeholder for spacing consistency
                )}

                {/* .priceContainer replaced */}
                <div className="flex justify-center items-baseline gap-2 mb-4 h-9">
                    {product.onSale && product.salePrice ? (
                        <>
                            {/* .regularPriceStriked replaced */}
                            <span className="text-sm font-semibold text-gray-400 line-through" dangerouslySetInnerHTML={{ __html: product.regularPrice || '' }} />
                            {/* .salePrice replaced */}
                            <span className="text-xl font-extrabold text-red-600" dangerouslySetInnerHTML={{ __html: product.salePrice }} />
                        </>
                    ) : (
                        // .productPrice replaced
                        <div className="text-xl font-extrabold text-gray-900" dangerouslySetInnerHTML={{ __html: product.price || 'Price not available' }} />
                    )}
                </div>
            </div>
        </Link>
        {/* .addToCartBtn replaced */}
        <div className="px-1 pb-5">
            <button 
                className="w-full py-2 px-3 text-base font-bold text-white bg-gray-900 border-2 border-gray-900 rounded-full cursor-pointer transition-all duration-300 hover:bg-white hover:text-gray-900 disabled:bg-gray-300 disabled:border-gray-300 disabled:cursor-not-allowed disabled:text-gray-500 disabled:hover:bg-gray-300" 
                onClick={handleButtonClick}
                disabled={isAdding} 
            >
                {isAdding ? 'Adding...' : (isVariableProduct ? 'Select Options' : 'Add to Cart')}
            </button>
        </div>
    </div>
  );
}