// components/TopBar.tsx
import Link from 'next/link';
import styles from './TopBar.module.css';

export default function TopBar() {
  return (
    <div className={styles.topBar}>
      <div className={styles.content}>
        <span className={styles.icon}>🎄</span>
        <span className={styles.text}>
          IN STOCK READY TO EXPRESS SHIP FOR XMAS —
          <span className={styles.highlight}> ORDER NOW AND GET A FREE GOBIKE CREW TSHIRT</span>
        </span>
        <span className={styles.icon}>🎁</span>
      </div>
    </div>
  );
}