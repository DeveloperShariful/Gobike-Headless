// ফাইল পাথ: app/product/custom-sections/Gobike-20/OverviewSection.tsx
import ImageSlider from '../../components/ImageSlider/ImageSlider';
import styles from '../GobikeSections.module.css';

const overviewImages = [
  { src: 'https://gobikes.au/wp-content/uploads/2025/10/gobike-12-lightweight-aluminum-frame.webp', alt: 'A young rider catching air on a jump with the GoBike 20 at a bike park.' },
  { src: 'https://gobikes.au/wp-content/uploads/2025/10/kids-ebike-durable-tires-gobike.webp', alt: 'Action shot of a kid jumping the GoBike 20, showcasing its performance suspension.' },
  { src: 'https://gobikes.au/wp-content/uploads/2025/08/Gobike-kids-electric-bike-ebike-for-kids-5-scaled-1.webp', alt: 'An excited boy celebrating with his brand new GoBike 20 box.' },
  //{ src: 'https://gobikes.au/wp-content/uploads/2025/08/Gobike-kids-electric-bike-ebike-for-kids-2-scaled-1.webp', alt: 'Two children with their GoBike e-bikes enjoying a day out on a sandy beach.' },
];


export default function OverviewSection() {
  return (
    <section className={styles.sectionContainer}>
      <div className={styles.overviewGrid}>
        <div className={styles.overviewText}>
          <h1 className={styles.mainTitle}>GoBike 20: The Adventure Gets Real</h1>
          <p className={styles.mainDescription}>
            For the young gun who is outgrown the basics and is ready to really rip. The GoBike 20 is a tough, trail-ready e-bike for kids aged 8-12, built with a more powerful motor, responsive suspension, and a rugged frame. It’s the ultimate step-up for tackling proper trails, hitting jumps, and unlocking a new level of off-road freedom.
          </p>
        </div>
        <div className={styles.overviewSlider}>
          <ImageSlider images={overviewImages} />
        </div>
      </div>
    </section>
  );
}