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