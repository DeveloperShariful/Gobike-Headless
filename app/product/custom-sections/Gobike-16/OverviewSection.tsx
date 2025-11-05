import ImageSlider from '../../components/ImageSlider/ImageSlider';
import styles from '../GobikeSections.module.css';

// Image list with descriptive alt tags for SEO and accessibility
const overviewImages = [
  { src: 'https://gobikes.au/wp-content/uploads/2025/10/gobike-removable-battery-pack.webp', alt: 'A young boy confidently riding the Gobike 16 electric bike on a pump track.' },
  { src: 'https://gobikes.au/wp-content/uploads/2025/10/GoBike-3767.webp', alt: 'Kid catching air on a Gobike 16 electric dirt bike on an off-road trail.' },
  { src: 'https://gobikes.au/wp-content/uploads/2025/10/best-electric-bike-for-kids-australia-gobike.webp', alt: 'A child learning to ride the Gobike 16 with family support in a park.' },
  { src: 'https://gobikes.au/wp-content/uploads/2025/10/GoBike-3892.webp', alt: 'Young rider confidently manoeuvring the Gobike 16 on an off-road dirt course.' },
];

export default function OverviewSection() {
  return (
    <section className={styles.sectionContainer}>
      <div className={styles.overviewGrid}>
        <div className={styles.overviewText}>
          <h2 className={styles.mainTitle}>Gobike 16: The Ultimate Kids Adventure E-Bike</h2>
          <p className={styles.mainDescription}>
            Ready to level up your little grom is riding adventures? The Gobike 16 is the ultimate electric balance bike, perfectly blending serious fun with skill development. It’s built to boost confidence, helping kids master balance and throttle control on any terrain. From the backyard to the local pump track, give your child the freedom to explore and watch them ride with a massive grin.
          </p>
        </div>
        <div className={styles.overviewSlider}>
            <ImageSlider images={overviewImages} />
        </div>
      </div>
    </section>
  );
}