// ফাইল পাথ: app/product/custom-sections/Gobike-24/OverviewSection.tsx
import ImageSlider from '../../components/ImageSlider/ImageSlider';
import styles from '../GobikeSections.module.css';

const overviewImages = [
  { src: 'https://gobikes.au/wp-content/uploads/2025/12/Gobike-24inch-Electric-Dirt-Bike-–-Durable-Kids-Electric-Bike-for-Trail-Riding-kids.webp', alt: 'GoBike 24 Pro hitting a jump on a dirt track. electric balance bike 24inch' },
  { src: 'https://gobikes.au/wp-content/uploads/2025/11/24inch-Gobike-Kids-Electric-Bike-–-Best-Battery-Powered-Ebike-for-Boys.webp', alt: 'GoBike 24 Pro hitting a jump on a dirt track.' },
  { src: 'https://gobikes.au/wp-content/uploads/2025/11/Gobike-Kids-Electric-Bike-–-24inch-Ebike-Childrens-Battery-Motorbike-Alternative.webp', alt: 'Teenager riding the GoBike 24 electric bike off-road.' },
  { src: 'https://gobikes.au/wp-content/uploads/2025/11/Gobike-24inch-Kids-Electric-Bike-–-High-Performance-Ebike-for-Kids-Teens-Australia.webp', alt: 'Side view of the powerful GoBike 24 Inch Pro.' },
  { src: 'https://gobikes.au/wp-content/uploads/2025/11/24inch-Gobike-Electric-Balance-Bike-–-Powerful-Childrens-Battery-Motorbike-for-Off-Road.webp', alt: 'Teenager riding GoBike 24 inch electric dirt bike on a forest trail with tall trees. GoBike 24 Inch Electric Balance Bike' },
];

export default function OverviewSection() {
  return (
    <section className={styles.sectionContainer}>
      <div className={styles.overviewGrid}>
        <div className={styles.overviewText}>
          <h2 className={styles.mainTitle}>GoBike 24 Pro: The Ultimate Machine</h2>
          <p className={styles.mainDescription}>
            Ready to level up? The **GoBike 24 Inch Pro** is built for teens and adults who demand power. With a massive **2500W motor**, top speeds of **61km/h**, and **fully adjustable suspension**, this isn't just a bike—it's a dirt-shredding beast. Whether hitting jumps or exploring trails, the GoBike 24 delivers pro-level performance and adrenaline-pumping fun.
          </p>
        </div>
        <div className={styles.overviewSlider}>
          <ImageSlider images={overviewImages} />
        </div>
      </div>
    </section>
  );
}