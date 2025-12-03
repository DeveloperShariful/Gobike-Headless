//app/bikes/page.tsx (or app/apparel/page.tsx)
import { gql } from '@apollo/client';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';

// --- সমাধান: সঠিক ফাইল থেকে getClient import করা হচ্ছে ---
import { getClient } from '../../lib/apollo-rsc-client';

import styles from './ApparelPage.module.css';
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
  const title = "Shop GoBike Kids T-Shirts | Premium Riding Apparel Australia";
  const description = "Explore the official GoBike apparel collection. Comfortable, durable, and stylish T-shirts for kids who love to ride. Shop premium cotton riding gear online!";
  
  return {
    title,
    description,
    alternates: {
      canonical: '/apparel', // Changed from /bikes to /apparel assuming the route changed
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
        ...(product.reviewCount && product.reviewCount > 0 && {
          'aggregateRating': {
            '@type': 'AggregateRating',
            'ratingValue': product.averageRating || 5,
            'reviewCount': product.reviewCount
          }
        }),
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
      {/* --- JSON-LD Script --- */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumbs pageTitle="GoBike T-Shirts & Apparel" />
      <div className={styles.pageContainer}>
        
        <header className={styles.header}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>Ride in Style with Official GoBike T-Shirts</h1>
            <p className={styles.heroSubtitle}>
              Complete the look! Our premium cotton T-shirts are designed for comfort, durability, and cool kids who love their electric bikes. Wear the adventure.
            </p>
          </div>
          <div className={styles.heroImageContainer}>
              {/* TODO: Update src to an actual T-Shirt image URL */}
              <Image 
                  src="https://gobikes.au/wp-content/uploads/2025/09/Gobike-kids-electric-bike-ebike-for-kids-scaled.webp"
                  alt="Kid wearing GoBike branded t-shirt"
                  width={600}
                  height={600}
                  priority={true}
                  className={styles.heroImage}
              />
          </div>
        </header>

        <main className={styles.productsGridContainer}>
          {products.length > 0 ? (
            <div className={styles.grid}>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p>No apparel found.</p>
          )}
          <PaginationControls pageInfo={pageInfo} basePath="/apparel" />
        </main>

        <section className={styles.whyChooseUs}>
          <div className={styles.whyChooseUsImage}>
               {/* TODO: Update src to an actual T-Shirt detail image URL */}
               <Image 
                  src="https://gobikes.au/wp-content/uploads/2025/08/Gobike-kids-electric-bike-ebike-for-kids-4-scaled-1.webp"
                  alt="Premium fabric quality of GoBike t-shirts"
                  width={500}
                  height={500}
                  className={styles.sectionImage}
              />
          </div>
          <div className={styles.whyChooseUsContent}>
              <h2>Designed for Comfort, Built for Style.</h2>
              <p>GoBike apparel isn&apos;t just merchandise; it&apos;s quality clothing made for active kids. Soft, breathable, and ready for any outdoor adventure.</p>
              <ul>
                  <li><strong>Premium Cotton Blend:</strong> Soft on the skin, perfect for all-day wear while riding or playing.</li>
                  <li><strong>Durable Prints:</strong> High-quality logos and designs that withstand wash after wash.</li>
                  <li><strong>Breathable Fit:</strong> Keeps your child cool and comfortable during active play.</li>
                  <li><strong>Machine Washable:</strong> Easy to clean after a muddy day on the tracks.</li>
              </ul>
               <Link href="/about" className={styles.secondaryButton}>About Our Brand</Link>
          </div>
        </section>

        <section className={styles.seoBottomSection}>
          <h2>Wear Your Passion</h2>
          <p>
            At GoBike, we believe riding is a lifestyle. Our exclusive T-shirt collection allows young riders to show off their passion for electric bikes even when they are off the track. Join the GoBike family and gear up with the coolest apparel in Australia.
          </p>
          <div className={styles.internalLinks}>
            <Link href="/bikes" className={styles.internalLink}>Shop Electric Bikes</Link>
            <Link href="/spare-parts" className={styles.internalLink}>Shop Spare Parts</Link>
            <Link href="/contact" className={styles.internalLink}>Contact Support</Link>
          </div>
        </section>
      </div>
    </div>
  );
}