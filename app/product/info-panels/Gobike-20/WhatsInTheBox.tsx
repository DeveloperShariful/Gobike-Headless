// ফাইল পাথ: app/product/info-panels/Gobike-20/WhatsInTheBox.tsx
import Image from 'next/image';
import styles from '../PanelStyles.module.css';

const items = [
    { name: 'GoBike 20" E-Bike Frame', img: 'https://gobikes.au/wp-content/uploads/2025/07/20Inch-product-final-1-1.webp' },
    { name: '1 Battery', img: 'https://gobikes.au/wp-content/uploads/2025/02/1734722202188-scaled-1-1.webp' },
    { name: '1 Charger', img: 'https://gobikes.au/wp-content/uploads/2025/02/1734721303241-scaled-1-1.webp' },
    { name: 'User Manual', img: 'https://gobikes.au/wp-content/uploads/2025/10/Usermanual.webp' },
    { name: 'T-Shirt', img: 'https://gobikes.au/wp-content/uploads/2025/10/Tshirt.jpg' },
];

export default function WhatsInTheBox() {
  return (
    <div className={styles.boxGrid}>
      {items.map(item => (
        <div key={item.name} className={styles.boxItem}>
          <div className={styles.boxImageWrapper}>
             <Image src={item.img} alt={item.name} width={150} height={150} />
          </div>
          <span>{item.name}</span>
        </div>
      ))}
    </div>
  );
}