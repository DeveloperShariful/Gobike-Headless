
import styles from '../PanelStyles.module.css';

const specs = [
  { label: 'What\'s in the Box', value: '1 x GoBike 12 E-Bike' }, // "Bike"
  { label: 'Battery Included', value: '1 x 36V 5.0Ah Quick-Swap Battery' }, // "Battery"
  { label: 'Charger Included', value: '1 x AU-Spec Fast Charger' }, // "Charger"
  { label: 'Customise Your Ride', value: '7 x Different Colour Sticker Kits' }, // "7 Different colour sticker kits!"
  { label: 'Race Ready', value: '1 x Official GoBike Number Plate' }, // "Number Plate"
  { label: 'Bonus Swag', value: '1 x FREE Official GoBike T-Shirt' }, // "Tshirt"
  { label: 'Get Started Kit', value: 'Assembly Toolkit & User Guide' }, // "Toolkit" & "User Guide"
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