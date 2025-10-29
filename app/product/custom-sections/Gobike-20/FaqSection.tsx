// ফাইল পাথ: app/product/custom-sections/Gobike-20/FaqSection.tsx
import Accordion from '../../components/Accordion/Accordion';
import styles from '../GobikeSections.module.css';
import Link from 'next/link';
const faqData = [
  { question: "Is the GoBike 20 suitable for actual mountain bike trails?", answer: "Yes, absolutely. With its robust front suspension, all-terrain tires, and durable frame, the GoBike 20 is specifically designed to handle the challenges of moderate off-road and mountain bike trails." },
  { question: "How powerful is the motor for climbing hills?", answer: "The high-torque hub motor provides significant power, making hill climbs much more manageable and fun for young riders. It helps them keep up with older riders and conquer terrain they couldn't on a regular bike." },
  { question: "Why does the GoBike 20 have gears?", answer: "The multi-speed gear system allows the rider to optimize their pedaling for different situations. Lower gears make climbing hills easier, while higher gears are perfect for gaining speed on flat terrain, providing a true MTB experience." },
  { question: "Is the battery removable for convenient charging?", answer: "Yes, the battery is integrated into the frame for a sleek look but can be easily removed with a key. This allows you to charge it indoors, separate from the bike, for added convenience and security." },
  { question: "What rider height is the GoBike 20 best suited for?", answer: "The GoBike 20 is designed for older kids, typically in the height range of 130cm to 150cm (4'3\" to 4'11\"). The adjustable seat post allows for a fine-tuned fit." },
  { question: "How does the suspension improve the ride quality?", answer: "The front suspension fork absorbs impacts from rocks, roots, and bumps on the trail. This leads to a much smoother, more comfortable ride and gives the rider better control and confidence on rough surfaces." },
  { question: "Are parts like brakes and gears standard and easily replaceable?", answer: "Yes, we use industry-standard components from reputable brands. This ensures reliability and makes it easy to find replacement parts or perform upgrades at most local bike shops." }
];

export default function FaqSection() {
  return (
    <section className={`${styles.sectionContainer} ${styles.coloredBackground}`}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Technical Questions & Answers</h2>
      </div>
      <Accordion items={faqData} />
      <div className={styles.seeMoreContainer}>
        <Link 
          href="/faq" // <-- পরিবর্তন: এখন এটি একটি ইন্টারনাল পাথ
          className={styles.seeMoreButton}
        >
          See More FAQs
        </Link>
      </div>
    </section>
  );
}