// components/TopBar.tsx
import Link from 'next/link';
import styles from './TopBar.module.css';

export default function TopBar() {
  return (
    <div className={styles.topBar}>
      <div className={styles.content}>
        <span className={styles.text}> 
          ALL ORDERS WILL LEAVE WAREHOUSE ON 29TH OF DECEMBER FROM NEW STOCK
          <span className={styles.highlight}> ORDER NOW AND GET A FREE GOBIKE CREW TSHIRT</span>
        </span>
      </div>
    </div>
  );
}