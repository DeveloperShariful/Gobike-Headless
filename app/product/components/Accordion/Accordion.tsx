// ফাইল পাথ: app/product/components/Accordion/Accordion.tsx
'use client';
import { useState } from 'react';
import styles from './Accordion.module.css';

interface AccordionItem {
  question: string;
  answer: string;
}

interface AccordionProps {
  items: AccordionItem[];
}

export default function Accordion({ items }: AccordionProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className={styles.accordion}>
      {items.map((item, index) => (
        <div key={index} className={styles.accordionItem}>
          <button
            className={styles.accordionQuestion}
            onClick={() => toggleAccordion(index)}
          >
            <span>{item.question}</span>
            <span className={`${styles.arrow} ${activeIndex === index ? styles.arrowOpen : ''}`}>
              &#9660;
            </span>
          </button>
          <div className={`${styles.accordionAnswer} ${activeIndex === index ? styles.answerOpen : ''}`}>
            <p>{item.answer}</p>
          </div>
        </div>
      ))}
    </div>
  );
}