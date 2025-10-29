// ফাইল পাথ: app/product/components/SlideOutPanel/SlideOutPanel.tsx
'use client';

import styles from './SlideOutPanel.module.css';

interface SlideOutPanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function SlideOutPanel({ isOpen, onClose, title, children }: SlideOutPanelProps) {
  if (!isOpen) return null;

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={`${styles.panel} ${isOpen ? styles.open : ''}`}>
        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
          <button onClick={onClose} className={styles.closeButton}>×</button>
        </div>
        <div className={styles.content}>{children}</div>
      </div>
    </>
  );
}