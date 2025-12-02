import Link from 'next/link';
import { getSortedPostsData } from '../../lib/posts';
import styles from './BlogSection.module.css';
import BlogSlider from './BlogSlider';

export default async function DynamicBlogSection() {
  const allPosts = getSortedPostsData();
  const latestPosts = allPosts.slice(0, 10);

  return (
    <section className={styles.blogSection}>
      <div className={styles.container}>
        
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>GoBike Guides & Pro Tips with Latest Blog</h2>
          <p className={styles.sectionSubtitle}>
            From safety guides to choosing the right size, our blog is packed with expert advice to help you and your child get the most out of your ebike adventure.
          </p>
        </div>

        <BlogSlider posts={latestPosts} />

        <div className={styles.viewAllButtonContainer}>
          <Link href="/blog" className={styles.btnPrimary}>View All Posts</Link>
        </div>

      </div>
    </section>
  );
}