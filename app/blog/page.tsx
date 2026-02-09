// app/blog/page.tsx

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Link from 'next/link';
import Image from 'next/image';
import Breadcrumbs from '../../components/Breadcrumbs';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'GoBike Blog | Kids Electric Bike Tips, Safety & News Australia',
  description: "Read expert advice on childrens electric motorbikes, safety guides, and maintenance tips. The ultimate resource for electric cycles in Australia.",
  keywords: [
    'kids electric bike blog',
    'electric cycles australia',
    'childrens electric motorbikes',
    'balancing bikes guide',
    'electric childs motorbike tips',
    'australia electric bike news',
    'kids ebike safety'
  ],
  alternates: {
    canonical: '/blog',
  },
  openGraph: {
    title: 'GoBike Blog | Kids Electric Bike Tips, Safety & News Australia',
    description: "Expert tips, safety guides, and inspiring stories for your little rider's next big adventure.",
    url: 'https://gobike.au/blog',
    siteName: 'GoBike Australia',
    images: [
      {
        url: 'https://gobikes.au/wp-content/uploads/2025/11/gobike-removable-battery-pack.jpg', 
        width: 1200,
        height: 857,
        alt: 'GoBike Australia Blog - Kids E-Bike Guides',
      },
    ],
    locale: 'en_AU',
    type: 'website',
  },
};

export default function BlogPage() {
  const blogDir = 'blogs';
  const fullPath = path.join(process.cwd(), blogDir);
  let posts: any[] = [];
  if (fs.existsSync(fullPath)) {
    const files = fs.readdirSync(fullPath);
    posts = files.map(filename => {
      const slug = filename.replace(/\.(md|mdx)$/, '');
      const markdownWithMeta = fs.readFileSync(path.join(blogDir, filename), 'utf-8');
      const { data: frontmatter } = matter(markdownWithMeta);

      return {
        slug,
        frontmatter,
      };
    }).sort((a, b) => new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime());
  }

  // --- Blog Schema (Collection) ---
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    'name': 'GoBike Australia Blog',
    'description': 'Expert tips and guides about kids electric bikes and balancing bikes.',
    'url': 'https://gobike.au/blog',
    'blogPost': posts.map(post => ({
      '@type': 'BlogPosting',
      'headline': post.frontmatter.title,
      'description': post.frontmatter.excerpt,
      'url': `https://gobike.au/blog/${post.slug}`,
      'datePublished': post.frontmatter.date,
      'image': post.frontmatter.cover_image
    }))
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <Breadcrumbs />
      
      <div className="max-w-[1200px] mx-auto mb-20 px-4">
        
        {/* Page Header (Original UI) */}
        <header className="text-center mb-10">
          <h1 className="text-[2rem] font-extrabold mb-[0.8rem] tracking-tight text-gray-900">
            GoBike Kids E-Bike Blog
          </h1>
          <p className="text-[1.2rem] text-[#555] max-w-[650px] mx-auto leading-[1.6]">
            Expert tips, safety guides, and inspiring stories for your little riders next big adventure.
          </p>
        </header>
      
        <main>
          {/* Posts Grid (Original UI) */}
          <div className="grid grid-cols-[repeat(auto-fill,minmax(350px,1fr))] gap-10">
            {posts.map(post => (
              <Link 
                key={post.slug} 
                href={`/blog/${post.slug}`} 
                className="group no-underline text-inherit bg-white border border-[#e7e7e7] rounded-2xl overflow-hidden flex flex-col shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-[0_12px_28px_rgba(0,0,0,0.1)]"
              >
                <div className="relative w-full pt-[56.25%] bg-[#f0f0f0]">
                  {post.frontmatter.cover_image && (
                    <Image
                      src={post.frontmatter.cover_image}
                      alt={post.frontmatter.title}
                      fill
                      className="absolute top-0 left-0 w-full h-full object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  )}
                </div>

                <div className="p-6 md:px-[1.8rem] md:py-[1.5rem] flex flex-col flex-grow">
                  <h2 className="text-[1.5rem] font-bold mb-3 leading-[1.4]">
                    {post.frontmatter.title}
                  </h2>
                  <p className="text-[0.9rem] text-[#777] mb-4">
                    By {post.frontmatter.author} on {post.frontmatter.date}
                  </p>
                  <p className="flex-grow mb-6 text-[#444] leading-[1.7]">
                    {post.frontmatter.excerpt}
                  </p>
                  <span className="font-bold text-black no-underline transition-colors duration-200 group-hover:text-[#0070f3]">
                    Read More →
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* --- New SEO Content Block (Increases topical authority) --- */}
          <section className="mt-20 pt-10 border-t border-gray-100">
             <div className="max-w-[900px] mx-auto text-center text-gray-600">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Guide to Electric Cycles in Australia</h2>
                <p className="mb-4">
                   Welcome to the official GoBike blog! Whether you are looking for maintenance tips for your <strong>electric childs motorbike</strong> or safety advice for <strong>balancing bikes</strong>, we have got you covered.
                </p>
                <p>
                   Our goal is to educate Aussie parents on the benefits of <strong>australian electric bikes</strong>, helping you choose the perfect ride for your child, from toddlers to teens.
                </p>
             </div>
          </section>

        </main>
      </div>
    </div>
  );
}