// app/apparel/page.tsx

import { gql } from '@apollo/client';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { getClient } from '../../lib/apollo-rsc-client';
import ProductCard from '@/components/ProductCard';
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
  const title = "Shop GoBike Kids T-Shirts | Premium Riding Apparel Australia";
  const description = "Explore the official GoBike apparel collection. Comfortable, durable, and stylish T-shirts for kids who love to ride. Shop premium cotton riding gear online!";
  
  return {
    title,
    description,
    alternates: {
      canonical: '/apparel',
    },
    openGraph: {
      title: title,
      description: description,
      url: 'https://gobike.au/apparel',
      siteName: 'GoBike Australia',
      images: [
        {
          // TODO: Replace with an actual T-shirt category image
          url: 'https://gobikes.au/wp-content/uploads/2025/11/gobike-apparel-collection.jpg', 
          width: 1200,
          height: 857,
          alt: 'Kid wearing GoBike official t-shirt smiling',
        },
      ],
      locale: 'en_AU',
      type: 'website',
    },
  };
}


// --- Data Fetching Function ---
async function getApparelProducts(
    first: number | null,
    after: string | null,
    last: number | null,
    before: string | null
) {
  try {
    const { data } = await getClient().query<QueryData>({
      query: gql`
        query GetApparelCursor($first: Int, $after: String, $last: Int, $before: String) {
          products(
            where: { category: "apparel" }, 
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
        console.error("No apparel data returned from GraphQL query.");
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
    console.error("Error in getApparelProducts:", error);
    return {
      products: [],
      pageInfo: { hasNextPage: false, hasPreviousPage: false, startCursor: null, endCursor: null },
    };
  }
}

// --- Page Component ---
export default async function ApparelPage({ searchParams }: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const resolvedSearchParams = await searchParams;
  const after = typeof resolvedSearchParams.after === 'string' ? resolvedSearchParams.after : null;
  const before = typeof resolvedSearchParams.before === 'string' ? resolvedSearchParams.before : null;

  const { products, pageInfo } = await getApparelProducts(
    before ? null : PRODUCTS_PER_PAGE,
    after,
    before ? PRODUCTS_PER_PAGE : null,
    before
  );

 // --- Schema Markup / Structured Data Updated for Apparel ---
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'name': 'GoBike Kids Apparel & T-Shirts',
    'description': 'Browse our collection of premium cotton t-shirts and apparel for kids.',
    'itemListElement': products.map((product, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'item': {
        '@type': 'Product',
        'name': product.name,
        'url': `https://gobike.au/apparel/${product.slug}`,
        'image': product.image?.sourceUrl,
        'description': `Buy ${product.name}. High-quality, comfortable GoBike branded apparel for kids.`,
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
          'url': `https://gobike.au/apparel/${product.slug}`
        }
      }
    }))
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumbs pageTitle="GoBike T-Shirts & Apparel" />
      <div className="max-w-[1300px] mx-auto px-1.5 font-sans">
        <header className="flex flex-col md:flex-row items-center gap-6 md:gap-12 mb-8 md:mb-12 bg-gray-50 rounded-lg md:rounded-xl p-4 md:p-12">
          <div className="flex-1 text-center md:text-left w-full">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-3 md:mb-4 leading-tight">
              Ride in Style with Official GoBike T-Shirts
            </h1>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto md:mx-0">
              Complete the look! Our premium cotton T-shirts are designed for comfort, durability, and cool kids who love their electric bikes. Wear the adventure.
            </p>
          </div>
          <div className="flex-1 w-full max-w-[580px]">
              <Image 
                  src="https://gobikes.au/wp-content/uploads/2025/09/Gobike-kids-electric-bike-ebike-for-kids-scaled.webp"
                  alt="Kid wearing GoBike branded t-shirt"
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
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 text-xl py-10">No apparel found.</p>
          )}
          
          <div className="mt-10 flex justify-center">
            <PaginationControls pageInfo={pageInfo} basePath="/apparel" />
          </div>
        </main>

        {/* Why Choose Us Section */}
        <section className="flex flex-col md:flex-row items-center gap-8 md:gap-16 bg-white border border-gray-100 rounded-lg md:rounded-xl p-4 py-8 md:p-10 shadow-sm mb-12 md:mb-16">
          <div className="w-full md:w-1/2 flex justify-center">
               <Image 
                  src="https://gobikes.au/wp-content/uploads/2025/08/Gobike-kids-electric-bike-ebike-for-kids-4-scaled-1.webp"
                  alt="Premium fabric quality of GoBike t-shirts"
                  width={500}
                  height={500}
                  className="w-full max-w-[450px] h-auto object-contain rounded-lg"
              />
          </div>
          <div className="w-full md:w-1/2">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Designed for Comfort, Built for Style.
              </h2>
              <p className="text-base text-gray-600 mb-6 leading-relaxed">
                GoBike apparel isn&apos;t just merchandise; it&apos;s quality clothing made for active kids. Soft, breathable, and ready for any outdoor adventure.
              </p>
              <ul className="space-y-3 mb-8 text-gray-700 text-sm md:text-base list-disc list-inside marker:text-green-600">
                  <li><strong>Premium Cotton Blend:</strong> Soft on the skin, perfect for all-day wear while riding or playing.</li>
                  <li><strong>Durable Prints:</strong> High-quality logos and designs that withstand wash after wash.</li>
                  <li><strong>Breathable Fit:</strong> Keeps your child cool and comfortable during active play.</li>
                  <li><strong>Machine Washable:</strong> Easy to clean after a muddy day on the tracks.</li>
              </ul>
               <Link 
                href="/about" 
                className="inline-block bg-gray-900 text-white font-semibold py-3 px-8 rounded-md hover:bg-gray-700 transition-colors w-full md:w-auto text-center"
               >
                About Our Brand
               </Link>
          </div>
        </section>

        <section className="text-center bg-gray-50 rounded-xl p-8 md:p-12 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Wear Your Passion
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
            At GoBike, we believe riding is a lifestyle. Our exclusive T-shirt collection allows young riders to show off their passion for electric bikes even when they are off the track. Join the GoBike family and gear up with the coolest apparel in Australia.
          </p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 mt-8">
            <Link 
              href="/bikes" 
              className="px-8 py-3 bg-white text-gray-800 font-bold rounded-full border border-gray-200 shadow-sm hover:shadow-lg hover:border-blue-600 hover:text-blue-600 hover:-translate-y-0.5 transition-all duration-300"
            >
              Shop Electric Bikes
            </Link>
            <Link 
              href="/spare-parts" 
              className="px-8 py-3 bg-white text-gray-800 font-bold rounded-full border border-gray-200 shadow-sm hover:shadow-lg hover:border-blue-600 hover:text-blue-600 hover:-translate-y-0.5 transition-all duration-300"
            >
              Shop Spare Parts
            </Link>
            <Link 
              href="/contact" 
              className="px-8 py-3 bg-white text-gray-800 font-bold rounded-full border border-gray-200 shadow-sm hover:shadow-lg hover:border-blue-600 hover:text-blue-600 hover:-translate-y-0.5 transition-all duration-300"
            >
              Contact Support
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}