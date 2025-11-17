// ফাইল পাথ: app/product/custom-sections/Gobike-16/FaqSection.tsx
import Accordion from '../../components/Accordion/Accordion';
import styles from '../GobikeSections.module.css';
import Link from 'next/link';
const faqData = [
  { question: "What are the different speed modes on the GoBike 16?", answer: "The GoBike 16 features multiple speed modes to grow with your child's skill. It includes a slow learning mode for beginners and a faster mode for more confident riders ready for more excitement." },
  { question: "Why are hydraulic disc brakes important for this bike?", answer: "Safety is key. Hydraulic disc brakes provide superior, reliable stopping power in all weather conditions, giving both you and your child peace of mind, especially when riding at higher speeds." },
  { question: "How far can my 7-year-old ride on a full charge?", answer: "The high-efficiency battery offers a generous range of up to 2 hours, depending on terrain and riding style. It's more than enough for a fun-filled afternoon at the park or exploring local trails." },
  { question: "Can the GoBike 16 be adjusted as my child grows?", answer: "Yes, it's designed to last. Both the seat height and handlebar position are easily adjustable, ensuring a comfortable and ergonomic fit for your child as they grow taller and more confident." },
  { question: "Is the GoBike 16 too heavy for a child to handle?", answer: "While it's a robust bike, it's built with a balanced aluminum frame that keeps the weight manageable for children in the 5-9 age range, allowing them to control it with ease." },
  { question: "What kind of maintenance does the GoBike 16 require?", answer: "It's designed to be low-maintenance. We recommend regular checks on tire pressure and brake function and lubricated, similar to any quality bicycle." },
  { question: "What is the biggest advantage of the GoBike 16 over a regular pedal bike?", answer: "The electric motor empowers kids to tackle hills and longer distances without getting exhausted. This keeps riding fun, boosts their confidence, and encourages them to spend more time outdoors." }
];

export default function FaqSection() {
  return (
    <section className={styles.sectionContainer}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Your Questions Answered</h2>
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