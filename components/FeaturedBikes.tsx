//components/FeaturedBikes.tsx

'use client';

import { useState, useEffect } from 'react';
import { gql } from '@apollo/client';
import client from '../lib/apolloClient';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '../context/CartContext';

interface Product {
  id: string;
  databaseId: number;
  name: string;
  slug: string;
  image?: { sourceUrl: string } | null;
  price?: string | null;
  averageRating?: number | null;
  reviewCount?: number | null;
  onSale: boolean;
  regularPrice?: string | null;
  salePrice?: string | null;
}

interface QueryData {
  products: {
    nodes: Product[];
  } | null;
}

// --- GraphQL কোয়েরি ---
const GET_FEATURED_BIKES_QUERY = gql`
  query GetFeaturedBikes {
    products(
      where: { 
        category: "bikes", 
        orderby: { field: NAME, order: ASC } 
      }, 
      first: 5
    ) {
      nodes {
        id
        databaseId
        name
        slug
        image { sourceUrl }
        averageRating
        reviewCount
        onSale
        ... on SimpleProduct { 
          price(format: FORMATTED)
          regularPrice(format: FORMATTED)
          salePrice(format: FORMATTED)
        }
        ... on VariableProduct { 
          price(format: FORMATTED)
          regularPrice(format: FORMATTED)
          salePrice(format: FORMATTED)
        }
      }
    }
  }
`;

// --- স্টার রেটিং কম্পোনেন্ট ---
const StarRating = ({ rating, count }: { rating: number, count: number }) => {
    const totalStars = 5;
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 !== 0;
    const emptyStars = totalStars - fullStars - (halfStar ? 1 : 0);

    return (
        // .featuredStarRating replaced
        <div className="flex justify-center items-center gap-[2px] text-black">
            {[...Array(fullStars)].map((_, i) => <span key={`full-${i}`} className="text-[1.1rem]">★</span>)}
            {halfStar && <span key="half" className="text-[1.1rem]">⭐</span>}
            {[...Array(emptyStars)].map((_, i) => <span key={`empty-${i}`} className="text-[1.1rem]">☆</span>)}
            
            {count > 0 && (
              // .featuredReviewCount replaced
              <span className="text-[0.9rem] text-black ml-2">
                ({rating.toFixed(1)}) ({count})
              </span>
            )}
        </div>
    );
};

// --- Add to Cart বাটন ---
const AddToCartButton = ({ product }: { product: Product }) => {
    const { addToCart } = useCart();
    const [isAdding, setIsAdding] = useState(false);

    const handleAddToCart = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsAdding(true);
        try {
            await addToCart({
                id: product.id,
                databaseId: product.databaseId,
                name: product.name,
                slug: product.slug,
                price: product.price,
                image: product.image?.sourceUrl
            }, 1);
        } catch (error) {
            console.error("Error from AddToCartButton:", error);
        } finally {
            setIsAdding(false);
        }
    };

    return (
        // .featuredAddToCartBtn replaced
        <button 
            onClick={handleAddToCart} 
            className="w-full p-2 mt-4 bg-[#1a1a1a] text-white border-none rounded-full font-semibold text-[1.5rem] cursor-pointer transition-colors duration-200 hover:bg-[#333] disabled:opacity-70 disabled:cursor-not-allowed" 
            disabled={isAdding}
        >
            {isAdding ? 'Adding...' : 'Add to cart'}
        </button>
    );
}

// --- মূল কম্পোনেন্ট ---
export default function FeaturedBikes() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getFeaturedBikes() {
      try {
        const { data } = await client.query<QueryData>({
          query: GET_FEATURED_BIKES_QUERY,
        });
        
        if (data?.products?.nodes) {
            setProducts(data.products.nodes);
        }
      } catch (error) {
        console.error("Error fetching featured bikes:", error);
      } finally {
        setLoading(false);
      }
    }
    getFeaturedBikes();
  }, []);

  if (loading) {
    return (
        <section className="w-full py-16 bg-white">
            <div className="max-w-[1200px] mx-auto px-4">
                <p className="text-center">Loading Top Bikes...</p>
            </div>
        </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    // .featuredBikesSection replaced
    <section className="w-full py-16 bg-white">
      {/* .container replaced */}
      <div className="max-w-[1500px] mx-auto px-1">
        
        {/* .sectionHeader replaced */}
        <div className="text-center mb-12">
          {/* .sectionTitle replaced */}
          <h2 className="text-[2.5rem] font-extrabold mb-4 text-[#1a1a1a]">Explore Our Top Kids Electric Bikes</h2>
          {/* .sectionSubtitle replaced */}
          <p className="text-[1.1rem] text-[#555] max-w-[700px] mx-auto leading-[1.6]">
            Discover our best-selling Kids electric bike, engineered for safety, performance, and endless fun. 
            Each GoBike is built to grow with your child, making it the perfect choice for young Aussie adventurers.
          </p>
        </div>

        {/* .featuredGrid replaced */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {products.map((product) => {
            const parsePrice = (priceStr?: string | null): number => {
                if (!priceStr) return 0;
                return parseFloat(priceStr.replace(/[^0-9.]/g, ''));
            };
            const regularPriceNum = parsePrice(product.regularPrice);
            const salePriceNum = parsePrice(product.salePrice);
            const discountPercent = regularPriceNum > 0 && salePriceNum > 0 && salePriceNum < regularPriceNum 
                ? Math.round(((regularPriceNum - salePriceNum) / regularPriceNum) * 100)
                : 0;
            
            return (
                // .featuredProductCard replaced
                <div key={product.id} className="text-center border border-[#e2e2e2] rounded-xl p-1 transition-all duration-300 bg-[#f3f3f3] flex flex-col hover:border-[#e0e0e0] hover:shadow-[0_8px_24px_rgba(0,0,0,0.07)]">
                  <Link href={`/product/${product.slug}`} className="no-underline text-inherit flex flex-col flex-grow group">
                    
                    {/* .featuredImageWrapper replaced */}
                    <div className="relative bg-[#f8f9fa] rounded-lg mb-4 overflow-hidden">
                      {product.onSale && discountPercent > 0 && (
                          // .featuredDiscountBadge replaced
                          <div className="absolute top-0 left-0 bg-[#fc0505] text-white px-[0.6rem] py-1 rounded-md text-[1.2rem] font-bold z-10">-{discountPercent}%</div>
                      )}
                      {product.image?.sourceUrl && (
                        <Image
                          src={product.image.sourceUrl}
                          alt={product.name}
                          width={500}
                          height={500}
                          sizes="(max-width: 768px) 100vw, 33vw"
                          style={{ objectFit: 'contain' }}
                          className="w-full h-auto aspect-square transition-transform duration-300 ease-in-out group-hover:scale-105"
                        />
                      )}
                    </div>

                    {/* .featuredCardContent replaced */}
                    <div className="px-[0.4rem] flex-grow flex flex-col justify-between">
                      {/* .featuredProductName replaced */}
                      <h3 className="text-[1.5rem] font-semibold leading-[1.1] my-2 min-h-[3em]">{product.name}</h3>
                      
                      {typeof product.averageRating === 'number' ? (
                        <StarRating rating={product.averageRating} count={product.reviewCount || 0} />
                      ) : (
                        <div className="flex justify-center items-center gap-[2px] text-black">
                            {[...Array(5)].map((_, i) => <span key={`empty-${i}`} className="text-[1.1rem]">☆</span>)}
                        </div>
                      )}

                      {/* .featuredPriceContainer replaced */}
                      <div className="flex justify-center items-baseline gap-2 my-[0.5rem] mb-4 h-9">
                          {product.onSale && product.salePrice ? (
                              <>
                                  {/* .featuredRegularPriceStriked replaced */}
                                  <span className="text-[1.2rem] font-semibold text-[#070707] line-through" dangerouslySetInnerHTML={{ __html: product.regularPrice || '' }} />
                                  {/* .featuredSalePrice replaced */}
                                  <span className="text-[1.5rem] font-bold text-[#ff0000]" dangerouslySetInnerHTML={{ __html: product.salePrice }} />
                              </>
                          ) : (
                              // .featuredProductPrice replaced
                              <div className="text-[1.5rem] font-bold my-[0.5rem] mb-4" dangerouslySetInnerHTML={{ __html: product.price || '' }} />
                          )}
                      </div>
                    </div>
                  </Link>
                  <AddToCartButton product={product} />
                </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}