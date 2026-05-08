// app/electric-bike-parts/[categorySlug]/page.tsx

import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Metadata } from 'next';

// ★ আপডেট করা ইম্পোর্ট পাথগুলো ★
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
    cache: 'no-store', 
  });

  const json = await res.json();
  return {
    categoryInfo: json.data?.productCategory,
    filteredProducts: json.data?.products?.nodes || []
  };
}

export async function generateMetadata({ params }: { params: Promise<{ categorySlug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const data = await getCategoryData(resolvedParams.categorySlug);
  
  if (!data || !data.categoryInfo) return { title: 'Category Not Found | GoBike' };

  const categoryName = data.categoryInfo.name;
  const plainTextDesc = data.categoryInfo.description ? data.categoryInfo.description.replace(/<[^>]+>/g, '').substring(0, 160) : `Buy the best ${categoryName} for your kids electric bike at GoBike.`;

  return {
    title: `${categoryName} | Electric Bike Spare Parts | GoBike`,
    description: plainTextDesc,
  };
}

export default async function ElectricBikePartsCategoryPage({
  params,
}: {
  params: Promise<{ categorySlug: string }>; 
}) {
  const resolvedParams = await params; 
  const categorySlug = resolvedParams.categorySlug;

  const data = await getCategoryData(categorySlug);

  if (!data || !data.categoryInfo) notFound();

  const categoryName = data.categoryInfo.name;
  const categoryImage = data.categoryInfo.image;
  const products = data.filteredProducts; 
  
  const seoData = seoContentMap[categorySlug];

  return (
    <div className="w-full bg-[#f8f9fa]">
      
      {/* 1. ABOVE THE FOLD */}
      <div className="bg-white border-b border-gray-100">
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
      </div>

      {/* 2. PRODUCT GRID */}
      <div className="max-w-[1400px] mx-auto px-6 py-12 md:py-16">
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
      </div>

      {/* 3. SEO CONTENT (New Premium Design) */}
      <CategorySeoContent seoData={seoData} />

    </div>
  );
}