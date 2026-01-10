// app/spare-parts/page.tsx

import { gql } from '@apollo/client';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { getClient } from '../../lib/apollo-rsc-client';
// import styles from './SparePartsPage.module.css'; // CSS Module সরানো হয়েছে
import ProductCard from '../products/ProductCard';
import PaginationControls from '../products/PaginationControls';
import Breadcrumbs from '../../components/Breadcrumbs'; 

const PRODUCTS_PER_PAGE = 12;

// --- Interfaces ---
interface Product {
  id: string;
  databaseId: number;
  name: string;
  slug: string;
  image?: { sourceUrl: string };
  price?: string;
  onSale: boolean;
  salePrice?: string;
  regularPrice?: string;
  averageRating?: number;
  reviewCount?: number;
}
interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
}
interface QueryData {
  products: {
    nodes: Product[];
    pageInfo: PageInfo;
  } | null;
}
// --- SEO: Dynamic Metadata Function ---
export async function generateMetadata(): Promise<Metadata> {
  const title = "Genuine Spare Parts & Accessories";
  const description = "Keep the adventure going! Find all genuine GoBike replacement parts, from batteries and chargers to wheels and grips, to maintain and customize your kids electric bike.";
  
  return {
    title,
    description,
    alternates: {
      canonical: '/spare-parts',
    },
      openGraph: {
      title: title,
      description: description,
      url: 'https://gobike.au/spare-parts',
      siteName: 'GoBike Australia',
      images: [
        {
          url: 'https://gobikes.au/wp-content/uploads/2025/11/gobike-12-safety-features-for-toddlers.jpg', // এই পেজের প্রধান ছবি
          width: 1200,
          height: 857,
          alt: 'A collection of genuine GoBike spare parts and accessories.',
        },
      ],
      locale: 'en_AU',
      type: 'website',
    },
  };
}

// --- Data Fetching Function ---
async function getSpareParts(
    first: number | null,
    after: string | null,
    last: number | null,
    before: string | null
) {
  try {
    // --- সমাধান: getClient() এখন সঠিকভাবে কাজ করবে ---
    const { data } = await getClient().query<QueryData>({
      query: gql`
        query GetSparePartsCursor($first: Int, $after: String, $last: Int, $before: String) {
          products(
            where: { category: "spare-parts" },
            first: $first, after: $after, last: $last, before: $before
          ) {
            nodes {
              id
              databaseId
              name
              slug
              image { sourceUrl }
              ... on SimpleProduct { price(format: FORMATTED) regularPrice(format: FORMATTED) salePrice(format: FORMATTED) }
              ... on VariableProduct { price(format: FORMATTED) regularPrice(format: FORMATTED) salePrice(format: FORMATTED) }
              onSale
              averageRating
              reviewCount
            }
            pageInfo { hasNextPage, hasPreviousPage, startCursor, endCursor }
          }
        }
      `,
      variables: { first, after, last, before },
      context: { fetchOptions: { next: { revalidate: 50000 } } },
    });
    if (!data || !data.products) {
        console.error("No spare parts data returned from GraphQL query.");
        return {
            products: [],
            pageInfo: { hasNextPage: false, hasPreviousPage: false, startCursor: null, endCursor: null },
        };
    }
    return {
      products: data.products.nodes,
      pageInfo: data.products.pageInfo,
    };
  } catch (error) {
    console.error("Error in getSpareParts:", error);
    return {
      products: [],
      pageInfo: { hasNextPage: false, hasPreviousPage: false, startCursor: null, endCursor: null },
    };
  }
}

// --- Page Component ---
export default async function SparePartsPage({ searchParams }: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const resolvedSearchParams = await searchParams;
  const after = typeof resolvedSearchParams.after === 'string' ? resolvedSearchParams.after : null;
  const before = typeof resolvedSearchParams.before === 'string' ? resolvedSearchParams.before : null;

  const { products, pageInfo } = await getSpareParts(
    before ? null : PRODUCTS_PER_PAGE,
    after,
    before ? PRODUCTS_PER_PAGE : null,
    before
  );

 // Schema Markup / Structured Data তৈরি করা হয়েছে
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'name': 'GoBike Spare Parts & Accessories',
    'description': 'Find genuine spare parts and accessories for GoBike kids electric bikes.',
    'itemListElement': products.map((product, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'item': {
        '@type': 'Product',
        'name': product.name,
        'url': `https://gobike.au/product/${product.slug}`,
        'image': product.image?.sourceUrl,
        'description': `Genuine GoBike spare part: ${product.name}. Ensure perfect fit and performance.`,
        'sku': product.databaseId.toString(),
        'brand': {
          '@type': 'Brand',
          'name': 'GoBike'
        },
        'offers': {
          '@type': 'Offer',
          'priceCurrency': 'AUD',
          'price': product.salePrice 
            ? product.salePrice.replace(/[^0-9.]+/g, "") 
            : product.regularPrice?.replace(/[^0-9.]+/g, ""),
          'availability': 'https://schema.org/InStock',
          'url': `https://gobike.au/product/${product.slug}`
        }
      }
    }))
  };

  return (
    <div>
      {/* JSON-LD স্ক্রিপ্টটি পেজে যোগ করা হয়েছে */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumbs pageTitle="Spare Parts" />
      
      {/* Container with Tailwind match Bikes Page */}
      <div className="max-w-[1300px] mx-auto px-1.5 font-sans">
        
        {/* Header / Hero Section */}
        <header className="flex flex-col md:flex-row items-center gap-6 md:gap-12 mb-8 md:mb-12 bg-gray-50 rounded-lg md:rounded-xl p-4 md:p-12">
          <div className="flex-1 text-center md:text-left w-full">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-3 md:mb-4 leading-tight">
              Genuine GoBike Spare Parts & Accessories
            </h1>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto md:mx-0">
              Keep the adventure going! Find all the genuine replacement parts and cool accessories you need to maintain and customize your GoBike.
            </p>
          </div>
          <div className="flex-1 w-full max-w-[580px]">
              <Image 
                  src="https://gobikes.au/wp-content/uploads/2025/02/Electric-Balance-Bike-Electric-bike-Balance-Bike-scaled-1.webp"
                  alt="GoBike spare parts and accessories"
                  width={600}
                  height={600}
                  priority={true}
                  className="w-full h-auto object-cover rounded-lg shadow-lg hover:scale-105 transition-transform duration-300"
              />
          </div>
        </header>

        {/* Products Grid */}
        <main className="mb-16">
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {products.map((product: Product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 text-xl py-10">No spare parts found.</p>
          )}
          
          <div className="mt-10 flex justify-center">
            <PaginationControls pageInfo={pageInfo} basePath="/spare-parts" />
          </div>
        </main>

        {/* Why Choose Us Section */}
        <section className="flex flex-col md:flex-row items-center gap-8 md:gap-16 bg-white border border-gray-100 rounded-lg md:rounded-xl p-4 py-8 md:p-10 shadow-sm mb-12 md:mb-16">
          <div className="w-full md:w-1/2 flex justify-center">
               <Image 
                  src="https://gobikes.au/wp-content/uploads/2025/08/Gobike-kids-electric-bike-ebike-for-kids-1-scaled-1.webp"
                  alt="GoBike genuine parts quality"
                  width={500}
                  height={500}
                  className="w-full max-w-[450px] h-auto object-contain rounded-lg"
              />
          </div>
          <div className="w-full md:w-1/2">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Why Choose Genuine GoBike Parts?
              </h2>
              <p className="text-base text-gray-600 mb-6 leading-relaxed">
                Do not settle for less. Our genuine spare parts are manufactured to the same high standards as our bikes, ensuring perfect fit, maximum safety, and peak performance.
              </p>
              <ul className="space-y-3 mb-8 text-gray-700 text-sm md:text-base list-disc list-inside marker:text-green-600">
                  <li><strong>Perfect Fit Guarantee:</strong> Designed specifically for your GoBike model.</li>
                  <li><strong>Uncompromised Safety:</strong> Built with the same quality materials for total peace of mind.</li>
                  <li><strong>Peak Performance:</strong> Restore your bike to its original performance and glory.</li>
                  <li><strong>Easy Installation:</strong> Get back to riding faster with parts that are easy to install.</li>
              </ul>
               <Link 
                href="/bikes" 
                className="inline-block bg-gray-900 text-white font-semibold py-3 px-8 rounded-md hover:bg-gray-700 transition-colors w-full md:w-auto text-center"
               >
                Shop All Bikes
               </Link>
          </div>
        </section>

        {/* SEO Bottom Section */}
        <section className="text-center bg-gray-50 rounded-xl p-8 md:p-12 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Your Journey to Adventure Starts Here
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
            At GoBike, we believe in the power of outdoor play. Our electric bikes are the perfect tool to get your kids off screens and into the great outdoors, building confidence and coordination along the way. We are a proud Aussie brand, committed to providing the best quality and service.
          </p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 mt-8">
            <Link 
              href="/contact" 
              className="px-8 py-3 bg-white text-gray-800 font-bold rounded-full border border-gray-200 shadow-sm hover:shadow-lg hover:border-blue-600 hover:text-blue-600 hover:-translate-y-0.5 transition-all duration-300"
            >
              Contact Our Team
            </Link>
            <Link 
              href="/products" 
              className="px-8 py-3 bg-white text-gray-800 font-bold rounded-full border border-gray-200 shadow-sm hover:shadow-lg hover:border-blue-600 hover:text-blue-600 hover:-translate-y-0.5 transition-all duration-300"
            >
              Shop All Products
            </Link>
            <Link 
              href="/faq" 
              className="px-8 py-3 bg-white text-gray-800 font-bold rounded-full border border-gray-200 shadow-sm hover:shadow-lg hover:border-blue-600 hover:text-blue-600 hover:-translate-y-0.5 transition-all duration-300"
            >
              Find Answers (FAQ)
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}