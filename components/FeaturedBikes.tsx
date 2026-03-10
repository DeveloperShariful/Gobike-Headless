// components/FeaturedBikes.tsx

'use client';

import { useState, useEffect } from 'react';
import { gql } from '@apollo/client';
import client from '../lib/apolloClient';
import ProductCard from '@/components/ProductCard'; 

interface ProductAttribute {
  name: string;
  options: string[];
}

interface Product {
  id: string;
  databaseId: number;
  name: string;
  slug: string;
  __typename?: string; 
  image?: { sourceUrl: string } | null;
  price?: string | null;
  averageRating?: number | null;
  reviewCount?: number | null;
  onSale: boolean;
  regularPrice?: string | null;
  salePrice?: string | null;
  attributes?: { nodes: ProductAttribute[] }; 
}

interface QueryData {
  products: {
    nodes: Product[];
  } | null;
}

const GET_FEATURED_BIKES_QUERY = gql`
  query GetFeaturedBikes {
    products(
      where: { 
        category: "bikes", 
        orderby: { field: NAME, order: ASC } 
      }, 
      first: 4 
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
        __typename
        ... on SimpleProduct { 
          price(format: FORMATTED)
          regularPrice(format: FORMATTED)
          salePrice(format: FORMATTED)
          attributes { nodes { name options } }
        }
        ... on VariableProduct { 
          price(format: FORMATTED)
          regularPrice(format: FORMATTED)
          salePrice(format: FORMATTED)
          attributes { nodes { name options } }
        }
      }
    }
  }
`;

export default function FeaturedBikes() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getFeaturedBikes() {
      try {
        const { data } = await client.query<QueryData>({
          query: GET_FEATURED_BIKES_QUERY,
          fetchPolicy: 'cache-first', 
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
            <div className="max-w-[1300px] mx-auto px-4">
                <div className="flex justify-center items-center py-10">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
                </div>
            </div>
        </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="w-full py-16 bg-white">
      <div className="max-w-[1500px] mx-auto px-2 md:px-6">
        
        <div className="text-center mb-12">
          <h2 className="text-[2rem] md:text-[2.5rem] font-extrabold mb-4 text-[#1a1a1a]">Explore Our Top Kids Electric Bikes</h2>
          <p className="text-[1rem] md:text-[1.1rem] text-[#555] max-w-[700px] mx-auto leading-[1.6]">
            Discover our best-selling Kids electric bike, engineered for safety, performance, and endless fun. 
            Each GoBike is built to grow with your child, making it the perfect choice for young Aussie adventurers.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product as any} />
          ))}
        </div>
        
      </div>
    </section>
  );
}