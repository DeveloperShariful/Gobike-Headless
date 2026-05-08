// app/electric-bike-parts/[categorySlug]/page.tsx

import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Metadata } from 'next';

import Breadcrumbs from '@/components/Breadcrumbs'; 
import ProductsGrid from '@/components/ProductsGrid'; 
import CategorySeoContent from './_components/CategorySeoContent'; 
import { seoContentMap } from './seoContent'; 

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_WORDPRESS_GRAPHQL_ENDPOINT || process.env.WORDPRESS_GRAPHQL_ENDPOINT || 'https://gobikes.au/graphql';

async function getCategoryData(slug: string) {
  const query = `
    query GetCategoryAndProducts($slug: ID!, $catString: String) {
      productCategory(id: $slug, idType: SLUG) {
        name
        description
        image { sourceUrl altText }
      }
      products(first: 20, where: { categoryIn: [$catString] }) {
        nodes {
          id
          databaseId
          name
          slug
          __typename
          averageRating
          reviewCount
          image { sourceUrl altText }
          ... on SimpleProduct { price regularPrice salePrice onSale }
          ... on VariableProduct { price regularPrice salePrice onSale }
        }
      }
    }
  `;

  const res = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables: { slug: slug, catString: slug } }),
    // ★★★ SEO UPDATE 1: Caching (ISR) - পেজ এখন রকেটের বেগে লোড হবে ★★★
    next: { revalidate: 3600 }, 
  });

  const json = await res.json();
  return {
    categoryInfo: json.data?.productCategory,
    filteredProducts: json.data?.products?.nodes || []
  };
}

// ★★★ ADVANCED METADATA GENERATION ★★★
export async function generateMetadata({ params }: { params: Promise<{ categorySlug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const categorySlug = resolvedParams.categorySlug;
  const data = await getCategoryData(categorySlug);
  
  if (!data || !data.categoryInfo) return { title: 'Category Not Found | GoBike' };

  const seoData = seoContentMap[categorySlug];
  const h1Title = seoData?.h1 || data.categoryInfo.name;
  const plainTextDesc = data.categoryInfo.description ? data.categoryInfo.description.replace(/<[^>]+>/g, '').substring(0, 160) : `Shop the best ${h1Title} for kids electric bikes at GoBike Australia.`;

  const canonicalUrl = `/electric-bike-parts/${categorySlug}`;
  const currentDate = new Date().toISOString(); 
  const ogImageUrl = data.categoryInfo.image?.sourceUrl || 'https://gobikes.au/wp-content/uploads/default-gobike-share.jpg';

  return {
    title: `${h1Title} | GoBike Australia`,
    description: plainTextDesc,
    keywords: seoData?.keywords || [], 
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: `${h1Title} | GoBike Australia`,
      description: plainTextDesc,
      url: `https://gobikes.au${canonicalUrl}`,
      siteName: 'GoBike Australia',
      images: [{ url: ogImageUrl }],
      locale: 'en_AU',
      type: 'website',
    },
    // ★★★ SEO UPDATE 2: Twitter Card - সোশ্যাল মিডিয়ায় শেয়ারের জন্য ★★★
    twitter: {
      card: 'summary_large_image',
      title: `${h1Title} | GoBike Australia`,
      description: plainTextDesc,
      images: [ogImageUrl],
    },
    other: {
      'article:modified_time': currentDate, 
      'og:updated_time': currentDate,       
      'last-modified': currentDate,
    }
  };
}


// --- MAIN PAGE COMPONENT ---
export default async function ElectricBikePartsCategoryPage({
  params,
}: {
  params: Promise<{ categorySlug: string }>; 
}) {
  const resolvedParams = await params; 
  const categorySlug = resolvedParams.categorySlug;

  const data = await getCategoryData(categorySlug);

  if (!data || !data.categoryInfo) notFound();

  const seoData = seoContentMap[categorySlug];
  const categoryName = seoData?.h1 || data.categoryInfo.name;
  const categoryImage = data.categoryInfo.image;
  const products = data.filteredProducts; 

  // ★★★ JSON-LD SCHEMA INJECTION ★★★
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://gobikes.au' },
      { '@type': 'ListItem', 'position': 2, 'name': 'Electric Bike Parts', 'item': 'https://gobikes.au/electric-bike-parts' },
      { '@type': 'ListItem', 'position': 3, 'name': categoryName, 'item': `https://gobikes.au/electric-bike-parts/${categorySlug}` }
    ]
  };

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    'name': categoryName,
    'description': `Browse our collection of ${categoryName}.`,
    'url': `https://gobikes.au/electric-bike-parts/${categorySlug}`,
    'dateModified': new Date().toISOString(),
    'mainEntity': {
      '@type': 'ItemList',
      'numberOfItems': products.length,
      'itemListElement': products.map((product: any, index: number) => ({
        '@type': 'ListItem',
        'position': index + 1,
        'item': {
          '@type': 'Product',
          'name': product.name,
          'url': `https://gobikes.au/product/${product.slug}`,
          'image': product.image?.sourceUrl,
          'sku': product.databaseId.toString(),
          'brand': { '@type': 'Brand', 'name': 'GoBike' },
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
            'price': product.salePrice ? product.salePrice.replace(/[^0-9.]+/g, "") : product.regularPrice?.replace(/[^0-9.]+/g, ""),
            'availability': 'https://schema.org/InStock',
            'url': `https://gobikes.au/product/${product.slug}`,
          }
        }
      }))
    }
  };

  // ★★★ SEO UPDATE 3: FAQ Schema (Rich Snippets এর জন্য) ★★★
  let faqSchema = null;
  if (seoData?.faqs && seoData.faqs.length > 0) {
    faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': seoData.faqs.map((faq: any) => ({
        '@type': 'Question',
        'name': faq.q,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': faq.a
        }
      }))
    };
  }

  // ★★★ SEO UPDATE 4: Semantic HTML (<main>, <header>, <section>) ★★★
  return (
    <main className="w-full bg-[#f8f9fa]">
      {/* Script Tags for Technical SEO */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />
      {faqSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      )}

      {/* 1. ABOVE THE FOLD (Header) */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-[1400px] mx-auto px-6 py-8 md:py-12">
          <Breadcrumbs pageTitle={categoryName} />
          
          <div className="flex flex-col md:flex-row items-center gap-8 mt-6">
            <div className={`flex-1 text-center md:text-left ${!categoryImage ? 'md:mx-auto md:text-center' : ''}`}>
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
                {categoryName}
              </h1>
              
              {seoData?.topIntro ? (
                <div 
                  className="text-lg text-gray-600 leading-relaxed max-w-3xl"
                  dangerouslySetInnerHTML={{ __html: seoData.topIntro }}
                />
              ) : (
                data.categoryInfo.description && (
                  <div 
                    className="text-lg text-gray-600 leading-relaxed max-w-3xl prose prose-p:mb-4"
                    dangerouslySetInnerHTML={{ __html: data.categoryInfo.description }}
                  />
                )
              )}
            </div>

            {categoryImage && (
              <div className="flex-1 w-full max-w-[500px] relative rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-gray-50 aspect-[4/3] md:aspect-auto md:h-[300px]">
                <Image 
                  src={categoryImage.sourceUrl} 
                  alt={categoryImage.altText || `${categoryName} for Electric Bikes`} 
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 500px"
                  priority
                />
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. PRODUCT GRID (Section) */}
      <section className="max-w-[1400px] mx-auto px-6 py-12 md:py-16">
        <div className="mb-10 flex items-center justify-between border-b border-gray-200 pb-4">
            <h2 className="text-2xl font-bold text-gray-900">Available {categoryName}</h2>
            <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-semibold">{products.length} Products</span>
        </div>

        {products.length > 0 ? (
          <ProductsGrid products={products} />
        ) : (
          <div className="bg-white p-16 rounded-2xl border border-gray-100 text-center shadow-sm">
             <p className="text-gray-500 text-xl font-medium">No products found in this category.</p>
          </div>
        )}
      </section>

      {/* 3. SEO CONTENT (Article / Section) */}
      <article>
        <CategorySeoContent seoData={seoData} />
      </article>

    </main>
  );
}