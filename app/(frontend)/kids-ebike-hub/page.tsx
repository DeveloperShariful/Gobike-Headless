//app/kids-ebike-hub/page.tsx

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Link from 'next/link';
import Image from 'next/image';
import CategoryFilter from './category/_components/CategoryFilter';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'GoBike Hub | Videos, Tips & News Australia',
  description: "Explore the GoBike community. Watch customer videos, track days, read bike tips, and stay updated with the latest news on kids electric bikes.",
  alternates: { canonical: '/kids-ebike-hub' },
};

export default function HubFeedPage() {
  const hubDir = 'hub-posts';
  const fullPath = path.join(process.cwd(), hubDir);
  let posts: any[] = [];
  
  if (fs.existsSync(fullPath)) {
    const files = fs.readdirSync(fullPath);
    posts = files.map(filename => {
      const slug = filename.replace(/\.(md|mdx)$/, '');
      const markdownWithMeta = fs.readFileSync(path.join(hubDir, filename), 'utf-8');
      const { data: frontmatter } = matter(markdownWithMeta);
      return { slug, frontmatter };
    }).sort((a, b) => new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime());
  }

  return (
    <div className="max-w-[1400px] mx-auto py-16 px-4 font-sans mb-20">
      <div className="text-center mb-10">
         <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-black tracking-tight">The GoBike Hub</h1>
         <p className="text-lg text-gray-600 max-w-2xl mx-auto">Watch our latest customer videos, team rider highlights, track days, and expert sizing guides.</p>
      </div>

      {/* Responsive Filter (Mobile Dropdown & Desktop Pills) */}
      <CategoryFilter />

      {/* Grid Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post, index) => (
          <Link key={post.slug} href={`/kids-ebike-hub/${post.slug}`} className="group bg-white rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
            
            <div className="relative w-full aspect-[16/10] bg-gray-900 overflow-hidden flex items-center justify-center">
              {post.frontmatter.thumbnail && (
                <Image 
                  src={post.frontmatter.thumbnail} 
                  alt={post.frontmatter.title} 
                  fill 
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority={index < 4}
                  className="object-cover opacity-90 group-hover:scale-105 group-hover:opacity-100 transition-all duration-700" 
                />
              )}
              {post.frontmatter.video_url && (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                   <div className="w-16 h-16 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-colors duration-300 shadow-xl group-hover:scale-110">
                      <span className="text-2xl ml-1 text-gray-900 group-hover:text-white">▶</span>
                   </div>
                </div>
              )}
              {post.frontmatter.category && (
                <span className="absolute top-4 left-4 bg-black/80 backdrop-blur-md text-white px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg z-20 shadow-sm border border-white/10">
                  {post.frontmatter.category}
                </span>
              )}
            </div>

            <div className="p-6 md:p-8 flex flex-col flex-grow bg-white">
              <h2 className="text-xl md:text-2xl font-bold mb-3 text-gray-900 group-hover:text-blue-600 leading-snug line-clamp-2 transition-colors">
                {post.frontmatter.title}
              </h2>
              {post.frontmatter.original_caption ? (
                <p className="text-sm md:text-base text-gray-500 mb-6 line-clamp-2 italic leading-relaxed">"{post.frontmatter.original_caption}"</p>
              ) : (
                <p className="text-sm md:text-base text-gray-500 mb-6 line-clamp-2 leading-relaxed">{post.frontmatter.excerpt}</p>
              )}
              <span className="mt-auto font-bold text-black text-sm uppercase tracking-wide group-hover:text-blue-600 transition-colors flex items-center gap-2">
                {post.frontmatter.video_url ? 'Watch Video' : 'Read Article'} <span className="group-hover:translate-x-1 transition-transform">→</span>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}