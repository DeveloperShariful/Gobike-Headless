// app/sitemap.ts

import { MetadataRoute } from 'next';
import { gql } from '@apollo/client';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter'; 
import { getClient } from '../lib/apollo-rsc-client';

const URL = 'https://gobike.au';
const GET_ALL_PRODUCTS_FOR_SITEMAP = gql`
  query GetAllProductsForSitemap {
    products(first: 10000) {
      nodes {
        slug
        ... on SimpleProduct {
          date
          modified
          image { sourceUrl }
          galleryImages { nodes { sourceUrl } }
        }
        ... on VariableProduct {
          date
          modified
          image { sourceUrl }
          galleryImages { nodes { sourceUrl } }
        }
        ... on ExternalProduct {
          date
          modified
          image { sourceUrl }
          galleryImages { nodes { sourceUrl } }
        }
        ... on GroupProduct {
          date
          modified
          image { sourceUrl }
          galleryImages { nodes { sourceUrl } }
        }
      }
    }
  }
`;

interface ImageNode { sourceUrl: string; }
interface ProductNode {
  slug: string;
  date?: string;
  modified?: string;
  image?: ImageNode;
  galleryImages?: { nodes: ImageNode[] };
}
interface SitemapQueryData { products: { nodes: ProductNode[]; }; }
function getAllBlogPosts() {
  try {
    const blogDir = 'blogs';
    const fullPath = path.join(process.cwd(), blogDir);
    
    if (!fs.existsSync(fullPath)) return [];

    const files = fs.readdirSync(fullPath);
    
    return files.map(filename => {
      const slug = filename.replace(/\.(md|mdx)$/, '');
      const filePath = path.join(fullPath, filename);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const { data: frontmatter } = matter(fileContent);
      const stats = fs.statSync(filePath);
      
      return { 
        slug,lastModified: stats.mtime, image: frontmatter.cover_image || null 
      };
    });
  } catch (error) {
    console.error("Sitemap: Could not read blog files.", error);
    return []; 
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${URL}/`, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0, },
    { url: `${URL}/about`, lastModified: new Date(), changeFrequency: 'monthly',priority: 0.7, },
    { url: `${URL}/bikes`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${URL}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${URL}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${URL}/faq`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${URL}/privacy-policy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${URL}/products`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${URL}/refund-and-returns-policy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${URL}/spare-parts`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${URL}/terms-and-conditions`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ];

  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const { data } = await getClient().query<SitemapQueryData>({
      query: GET_ALL_PRODUCTS_FOR_SITEMAP,
      context: { fetchOptions: { next: { revalidate: 3600 } } }
    });

    if (data && data.products && data.products.nodes) {
      productRoutes = data.products.nodes
        .filter(product => product.slug) 
        .map(product => {
          const dateString = product.modified || product.date;
          const lastModifiedDate = dateString ? new Date(dateString) : new Date();
          const productImages: string[] = [];
          if (product.image?.sourceUrl) productImages.push(product.image.sourceUrl);
          if (product.galleryImages?.nodes) {
            product.galleryImages.nodes.forEach(img => {
              if (img.sourceUrl) productImages.push(img.sourceUrl);
            });
          }

          return {
            url: `${URL}/product/${product.slug}`,
            lastModified: lastModifiedDate,
            changeFrequency: 'weekly',
            priority: 0.9,
            images: productImages, 
          };
      });
    }
  } catch (error) {
    console.error("Sitemap: Error fetching product data.", error);
  }

  const blogRoutes: MetadataRoute.Sitemap = getAllBlogPosts().map(post => {
    const images = post.image ? [post.image] : []; 
    return {
      url: `${URL}/blog/${post.slug}`,
      lastModified: post.lastModified,
      changeFrequency: 'weekly', 
      priority: 0.8, 
      images: images, 
    };
  });

  return [...staticRoutes, ...productRoutes, ...blogRoutes];
}