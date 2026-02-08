// app/cart/CartCrossSell.tsx

'use client'; 

import { useState, useEffect } from 'react';
import { gql } from '@apollo/client';
import client from '../../lib/apolloClient';
import ProductCard from '@/components/ProductCard';

// --- টাইপ ইন্টারফেস (অপরিবর্তিত) ---
interface Product {
  id: string;
  databaseId: number;
  name: string;
  slug: string;
  image?: { sourceUrl: string };
  price?: string;
  averageRating?: number;
  reviewCount?: number;
  onSale: boolean;
  regularPrice?: string;
  salePrice?: string;
}
interface QueryData {
  products: {
    nodes: Product[];
  } | null;
}
// --- GraphQL কোয়েরি (অপরিবর্তিত) ---
const GET_CROSS_SELL_PRODUCTS_QUERY = gql`
  query GetCrossSellProducts {
    products(where: { categoryIn: ["spare-parts"] }, first: 4) {
      nodes {
        id
        databaseId
        name
        slug
        image { sourceUrl }
        onSale
        ... on SimpleProduct { price(format: FORMATTED), regularPrice(format: FORMATTED), salePrice(format: FORMATTED) }
        ... on VariableProduct { price(format: FORMATTED), regularPrice(format: FORMATTED), salePrice(format: FORMATTED) }
        averageRating
        reviewCount
      }
    }
  }
`;

// --- মূল কম্পোনেন্ট (এখন এটি ক্লায়েন্ট কম্পোনেন্ট) ---
export default function CartCrossSell() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // --- কার্যকরী সমাধান: ডেটা এখন useEffect ব্যবহার করে ক্লায়েন্টে আনা হচ্ছে ---
  useEffect(() => {
    async function getCrossSellProducts() {
      try {
        const { data } = await client.query<QueryData>({
          query: GET_CROSS_SELL_PRODUCTS_QUERY,
        });
        setProducts(data?.products?.nodes || []);
      } catch (error) {
        console.error("Error fetching cross-sell products:", error);
      } finally {
        setLoading(false);
      }
    }
    getCrossSellProducts();
  }, []); 

  if (loading) {
    return (
        <section className="mt-16 pt-8 border-t border-gray-200">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">You Might Also Like</h2>
            <p style={{textAlign: 'center'}}>Loading products...</p>
        </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="mt-16 pt-8 border-t border-gray-200">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">You Might Also Like</h2>
      
      {/* Bikes/Spare Parts Page এর মতো রেসপন্সিভ গ্রিড */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}