// app/products/page.tsx

import { gql } from '@apollo/client';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getClient } from '../../lib/apollo-rsc-client';
import ProductFilters from './ProductFilters';
import PaginationControls from './PaginationControls';
import ProductsGrid from '@/components/ProductsGrid';
import Breadcrumbs from '@/components/Breadcrumbs';

const PRODUCTS_PER_PAGE = 12;

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

export async function generateMetadata({ searchParams }: { 
  searchParams: { [key: string]: string | string[] | undefined } 
}): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;
  const categorySlug = typeof resolvedSearchParams.category === 'string' ? resolvedSearchParams.category : undefined;
  const isPaged = !!(resolvedSearchParams.after || resolvedSearchParams.before);
  let title = "Shop All Products | GoBike Australia";
  let description = "Explore our curated selection of high-quality bikes, spare parts, and accessories. From electric childs motorbikes to balancing bikes, find it all at GoBike.";
  let canonicalUrl = '/products';

  if (categorySlug) {
    const categoryName = categorySlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    title = `Shop ${categoryName} | GoBike Australia`;
    description = `Discover our collection of ${categoryName}. Top quality and performance guaranteed. Shop genuine australian electric bikes parts and gear.`;
    canonicalUrl = `/products?category=${categorySlug}`;
  }

  if (isPaged) {
    title = `${title} - Page 2+`;
  }

  if (typeof resolvedSearchParams.after === 'string') {
     canonicalUrl += (categorySlug ? `&after=${resolvedSearchParams.after}` : `?after=${resolvedSearchParams.after}`);
  }

  return {
    title,
    description,
    keywords: [
      'childrens electric bike',
      'australia electric bike',
      'electric bikes for 10 year olds',
      'childrens electric dirt bike',
      'balancing bikes',
      'electric cycles australia',
      categorySlug ? `${categorySlug} australia` : 'kids ebikes'
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: title,
      description: description,
      url: `https://gobike.au${canonicalUrl}`,
      siteName: 'GoBike Australia',
      images: [
        {
          url: 'https://gobikes.au/wp-content/uploads/2025/11/gobike-12-safety-features-for-toddlers.jpg',
          width: 1200,
          height: 857,
          alt: 'GoBike Australia Products Collection',
        },
      ],
      locale: 'en_AU',
      type: 'website',
    },
  };
}

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
      context: { fetchOptions: { next: { revalidate: 3600 } } },
    });
    
    if (!data) return { products: [], categories: [], pageInfo: { hasNextPage: false, hasPreviousPage: false, startCursor: null, endCursor: null } };
    
    return {
        products: data.products?.nodes || [],
        categories: data.productCategories?.nodes || [],
        pageInfo: data.products?.pageInfo || { hasNextPage: false, hasPreviousPage: false, startCursor: null, endCursor: null },
    };
  } catch (error) {
    console.error("Error fetching products/categories:", error);
    return { products: [], categories: [], pageInfo: { hasNextPage: false, hasPreviousPage: false, startCursor: null, endCursor: null } };
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
    'description': `Browse our collection of ${currentCategoryName} including balancing bikes and electric cycles in Australia.`,
    'numberOfItems': products.length,
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
      
      <div className="max-w-[1300px] mx-auto px-1.5 font-sans mb-12">
        {/* Header (Original UI) */}
        <header className="text-center mb-12 bg-gray-50 rounded-lg p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">{currentCategoryName}</h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">Explore our curated selection of high-quality products. Find exactly what you are looking for.</p>
        </header>
        
        <ProductFilters categories={categories} />
        
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

        <section className="bg-white border-t border-gray-100 pt-16 pb-12 mt-16 mb-8 p-4">
            <div className="max-w-[1100px] mx-auto text-gray-700 leading-relaxed">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">Your One-Stop Shop for Kids Electric Bikes & Parts</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <p className="mb-4">
                            At GoBike, we are more than just a bike shop. We are your dedicated partner in providing the best <strong>electric cycles Australia</strong> has to offer. Whether you are looking for a starter <strong>balance bike electric</strong> model for your 3-year-old or a powerful <strong>childrens electric dirt bike</strong> for your pre-teen, our diverse product range covers it all.
                        </p>
                    </div>
                    <div>
                        <p className="mb-4">
                            We stock a comprehensive range of genuine spare parts and apparel to keep your <strong>electric childs motorbike</strong> running smoothly and your rider looking the part. From batteries to helmets, shop with confidence knowing you are getting quality <strong>australian electric bikes</strong> products backed by local support.
                        </p>
                    </div>
                </div>
            </div>
        </section>

        {/* Internal Links (Original UI) */}
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