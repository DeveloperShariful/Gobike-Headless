// components/TopBar.tsx
import Link from 'next/link';
import styles from './TopBar.module.css';

export default function TopBar() {
  return (
    <div className={styles.topBar}>
      <div className={styles.content}>
        <span className={styles.text}> 
          Same-day dispatch. Fast Australia-wide shipping.
          <span className={styles.highlight}> ORDER NOW AND GET A FREE GOBIKE CREW TSHIRT</span>
        </span>
      </div>
    </div>
  );
}