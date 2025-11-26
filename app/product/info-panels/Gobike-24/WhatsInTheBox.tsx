// ফাইল পাথ: app/product/info-panels/Gobike-24/WhatsInTheBox.tsx
import styles from '../PanelStyles.module.css';

const specs = [
  { label: 'What\'s in the Box', value: '1 x GoBike 24 Inch Pro E-Bike' },
  { label: 'Battery Included', value: '1 x 48V 10Ah High-Performance Lithium-ion Battery' },
  { label: 'Charger Included', value: '1 x Fast Charger (54.6V)' },
  { label: 'Tools', value: '1 x Instruction Manual + 1 x Tool Kit' },
  { label: 'Customise Your Ride', value: 'Premium Sticker Kits Available' },
  { label: 'Race Ready', value: '1 x Official GoBike Number Plate' },
  { label: 'Bonus Swag', value: '1 x FREE Official GoBike T-Shirt' },
];

export default function WhatsInTheBox() {
  return (
    <div className={styles.specTableContainer}>
      {specs.map(spec => (
        <div key={spec.label} className={styles.specRow}>
          <span className={styles.specLabel}>{spec.label}:</span>
          <span className={styles.specValue}>{spec.value}</span>
        </div>
      ))}
    </div>
  );
}