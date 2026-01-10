// app/products/page.tsx

import { gql } from '@apollo/client';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getClient } from '../../lib/apollo-rsc-client';
// import styles from './products.module.css'; // CSS Module সরানো হয়েছে
import ProductFilters from './ProductFilters';
import PaginationControls from './PaginationControls';
import ProductsGrid from './ProductsGrid';
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
interface Category {
  id: string;
  name: string;
  slug: string;
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
  productCategories: {
    nodes: Category[];
  } | null;
}
// --- SEO: Dynamic Metadata Function ---
export async function generateMetadata({ searchParams }: { 
  searchParams: { [key: string]: string | string[] | undefined } 
}): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;
  const categorySlug = resolvedSearchParams.category as string | undefined;

  let title = "Shop All Products | GoBike Australia";
  let description = "Explore our curated selection of high-quality bikes, spare parts, and accessories. Find exactly what you are looking for at GoBike.";
  let canonicalUrl = '/products';

  if (categorySlug) {
    const categoryName = categorySlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    title = `Shop ${categoryName} | GoBike Australia`;
    description = `Discover our collection of ${categoryName}. Top quality and performance guaranteed. Shop now at GoBike Australia.`;
    canonicalUrl = `/products?category=${categorySlug}`;
  }
  
  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: title,
      description: description,
      url: canonicalUrl,
      siteName: 'GoBike Australia',
      images: [
        {
          url: 'https://gobikes.au/wp-content/uploads/2025/11/gobike-12-safety-features-for-toddlers.jpg',
          width: 1200,
          height: 857,
          alt: 'GoBike Australia Products',
        },
      ],
      locale: 'en_AU',
      type: 'website',
    },
  };
}

// --- Data Fetching Function ---
async function getProductsAndCategories(
    category: string | null,
    first: number | null,
    after: string | null,
    last: number | null,
    before: string | null
) {
  try {
    const { data } = await getClient().query<QueryData>({
      query: gql`
        query GetProductsCursor($category: String, $first: Int, $after: String, $last: Int, $before: String) {
          products(where: { category: $category }, first: $first, after: $after, last: $last, before: $before) {
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
          productCategories(first: 100) { nodes { id, name, slug } }
        }
      `,
      variables: { category, first, after, last, before },
      context: { fetchOptions: { next: { revalidate: 50000 } } },
    });
    if (!data) {
        console.error("No data returned from GraphQL query.");
        return {
            products: [],
            categories: [],
            pageInfo: { hasNextPage: false, hasPreviousPage: false, startCursor: null, endCursor: null },
        };
    }
    return {
        products: data.products?.nodes || [],
        categories: data.productCategories?.nodes || [],
        pageInfo: data.products?.pageInfo || { hasNextPage: false, hasPreviousPage: false, startCursor: null, endCursor: null },
    };
  } catch (error) {
    console.error("Error fetching products/categories:", error);
    return {
        products: [], categories: [],
        pageInfo: { hasNextPage: false, hasPreviousPage: false, startCursor: null, endCursor: null },
    };
  }
}

// --- Page Component ---
export default async function ProductsPage({ searchParams }: {
  searchParams: { [key:string]: string | string[] | undefined };
}) {
  const resolvedSearchParams = await searchParams;
  const category = typeof resolvedSearchParams.category === 'string' ? resolvedSearchParams.category : null;
  const after = typeof resolvedSearchParams.after === 'string' ? resolvedSearchParams.after : null;
  const before = typeof resolvedSearchParams.before === 'string' ? resolvedSearchParams.before : null;

  const { products, categories, pageInfo } = await getProductsAndCategories(
    category,
    before ? null : PRODUCTS_PER_PAGE,
    after,
    before ? PRODUCTS_PER_PAGE : null,
    before
  );

  const currentCategoryName = categories.find((c: Category) => c.slug === category)?.name || "All Products";

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'name': `GoBike ${currentCategoryName}`,
    'description': `Browse our collection of ${currentCategoryName}.`,
    'itemListElement': products.map((product, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'item': {
        '@type': 'Product',
        'name': product.name,
        'url': `https://gobike.au/product/${product.slug}`,
        'image': product.image?.sourceUrl,
        'description': `Genuine GoBike product: ${product.name}.`,
        'sku': product.databaseId.toString(),
        'brand': { '@type': 'Brand', 'name': 'GoBike' },
        'offers': {
          '@type': 'Offer',
          'priceCurrency': 'AUD',
          'price': product.salePrice ? product.salePrice.replace(/[^0-9.]+/g, "") : product.regularPrice?.replace(/[^0-9.]+/g, ""),
          'availability': 'https://schema.org/InStock',
          'url': `https://gobike.au/product/${product.slug}`
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

      <Breadcrumbs pageTitle={currentCategoryName} />
      
      {/* .pageWrapper replaced */}
      <div className="max-w-[1300px] mx-auto px-1.5 font-sans mb-12">
        {/* .header replaced */}
        <header className="text-center mb-12 bg-gray-50 rounded-lg p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">{currentCategoryName}</h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">Explore our curated selection of high-quality products. Find exactly what you are looking for.</p>
        </header>
        
        <ProductFilters categories={categories} />
        
        {/* .mainContent replaced */}
        <main className="mb-16">
          {products.length > 0 ? (
            <ProductsGrid products={products} />
          ) : (
            <p className="text-center text-gray-500 text-xl py-10">No products found in this category.</p>
          )}
        </main>
        
        <div className="mt-10 flex justify-center">
            <PaginationControls pageInfo={pageInfo} basePath="/products" />
        </div>

        {/* .internalLinks replaced */}
        <div className="flex justify-center gap-4 flex-wrap mt-12 pb-8 border-t border-gray-100 pt-8">
            <Link 
                href="/contact" 
                className="inline-block px-6 py-3 bg-gray-50 text-gray-800 border border-gray-200 rounded-full font-medium transition-all duration-200 hover:bg-black hover:text-white hover:border-black"
            >
                Contact Our Team
            </Link>
            <Link 
                href="/bikes" 
                className="inline-block px-6 py-3 bg-gray-50 text-gray-800 border border-gray-200 rounded-full font-medium transition-all duration-200 hover:bg-black hover:text-white hover:border-black"
            >
                Shop All Bikes
            </Link>
            <Link 
                href="/about" 
                className="inline-block px-6 py-3 bg-gray-50 text-gray-800 border border-gray-200 rounded-full font-medium transition-all duration-200 hover:bg-black hover:text-white hover:border-black"
            >
                About Us
            </Link>
          </div>
      </div>
    </div>
  );
}