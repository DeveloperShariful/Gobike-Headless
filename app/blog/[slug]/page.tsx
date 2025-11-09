// app/blog/[slug]/page.tsx

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import ReactMarkdown from 'react-markdown';
import Image from 'next/image';
import styles from './SingleBlogPage.module.css';
import Breadcrumbs from '../../../components/Breadcrumbs';
import type { Metadata } from 'next';

type Props = {
  params: { slug: string };
};

// মেটাডেটা জেনারেট করার জন্য এই ফাংশনটি
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params; 
  const { frontmatter } = getPostContent(slug);

  return {
    title: frontmatter.title,
    description: frontmatter.excerpt,
    alternates: {
      canonical: `/blog/${slug}`,
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
      <article className={styles.articleContainer}>
        <header className={styles.postHeader}>
          <h1 className={styles.postTitle}>{frontmatter.title}</h1>
          <p className={styles.postMeta}>By {frontmatter.author} on {frontmatter.date}</p>
        </header>

        {frontmatter.cover_image && (
          <Image 
              src={frontmatter.cover_image}
              alt={frontmatter.title}
              width={800}
              height={400}
              className={styles.coverImage}
              style={{objectFit: 'cover'}}
              priority
          />
        )}
        
        <div className={styles.postContent}>
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </article>
    </div>
  );
}