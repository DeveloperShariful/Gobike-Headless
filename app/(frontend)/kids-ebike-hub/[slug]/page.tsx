//app/kids-ebike-hub/[slug]/page.tsx

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import ReactMarkdown from 'react-markdown';
import type { Metadata } from 'next';
import Link from 'next/link';

type Props = { params: { slug: string } };

function getHubContent(slug: string) {
    const filePath = path.join('hub-posts', `${slug}.md`);
    if (!fs.existsSync(filePath)) return null;
    const markdownWithMeta = fs.readFileSync(filePath, 'utf-8');
    const { data: frontmatter, content } = matter(markdownWithMeta);
    return { frontmatter, content };
}

// 100% SEO OPTIMIZED METADATA
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getHubContent(slug);
  if (!post) return { title: 'Not Found | GoBike Hub' };
  
  return {
    title: `${post.frontmatter.title} | GoBike Australia`,
    description: post.frontmatter.excerpt,
    keywords: post.frontmatter.tags || ['kids electric bike'],
    alternates: { canonical: `https://gobike.au/kids-ebike-hub/${slug}` },
    openGraph: {
      title: post.frontmatter.title,
      description: post.frontmatter.excerpt,
      images: [post.frontmatter.thumbnail],
      type: 'article',
    }
  };
}

export async function generateStaticParams() {
  const hubDir = path.join('hub-posts');
  if (!fs.existsSync(hubDir)) return [];
  return fs.readdirSync(hubDir).map(filename => ({ slug: filename.replace(/\.(md|mdx)$/, '') }));
}

export default async function SingleHubPage({ params }: Props) {
  const { slug } = await params;
  const post = getHubContent(slug);

  if (!post) {
    return <div className="text-center py-20 font-bold text-xl">Content not found.</div>;
  }

  const { frontmatter, content } = post;

  return (
    <article className="max-w-[900px] mx-auto mb-20 px-4 pt-10 font-sans">
      
      {/* Header */}
      <div className="mb-8 text-center">
        {frontmatter.category && (
          <Link href={`/kids-ebike-hub`} className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-1 text-xs font-bold uppercase rounded-full mb-4 inline-block transition-colors">
            ← Back to {frontmatter.category}
          </Link>
        )}
        <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight mt-2">
          {frontmatter.title}
        </h1>
        {frontmatter.date && <p className="text-gray-500 mt-4 text-sm font-medium">{frontmatter.date}</p>}
      </div>

      {/* Media Player / Image */}
      {frontmatter.video_url ? (
        <div className="w-full bg-black rounded-2xl overflow-hidden shadow-lg mb-10">
          <video 
            controls 
            className="w-full h-auto max-h-[600px] object-contain"
            poster={frontmatter.thumbnail}
            preload="metadata"
          >
            <source src={frontmatter.video_url} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      ) : frontmatter.thumbnail && (
        <div className="w-full rounded-2xl overflow-hidden shadow-lg mb-10">
           {/* eslint-disable-next-line @next/next/no-img-element */}
           <img src={frontmatter.thumbnail} alt={frontmatter.title} className="w-full h-auto max-h-[600px] object-cover" />
        </div>
      )}

      {/* Social Media Original Caption (Client Requirement) */}
      {frontmatter.original_caption && (
        <div className="bg-[#f8f9fa] border-l-4 border-black p-6 rounded-r-xl mb-12 shadow-sm">
          <span className="text-black font-bold text-xs uppercase tracking-widest mb-2 block">Original Post</span>
          <p className="text-gray-800 italic font-medium leading-relaxed text-lg">
            "{frontmatter.original_caption}"
          </p>
        </div>
      )}

      {/* SEO Expanded Markdown Content */}
      <div className={`
        text-gray-800 text-[1.15rem] leading-[1.8]
        [&_h2]:text-3xl [&_h2]:font-extrabold [&_h2]:mt-12 [&_h2]:mb-6 [&_h2]:border-b [&_h2]:pb-2
        [&_h3]:text-2xl [&_h3]:font-bold [&_h3]:mt-8 [&_h3]:mb-4
        [&_p]:mb-6
        [&_a]:text-blue-600 [&_a]:font-bold [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-blue-800
        [&_ul]:pl-6 [&_ul]:mb-6 [&_ul]:list-disc [&_li]:mb-2
        [&_strong]:font-bold [&_strong]:text-black
      `}>
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>

      {/* SEO Bottom CTA */}
      <div className="mt-16 p-10 bg-black rounded-3xl text-center text-white shadow-2xl relative overflow-hidden">
         <div className="relative z-10">
             <h3 className="text-3xl font-extrabold mb-4">Start The Adventure Today</h3>
             <p className="mb-8 text-gray-300 max-w-md mx-auto text-lg">Browse Australia's best-rated electric balance bikes for kids. Built for safety, engineered for fun.</p>
             <Link href="/bikes" className="inline-block bg-white text-black px-10 py-4 font-bold text-lg rounded-full hover:bg-gray-200 transition-transform hover:scale-105">
                Shop GoBike Models →
             </Link>
         </div>
      </div>

    </article>
  );
}