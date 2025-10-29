// ফাইল পাথ: app/product/info-panels/Gobike-12/TechnicalSpecifications.tsx
import styles from '../PanelStyles.module.css';

// ডেটা আপনার আগের ছবি থেকে হুবহু নেওয়া হয়েছে
const specs = [
  { label: 'Age Range', value: '2–5 years (ideal up to 6)' },
  { label: 'Max Rider Weight', value: '65kg' },
  { label: 'Frame', value: 'Treated TIG-welded 6061 Aluminum' },
  { label: 'Net Weight', value: 'Only 10.5kg with battery' },
  { label: 'Wheels', value: '12" composite wheels with premium off-road tyres' },
  { label: 'Fork', value: 'Durable steel construction' },
  { label: 'Seat Height', value: 'Adjustable (35–47cm, quick release)' },
  { label: 'Wheelbase', value: '70mm for enhanced control' },
  { label: 'Motor', value: '36V 300W brushless hub motor' },
  { label: 'Drive System', value: 'Proprietary rear hub' },
  { label: 'Speed Modes', value: 'Low (6 km/h), Medium (15 km/h), High (25 km/h)' },
  { label: 'Thermal Protection', value: 'Built-in safety for motor and controller' },
  { label: 'Braking', value: 'Rear cable disc brake – smooth & safe' },
  { label: 'Battery', value: 'Industrial-grade waterproof 36V 5.0Ah lithium-ion' },
  { label: 'Ride Time', value: 'Run time is up to 2 hours' },
  { label: 'Charge Time', value: 'Only 30–60 minutes' },
];

export default function TechnicalSpecifications() {
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