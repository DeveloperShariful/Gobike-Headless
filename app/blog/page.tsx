// app/blog/page.tsx
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Link from 'next/link';
import Image from 'next/image';
// import styles from './BlogListPage.module.css'; // CSS Module সরানো হয়েছে
import Breadcrumbs from '../../components/Breadcrumbs';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'GoBike Kids E-Bike Blog | Tips, Guides & Stories',
  description: "Expert tips, safety guides, and inspiring stories for your little rider's next big adventure. Explore the official GoBike Australia blog for parents and kids.",
  alternates: {
    canonical: '/blog',
  },
  openGraph: {
    title: 'GoBike Kids E-Bike Blog | Tips, Guides & Stories',
    description: "Expert tips, safety guides, and inspiring stories for your little rider's next big adventure.",
    url: 'https://gobike.au/blog',
    siteName: 'GoBike Australia',
    images: [
      {
        url: 'https://gobikes.au/wp-content/uploads/2025/11/gobike-removable-battery-pack.jpg', 
        width: 1200,
        height: 857,
        alt: 'The GoBike Australia Blog for kids e-bikes',
      },
    ],
    locale: 'en_AU',
    type: 'website',
  },
};

export default function BlogPage() {
  const blogDir = 'blogs';
  const files = fs.readdirSync(path.join(process.cwd(), blogDir));

  // পোস্টগুলোকে তারিখ অনুযায়ী সাজানো (নতুন থেকে পুরোনো)
  const posts = files.map(filename => {
    const slug = filename.replace(/\.(md|mdx)$/, '');
    const markdownWithMeta = fs.readFileSync(path.join(blogDir, filename), 'utf-8');
    const { data: frontmatter } = matter(markdownWithMeta);

    return {
      slug,
      frontmatter,
    };
  }).sort((a, b) => new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime());

  return (
    <div>
      <Breadcrumbs />
      {/* .pageContainer replaced */}
      <div className="max-w-[1200px] mx-auto mb-20 px-4">
        
        {/* .pageHeader replaced */}
        <header className="text-center mb-10">
          {/* --- কার্যকরী সমাধান: নতুন SEO-বান্ধব শিরোনাম --- */}
          {/* .pageTitle replaced */}
          <h1 className="text-[2rem] font-extrabold mb-[0.8rem] tracking-tight text-gray-900">
            GoBike Kids E-Bike Blog
          </h1>
          {/* .pageSubtitle replaced */}
          <p className="text-[1.2rem] text-[#555] max-w-[650px] mx-auto leading-[1.6]">
            Expert tips, safety guides, and inspiring stories for your little riders next big adventure.
          </p>
        </header>
      
        <main>
          {/* .postsGrid replaced */}
          <div className="grid grid-cols-[repeat(auto-fill,minmax(350px,1fr))] gap-10">
            {posts.map(post => (
              <Link 
                key={post.slug} 
                href={`/blog/${post.slug}`} 
                // .postCard replaced
                className="group no-underline text-inherit bg-white border border-[#e7e7e7] rounded-2xl overflow-hidden flex flex-col shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-[0_12px_28px_rgba(0,0,0,0.1)]"
              >
                
                {/* --- কার্যকরী সমাধান: কভার ইমেজ --- */}
                {/* .imageContainer replaced */}
                <div className="relative w-full pt-[56.25%] bg-[#f0f0f0]">
                  {post.frontmatter.cover_image && (
                    <Image
                      src={post.frontmatter.cover_image}
                      alt={post.frontmatter.title}
                      fill
                      // .postImage replaced
                      className="absolute top-0 left-0 w-full h-full object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  )}
                </div>

                {/* .contentContainer replaced */}
                <div className="p-6 md:px-[1.8rem] md:py-[1.5rem] flex flex-col flex-grow">
                  {/* .postTitleCard replaced */}
                  <h2 className="text-[1.5rem] font-bold mb-3 leading-[1.4]">
                    {post.frontmatter.title}
                  </h2>
                  {/* .postMeta replaced */}
                  <p className="text-[0.9rem] text-[#777] mb-4">
                    By {post.frontmatter.author} on {post.frontmatter.date}
                  </p>
                  {/* .postExcerpt replaced */}
                  <p className="flex-grow mb-6 text-[#444] leading-[1.7]">
                    {post.frontmatter.excerpt}
                  </p>
                  {/* .readMore replaced */}
                  <span className="font-bold text-black no-underline transition-colors duration-200 group-hover:text-[#0070f3]">
                    Read More →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}