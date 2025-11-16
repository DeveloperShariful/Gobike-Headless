// ফাইল পাথ: app/product/info-panels/Gobike-16/TechnicalSpecifications.tsx
import styles from '../PanelStyles.module.css';

// ডেটা আপনার আগের ছবি থেকে হুবহু নেওয়া হয়েছে
const specs = [
    { label: 'Age Range', value: '5–9 years' },
    { label: 'Max Rider Weight', value: '65 kg' },
    { label: 'Frame', value: 'Heat-treated TIG-welded 6061 aluminum' },
    { label: 'Net Weight', value: '12 kg (with battery)' },
    { label: 'Wheels', value: '16" spoke wheels with premium off-road tires' },
    { label: 'Wheelbase', value: '82 cm for stability and control' },
    { label: 'Seat Height', value: 'Adjustable from 44 cm to 54 cm' },
    { label: 'Fork', value: 'Hydraulic adjustable fork with 80 mm travel' },
    { label: 'Handlebars Height', value: '74 cm' },
    { label: 'Motor', value: '36V–42V 700W brushless hub motor' },
    { label: 'Drive System', value: 'Proprietary hub drive' },
    { label: 'Speed Modes', value: 'Low (10 km/h), Medium (25 km/h), High (45km/h)' },
    { label: 'Battery', value: 'Industrial-grade waterproof 36V-42V 5.0Ah lithium-ion' },
    { label: 'Ride Time', value: 'Run time is up to 2 hours' },
    { label: 'Charge Time', value: 'around 1-2 hours ' },
    { label: 'Braking System', value: 'Hydraulic brakes on front and rear' },
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