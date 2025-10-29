// ফাইল পাথ: app/product/custom-sections/Gobike-12/OverviewSection.tsx
import ImageSlider from '../../components/ImageSlider/ImageSlider';
import styles from '../GobikeSections.module.css';

const overviewImages = [
  { src: 'https://gobikes.au/wp-content/uploads/2025/10/H.webp', alt: 'A young child learning on the GoBike 12-inch' },
  { src: 'https://gobikes.au/wp-content/uploads/2025/10/gobike-au-kids-ebike-christmas-sale.webp', alt: 'Close up of the GoBike 12-inch frame' },
  { src: 'https://gobikes.au/wp-content/uploads/2025/10/gobike-kids-ebike-gift-guide.webp', alt: 'A happy toddler with the GoBike 12 e-bike' },
  { src: 'https://gobikes.au/wp-content/uploads/2025/10/gobike-au-australian-owned-brand.webp', alt: 'the baby with the GoBike 12 e-bike' },
  { src: 'https://gobikes.au/wp-content/uploads/2025/10/gobike-au-1-year-warranty-kids-ebikes.webp', alt: 'A happy kid with the GoBike 12 e-bike' },
  { src: 'https://gobikes.au/wp-content/uploads/2025/10/gobike-12-safety-features-for-toddlers.webp', alt: 'two  kids with the GoBike 12 e-bike' },
];

export default function OverviewSection() {
  return (
    <section className={styles.sectionContainer}>
      <div className={styles.overviewGrid}>
        <div className={styles.overviewText}>
          <h1 className={styles.mainTitle}>GoBike 12: The Easiest Way to Teach Your Kid to Ride</h1>
          <p className={styles.mainDescription}>
            Say goodbye to tears and tricky training wheels. The GoBike 12 (ages 2-5) is engineered to be the safest, easiest way for your child to learn. This is not just a bike; it is a confidence-builder. By focusing on balance first, your little rider will master the basics in no time. It is light, durable, and ready for every Aussie backyard. Give the gift of confidence and start their riding journey today.</p>
        </div>
        <div className={styles.overviewSlider}>
          <ImageSlider images={overviewImages} />
        </div>
      </div>
    </section>
  );
}