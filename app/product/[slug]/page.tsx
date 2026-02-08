// app/product/[slug]/page.tsx

import { gql } from '@apollo/client';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getClient } from '../../../lib/apollo-rsc-client';
import ProductClient from './_components/ProductClient';
import Breadcrumbs from '../../../components/Breadcrumbs';
import { productFaqMap } from '../productFaqs';
import { productVideoMap } from '../productVideos';
//import RelatedBlogs from './RelatedBlogs';

interface ReviewEdge {
  rating: number;
  node: { id: string; author: { node: { name: string; }; }; content: string; date: string; };
}
interface ImageNode { sourceUrl: string; }
interface Attribute { name: string; options: string[]; }
interface VariationAttribute { name: string; value: string; }
interface Variation {
  databaseId: number;
  price?: string;
  regularPrice?: string;
  salePrice?: string;
  stockStatus?: string;
  stockQuantity?: number;
  name: string;
  attributes: { nodes: VariationAttribute[]; };
}
interface Product {
  id: string; 
  databaseId: number; 
  slug: string; 
  name: string; 
  description: string; 
  shortDescription?: string;
  image?: ImageNode; 
  galleryImages: { nodes: ImageNode[] };
  price?: string; 
  salePrice?: string; 
  regularPrice?: string; 
  sku?: string; 
  stockStatus?: string;
  stockQuantity?: number;
  onSale: boolean;
  attributes: { nodes: Attribute[] }; 
  variations?: { nodes: Variation[] }; 
  averageRating: number; 
  reviewCount: number; 
  reviews: { edges: ReviewEdge[]; };
  related: { 
    nodes: { 
      id: string; 
      databaseId: number; 
      name: string; 
      slug: string; 
      image?: ImageNode;
      price?: string; 
      salePrice?: string; 
      regularPrice?: string; 
      onSale: boolean; 
    }[]; 
  };
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
}
interface QueryData { product: Product | null; }

const GET_PRODUCT_QUERY = gql`
  query GetProductBySlug($slug: ID!) {
    product(id: $slug, idType: SLUG) {
      id
      databaseId
      slug
      name
      description
      shortDescription
      image { sourceUrl }
      galleryImages { nodes { sourceUrl } }
      ... on SimpleProduct { 
        price(format: FORMATTED) regularPrice(format: FORMATTED) salePrice(format: FORMATTED) 
        onSale sku stockStatus stockQuantity attributes { nodes { name options } } 
        weight length width height 
      }
      ... on VariableProduct { 
        price(format: FORMATTED) regularPrice(format: FORMATTED) salePrice(format: FORMATTED) 
        onSale sku stockStatus stockQuantity attributes { nodes { name options } } 
        weight length width height 
        variations(first: 100) {
          nodes {
            databaseId price(format: FORMATTED) regularPrice(format: FORMATTED) salePrice(format: FORMATTED)
            stockStatus stockQuantity name attributes { nodes { name value } }
          }
        }
      }
      averageRating
      reviewCount
      reviews(first: 100) { edges { rating node { id author { node { name } } content date } } }
      related(first: 4) {
        nodes {
          id databaseId name slug image { sourceUrl } onSale averageRating reviewCount
          ... on SimpleProduct { price(format: FORMATTED) regularPrice(format: FORMATTED) salePrice(format: FORMATTED) }
          ... on VariableProduct { price(format: FORMATTED) regularPrice(format: FORMATTED) salePrice(format: FORMATTED) }
        }
      }
    }
  }
`;

async function getProductData(slug: string): Promise<Product | null> {
    try {
        const { data } = await getClient().query<QueryData>({ 
            query: GET_PRODUCT_QUERY, 
            variables: { slug }, 
            context: { fetchOptions: { next: { revalidate: 3600 } } } 
        });
        if (!data || !data.product) return null;
        return data.product;
    } catch (error) {
        console.error("Failed to fetch product:", error);
        return null;
    }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductData(slug);
  if (!product) return { title: 'Product Not Found' };

  const descriptionSource = product.shortDescription || product.description || '';
  const plainDescription = descriptionSource.replace(/<[^>]*>?/gm, '').substring(0, 160);
  const imageUrl = product.image?.sourceUrl || 'https://gobike.au/default-og.jpg';

  return {
    title: `${product.name} | GoBike Australia`,
    description: plainDescription,
    alternates: { canonical: `https://gobike.au/product/${slug}` },
    openGraph: {
      title: product.name,
      description: plainDescription,
      url: `https://gobike.au/product/${slug}`,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: product.name }],
      siteName: 'GoBike Australia',
      locale: 'en_AU',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: plainDescription,
      images: [imageUrl],
      creator: '@GoBikeAU',
    },
    other: {
      'geo.region': 'AU',
      'geo.placename': 'Australia',
    }
  };
}

export default async function SingleProductPage({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const product = await getProductData(slug); if (!product) { notFound(); }
  const getPriceAsNumber = (priceString: string | undefined | null): number | undefined => { if (!priceString) return undefined; return parseFloat(priceString.replace(/[^0-9.]/g, ''));};
  const currentPrice = getPriceAsNumber(product.salePrice) || getPriceAsNumber(product.regularPrice) || 0;
  const availability = product.stockStatus === 'IN_STOCK' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description?.replace(/<[^>]*>?/gm, '').substring(0, 5000),
    image: [product.image?.sourceUrl, ...(product.galleryImages.nodes.map(img => img.sourceUrl) || [])],
    sku: product.sku || product.databaseId.toString(),
    brand: { '@type': 'Brand', name: 'GoBike' },
    offers: {
      '@type': 'Offer',
      url: `https://gobike.au/product/${product.slug}`,
      priceCurrency: 'AUD',
      price: currentPrice,
      priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0], // Valid for 1 year
      itemCondition: 'https://schema.org/NewCondition',
      availability: availability,
      seller: { '@type': 'Organization', name: 'GoBike Australia' },
      shippingDetails: { 
        '@type': 'OfferShippingDetails',
        shippingRate: { '@type': 'MonetaryAmount', value: 0, currency: 'AUD' },
        shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'AU' },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 1, unitCode: 'd' },
          transitTime: { '@type': 'QuantitativeValue', minValue: 2, maxValue: 5, unitCode: 'd' }
        }
      },
      hasMerchantReturnPolicy: { 
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'AU',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 30,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/FreeReturn'
      }
    },
    aggregateRating: product.reviewCount > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: product.averageRating,
      reviewCount: product.reviewCount,
    } : undefined,
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://gobike.au' },
      { '@type': 'ListItem', position: 2, name: 'Bikes', item: 'https://gobike.au/bikes' },
      { '@type': 'ListItem', position: 3, name: product.name, item: `https://gobike.au/product/${product.slug}` }
    ]
  };

  const faqs = productFaqMap[product.slug] || productFaqMap['default'];
  const faqSchema = faqs && faqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer }
    }))
  } : null;

  const videoData = productVideoMap[product.slug];
  const videoSchema = videoData ? {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: videoData.title,
    description: videoData.description,
    thumbnailUrl: videoData.thumbnailUrl,
    uploadDate: videoData.uploadDate,
    contentUrl: `https://www.youtube.com/watch?v=${videoData.id}`,
    embedUrl: `https://www.youtube.com/embed/${videoData.id}`
  } : null;

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}
      {videoSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(videoSchema) }} />}

      <Breadcrumbs pageTitle={product.name} />
      <ProductClient product={product} />
      {/*<RelatedBlogs productName={product.name} />*/}
    </div>
  );
}