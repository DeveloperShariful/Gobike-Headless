// ফাইল পাথ: app/product/custom-sections/Gobike-24/FaqSection.tsx
import Accordion from '../../components/Accordion/Accordion';
import styles from '../GobikeSections.module.css';
import Link from 'next/link';

const faqData = [
  { question: "Is the GoBike 24 suitable for teenagers and adults?", answer: "Yes! The GoBike 24 is designed for ages 13+ and adults. With a robust frame, 120kg load capacity, and adjustable seat height (74-84cm), it fits teenagers and adults perfectly." },
  { question: "How fast does the 2500W motor go?", answer: "The powerful 2500W brushless motor delivers a top speed of 31 mph (61 km/h) in Sport Mode. It also features Low (17km/h) and Medium (35km/h) modes for different skill levels." },
  { question: "Can I adjust the suspension for different terrains?", answer: "Absolutely. The GoBike 24 features a premium adjustable hydraulic front fork and a FASTACE air adjustable rear shock, allowing you to tune the suspension for trails, tracks, or casual riding." },
  { question: "How long does the battery last on a single charge?", answer: "The 48-55V 15Ah battery provides a run time of approximately range of up to 3 hours, depending entirely on the terrain, speed mode, and rider weight." },
  { question: "Is the GoBike 24 ready for hard off-road riding?", answer: "Yes, it is built for the dirt. With 24-inch Kenda fat tires, hydraulic disc brakes, and a high-strength aluminum frame, it handles jumps, bumps, and steep hills with ease." },
  { question: "Are the hydraulic brakes safe for high speeds?", answer: "Safety is our priority. The TIM brand front and rear hydraulic disc brakes provide superior stopping power and precise modulation, ensuring you can stop quickly even at top speeds." },
  { question: "Does the bike come with a warranty?", answer: "Yes, we offer the longest 1-year warranty on the market for the motor, frame, and main components, giving you peace of mind with your purchase." }
];

export default function FaqSection() {
  return (
    // .sectionContainer & .coloredBackground replaced
    <section className="w-full py-12 px-[5%] md:px-[1%] box-border bg-[#f7fafc]">
      {/* .sectionHeader (Special case for FAQ centered) replaced */}
      <div className="flex justify-center items-center mx-auto mb-10 max-w-[800px]">
        {/* .sectionTitle replaced */}
        <h2 className="text-[1.5rem] md:text-[2rem] font-bold text-[#1a202c] text-center">Frequently Asked Questions</h2>
      </div>
      
      <Accordion items={faqData} />
      
      {/* .seeMoreContainer replaced */}
      <div className="mt-10 flex justify-center w-full">
        <Link 
          href="/faq" 
          // .seeMoreButton replaced
          className="inline-block py-3 px-7 bg-black text-white text-center font-semibold rounded-lg transition-all duration-300 ease-in-out border border-transparent hover:bg-[#333] hover:-translate-y-0.5"
        >
          See More FAQs
        </Link>
      </div>
    </section>
  );
}