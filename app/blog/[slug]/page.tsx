// app/blog/[slug]/page.tsx

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import ReactMarkdown from 'react-markdown';
import Image from 'next/image';
import Link from 'next/link';
import Breadcrumbs from '../../../components/Breadcrumbs';
import type { Metadata } from 'next';

type Props = {
  params: { slug: string };
};

function getPostContent(slug: string) {
    const filePath = path.join('blogs', `${slug}.md`);
    if (!fs.existsSync(filePath)) {
        return null;
    }
    const markdownWithMeta = fs.readFileSync(filePath, 'utf-8');
    const { data: frontmatter, content } = matter(markdownWithMeta);
    return { frontmatter, content };
}

function getRelatedPosts(currentSlug: string) {
    const blogDir = path.join('blogs');
    const files = fs.readdirSync(blogDir);
    
    const posts = files
        .map(filename => {
            const slug = filename.replace(/\.(md|mdx)$/, '');
            const markdownWithMeta = fs.readFileSync(path.join(blogDir, filename), 'utf-8');
            const { data: frontmatter } = matter(markdownWithMeta);
            return { slug, frontmatter };
        })
        .filter(post => post.slug !== currentSlug) // বর্তমান পোস্ট বাদ দিয়ে
        .slice(0, 3); // সর্বোচ্চ ৩টি রিলেটেড পোস্ট

    return posts;
} 

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params; 
  const post = getPostContent(slug);

  if (!post) {
      return { title: 'Post Not Found' };
  }
  const { frontmatter } = post;

  return {
    title: `${frontmatter.title} | GoBike Blog`,
    description: frontmatter.excerpt,
    keywords: frontmatter.tags || ['kids electric bike', 'GoBike'], 
    alternates: {
      canonical: `/blog/${slug}`,
    },
    openGraph: {
      title: frontmatter.title,
      description: frontmatter.excerpt,
      url: `https://gobike.au/blog/${slug}`,
      siteName: 'GoBike Australia',
      images: [
        {
          url: frontmatter.cover_image || 'https://gobikes.au/wp-content/uploads/2025/09/Gobike-kids-electric-bike-ebike-for-kids-scaled.webp',
          width: 1200,
          height: 630,
          alt: frontmatter.title,
        },
      ],
      locale: 'en_AU',
      type: 'article',
      publishedTime: frontmatter.date,
      authors: [frontmatter.author],
    },
  };
}

export async function generateStaticParams() {
  const blogDir = path.join('blogs');
  if (!fs.existsSync(blogDir)) return [];
  
  const files = fs.readdirSync(blogDir);
  const paths = files.map(filename => ({
    slug: filename.replace(/\.(md|mdx)$/, ''),
  }));
  return paths;
}

export default async function SingleBlogPage({ params }: Props) {
  const { slug } = await params; 
  const post = getPostContent(slug);

  if (!post) {
    return <div className="text-center py-20">Post not found</div>;
  }
  const { frontmatter, content } = post;
  const relatedPosts = getRelatedPosts(slug);
  const shareUrl = `https://gobike.au/blog/${slug}`;
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    'headline': frontmatter.title,
    'description': frontmatter.excerpt,
    'image': frontmatter.cover_image ? [frontmatter.cover_image] : [],
    'datePublished': new Date(frontmatter.date).toISOString(),
    'dateModified': new Date(frontmatter.date).toISOString(), 
    'author': {
      '@type': 'Organization', 
      'name': frontmatter.author || 'GoBike Team',
      'url': 'https://gobike.au'
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'GoBike Australia',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://gobikes.au/wp-content/uploads/2025/06/cropped-GOBIKE-Electric-Bike-for-kids-1.webp'
      }
    },
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': `https://gobike.au/blog/${slug}`
    }
  };

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      
      <Breadcrumbs />
      
      <article className="max-w-[1000px] mx-auto mb-16 px-4 font-sans">
        
        <header className="text-center mb-8">
          <h1 className="text-[1.8rem] leading-tight mb-4 font-extrabold text-gray-900">
            {frontmatter.title}
          </h1>
          <p className="text-[#555] text-sm mb-8">
            By {frontmatter.author} on {frontmatter.date}
          </p>
        </header>

        {frontmatter.cover_image && (
          <div className="w-full h-auto mb-12 rounded-xl overflow-hidden bg-[#f0f0f0]">
             <Image 
              src={frontmatter.cover_image}
              alt={frontmatter.title}
              width={800}
              height={400}
              className="w-full h-auto object-cover"
              style={{objectFit: 'cover'}}
              priority
            />
          </div>
        )}
 
        <div className={`
            text-[#333] text-[1.1rem] leading-[1.8]
            
            /* Headings */
            [&>h1]:font-bold [&>h1]:mt-10 [&>h1]:mb-4 [&>h1]:leading-[1.3]
            [&>h2]:font-bold [&>h2]:mt-10 [&>h2]:mb-4 [&>h2]:leading-[1.3]
            [&>h3]:font-bold [&>h3]:mt-10 [&>h3]:mb-4 [&>h3]:leading-[1.3]

            /* H2 specific */
            [&>h2]:text-[1.8rem] [&>h2]:border-b [&>h2]:border-[#eee] [&>h2]:pb-2
            
            /* H3 specific */
            [&>h3]:text-[1.5rem]

            /* Paragraphs */
            [&>p]:mb-6

            /* Links */
            [&>a]:text-[#0070f3] [&>a]:no-underline [&>a]:border-b [&>a]:border-[#0070f3]
            hover:[&>a]:bg-[#f0f8ff]

            /* Strong */
            [&>strong]:font-bold

            /* Lists */
            [&>ul]:pl-6 [&>ul]:mb-6 [&>ul]:list-disc
            [&>ol]:pl-6 [&>ol]:mb-6 [&>ol]:list-decimal
            
            /* List Item */
            [&>li]:mb-3

            /* Blockquote */
            [&>blockquote]:ml-0 [&>blockquote]:pl-6 [&>blockquote]:border-l-4 [&>blockquote]:border-[#e0e0e0] 
            [&>blockquote]:text-[#555] [&>blockquote]:italic

            /* Code */
            [&>code]:bg-[#f5f5f5] [&>code]:px-[0.4em] [&>code]:py-[0.2em] [&>code]:rounded [&>code]:font-mono
        `}>
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
        <div className="mt-12 py-6 border-y border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
            <span className="font-bold text-gray-900">Share this article:</span>
            <div className="flex gap-3">
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" className="px-4 py-2 bg-[#1877F2] text-white rounded-md text-sm font-semibold hover:opacity-90 transition">Facebook</a>
                <a href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${frontmatter.title}`} target="_blank" className="px-4 py-2 bg-[#1DA1F2] text-white rounded-md text-sm font-semibold hover:opacity-90 transition">Twitter</a>
                <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`} target="_blank" className="px-4 py-2 bg-[#0A66C2] text-white rounded-md text-sm font-semibold hover:opacity-90 transition">LinkedIn</a>
            </div>
        </div>
        <div className="my-16 p-8 bg-black rounded-2xl text-center text-white relative overflow-hidden group">
            <div className="relative z-10">
                <h3 className="text-2xl md:text-3xl font-bold mb-4">Ready to start the adventure?</h3>
                <p className="text-gray-300 mb-8 max-w-[500px] mx-auto text-lg">Shop Australia&apos;s best-rated electric bikes for kids. Built for safety, engineered for fun.</p>
                <Link href="/bikes" className="inline-block bg-white text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-200 transition-all hover:scale-105">Shop All Bikes →</Link>
            </div>
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/20 blur-3xl rounded-full"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-600/20 blur-3xl rounded-full"></div>
        </div>
        <div className="mt-16 p-8 bg-gray-50 rounded-2xl flex flex-col md:flex-row items-center gap-6 border border-gray-100">
            <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center text-white text-2xl font-bold">GB</div>
            <div className="text-center md:text-left">
                <h4 className="text-xl font-bold text-gray-900 mb-2">Written by {frontmatter.author || 'GoBike Team'}</h4>
                <p className="text-gray-600 leading-relaxed">GoBike is Australia&apos;s leading provider of electric balance bikes for kids. Our mission is to get kids outdoors and help them develop confidence on two wheels safely.</p>
            </div>
        </div>
      </article>
      {relatedPosts.length > 0 && (
        <section className="bg-gray-50 py-20 px-4 border-t border-gray-100">
            <div className="max-w-[1100px] mx-auto">
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Recommended Reading</h2>
                        <p className="text-gray-600">Explore more tips and guides for young riders.</p>
                    </div>
                    <Link href="/blog" className="text-blue-600 font-bold hover:underline mb-1 hidden md:block">View all posts →</Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {relatedPosts.map((post) => (
                        <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
                            <div className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm transition-all hover:shadow-md hover:-translate-y-1 h-full flex flex-col">
                                <div className="relative aspect-video">
                                    <Image src={post.frontmatter.cover_image} alt={post.frontmatter.title} fill className="object-cover" />
                                </div>
                                <div className="p-6 flex flex-col flex-grow">
                                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">{post.frontmatter.title}</h3>
                                    <p className="text-gray-600 text-sm line-clamp-2 mb-4">{post.frontmatter.excerpt}</p>
                                    <span className="text-sm font-bold text-black mt-auto">Read More →</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
      )}
    </div>
  );
}