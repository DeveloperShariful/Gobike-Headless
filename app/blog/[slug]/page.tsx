// app/blog/[slug]/page.tsx

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import ReactMarkdown from 'react-markdown';
import Image from 'next/image';
// import styles from './SingleBlogPage.module.css'; // CSS Module সরানো হয়েছে
import Breadcrumbs from '../../../components/Breadcrumbs';
import type { Metadata } from 'next';

type Props = {
  params: { slug: string };
};

// মেটাডেটা জেনারেট করার জন্য ফাংশন
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params; 
  const { frontmatter } = getPostContent(slug);

  return {
    title: frontmatter.title,
    description: frontmatter.excerpt,
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
  const files = fs.readdirSync(path.join('blogs'));
  const paths = files.map(filename => ({
    slug: filename.replace(/\.(md|mdx)$/, ''),
  }));
  return paths;
}

function getPostContent(slug: string) {
    const filePath = path.join('blogs', `${slug}.md`);
    const markdownWithMeta = fs.readFileSync(filePath, 'utf-8');
    const { data: frontmatter, content } = matter(markdownWithMeta);
    return { frontmatter, content };
}

export default async function SingleBlogPage({ params }: Props) {
  const { slug } = await params; 
  const { frontmatter, content } = getPostContent(slug);

  return (
    <div>
      <Breadcrumbs />
      
      {/* .articleContainer replaced with Tailwind */}
      <article className="max-w-[1000px] mx-auto mb-16 px-4 font-sans">
        
        {/* .postHeader replaced with Tailwind */}
        <header className="text-center mb-8">
          {/* .postTitle replaced with Tailwind */}
          <h1 className="text-[1.8rem] leading-tight mb-4 font-extrabold text-gray-900">
            {frontmatter.title}
          </h1>
          {/* .postMeta replaced with Tailwind */}
          <p className="text-[#555] text-sm mb-8">
            By {frontmatter.author} on {frontmatter.date}
          </p>
        </header>

        {frontmatter.cover_image && (
          // .coverImage replaced with Tailwind
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
        
        {/* .postContent এবং এর ভিতরের Markdown স্টাইলগুলো Tailwind এর 
            Arbitrary Variants ব্যবহার করে হুবহু কপি করা হয়েছে।
        */}
        <div className={`
            text-[#333] text-[1.1rem] leading-[1.8]
            
            /* Headings (h1, h2, h3) */
            [&>h1]:font-bold [&>h1]:mt-10 [&>h1]:mb-4 [&>h1]:leading-[1.3]
            [&>h2]:font-bold [&>h2]:mt-10 [&>h2]:mb-4 [&>h2]:leading-[1.3]
            [&>h3]:font-bold [&>h3]:mt-10 [&>h3]:mb-4 [&>h3]:leading-[1.3]

            /* H2 specific */
            [&>h2]:text-[1.8rem] [&>h2]:border-b [&>h2]:border-[#eee] [&>h2]:pb-2
            
            /* H3 specific */
            [&>h3]:text-[1.5rem]

            /* Paragraphs (p) */
            [&>p]:mb-6

            /* Links (a) */
            [&>a]:text-[#0070f3] [&>a]:no-underline [&>a]:border-b [&>a]:border-[#0070f3]
            hover:[&>a]:bg-[#f0f8ff]

            /* Strong */
            [&>strong]:font-bold

            /* Lists (ul, ol) */
            [&>ul]:pl-6 [&>ul]:mb-6 [&>ul]:list-disc
            [&>ol]:pl-6 [&>ol]:mb-6 [&>ol]:list-decimal
            
            /* List Item (li) */
            [&>li]:mb-3

            /* Blockquote */
            [&>blockquote]:ml-0 [&>blockquote]:pl-6 [&>blockquote]:border-l-4 [&>blockquote]:border-[#e0e0e0] 
            [&>blockquote]:text-[#555] [&>blockquote]:italic

            /* Code */
            [&>code]:bg-[#f5f5f5] [&>code]:px-[0.4em] [&>code]:py-[0.2em] [&>code]:rounded [&>code]:font-mono
        `}>
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </article>
    </div>
  );
}