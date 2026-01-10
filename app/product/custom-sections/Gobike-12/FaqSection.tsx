// ফাইল পাথ: app/product/custom-sections/Gobike-12/FaqSection.tsx
import Accordion from '../../components/Accordion/Accordion';
// import styles from '../GobikeSections.module.css'; // CSS Module সরানো হয়েছে
import Link from 'next/link';

const faqData = [
  { question: "Is the GoBike 12 safe for a 3-year-old?", answer: "Absolutely. The GoBike 12 is designed with safety as a priority, featuring a lightweight frame, a low-power mode for gentle starts, and a low seat height so your child's feet can always touch the ground." },
  { question: "How does this e-bike help my toddler learn to ride?", answer: "It teaches the core skill of balancing first. The gentle motor assist helps with momentum, allowing your child to focus purely on balance and steering, which makes the future transition to a pedal bike much easier." },
  { question: "How long does the battery last on a single charge?", answer: "A full charge typically provides up to 2 hours of continuous fun, which is plenty of time for multiple backyard adventures for a toddler." },
  { question: "Is the GoBike 12 difficult to assemble?", answer: "Not at all! The bike comes mostly pre-assembled. You just need to attach the handlebars and front wheel, which takes only a few minutes with the included tools." },
  { question: "Can this electric balance bike be ridden on grass?", answer: "Yes, its durable, puncture-proof tires are designed to handle various common surfaces, including grass, pavement, and dirt paths, making it a versatile outdoor toy." },
  { question: "How durable is the bike for an active child?", answer: "We've built it to last. With a sturdy aluminum frame and no-flat tires, the GoBike 12 is engineered to withstand the bumps and tumbles of active toddler play." },
  { question: "What is the top speed in the safe learning mode?", answer: "In the low-power learning mode, the speed is capped at a gentle walking pace (around 5 km/h), allowing your child to build confidence without being overwhelmed." }
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