//app/kids-ebike-hub/category/[categoryName]/page.tsx

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Link from 'next/link';
import Image from 'next/image';
import CategoryFilter from '@/app/(frontend)/kids-ebike-hub/category/_components/CategoryFilter';
import type { Metadata } from 'next';

type Props = { params: { categoryName: string } };

function slugify(text: string) {
  return text.toLowerCase().replace(/[\s_]+/g, '-').replace(/[^\w-]+/g, '');
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categoryName } = await params;
  const formattedTitle = categoryName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  return {
    title: `${formattedTitle} | GoBike Australia Hub`,
    description: `Browse all our latest ${formattedTitle} regarding kids electric bikes and track days.`,
    alternates: { canonical: `/kids-ebike-hub/category/${categoryName}` },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { categoryName } = await params;
  
  const hubDir = path.join('hub-posts');
  let posts: any[] = [];
  
  if (fs.existsSync(hubDir)) {
    const files = fs.readdirSync(hubDir);
    const allPosts = files.map(filename => {
      const slug = filename.replace(/\.(md|mdx)$/, '');
      const markdownWithMeta = fs.readFileSync(path.join(hubDir, filename), 'utf-8');
      const { data: frontmatter } = matter(markdownWithMeta);
      return { slug, frontmatter };
    });

    posts = allPosts.filter(post => 
        post.frontmatter.category && slugify(post.frontmatter.category) === categoryName
    ).sort((a, b) => new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime());
  }

  const displayName = categoryName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="max-w-[1400px] mx-auto py-16 px-4 font-sans mb-20">
      
      <div className="mb-10 text-center">
         <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-black tracking-tight">{displayName}</h1>
         <p className="text-lg text-gray-600 max-w-2xl mx-auto">Explore all content in {displayName}</p>
      </div>

      {/* Responsive Filter */}
      <CategoryFilter />

      {posts.length === 0 ? (
          <div className="text-center py-32 bg-gray-50 rounded-3xl border border-gray-100">
             <span className="text-4xl mb-4 block">📭</span>
             <h3 className="text-2xl font-bold text-gray-900 mb-2">No posts found</h3>
             <p className="text-gray-500 text-lg">Check back later for updates in this category.</p>
          </div>
      ) : (
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
              </div>
              <div className="p-6 md:p-8 flex flex-col flex-grow bg-white">
                <h2 className="text-xl md:text-2xl font-bold mb-3 text-gray-900 group-hover:text-blue-600 leading-snug line-clamp-2 transition-colors">
                  {post.frontmatter.title}
                </h2>
                <p className="text-sm md:text-base text-gray-500 mb-6 line-clamp-2 leading-relaxed">{post.frontmatter.excerpt}</p>
                <span className="mt-auto font-bold text-black text-sm uppercase tracking-wide group-hover:text-blue-600 transition-colors flex items-center gap-2">
                  Read More <span className="group-hover:translate-x-1 transition-transform">→</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}