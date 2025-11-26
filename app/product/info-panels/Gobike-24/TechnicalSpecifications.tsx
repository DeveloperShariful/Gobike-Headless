// ফাইল পাথ: app/product/info-panels/Gobike-24/TechnicalSpecifications.tsx
import styles from '../PanelStyles.module.css';

const specs = [
    { label: 'Age Range', value: '13+ years to Adults' }, // Updated for 24" size
    { label: 'Max Load', value: '120 kg' }, // Standard for this frame size
    { label: 'Frame', value: '6061 Full Aluminum frame w/proprietary shaped tubes' },
    { label: 'Net Weight', value: '23.0kgs with battery' },
    { label: 'Wheel Size', value: '24" x 2.60" KENDA Fat off-road tires' },
    { label: 'Wheelbase', value: '123 cm for pro-level stability' },
    { label: 'Seat Height', value: 'Adjustable (74 cm to 84 cm)' },
    { label: 'Front Fork', value: 'TIM Double Shoulders Hydraulic adjustable Fork (80mm travel)' },
    { label: 'Rear Shock', value: 'FASTACE 190mm air adjustable shock' },
    { label: 'Motor', value: '48V 1500W Alloy brushless hub Motor (Thermal protection)' },
    { label: 'Speed Modes', value: 'Low (17km/h), Medium (35km/h), High (50km/h)' },
    { label: 'Top Speed', value: 'Up to 31 mph (50 km/h)' },
    { label: 'Battery', value: '48V 10AH-18650 Lithium-ion (Removable)' },
    { label: 'Ride Time', value: '15-30km range (approx. 60-90 mins dependent on terrain)' },
    { label: 'Charge Time', value: '2-4 hours (54.6V/2.0A Charger)' },
    { label: 'Brakes', value: 'TIM Brand Hydraulic Disc Brakes (Front & Rear)' },
    { label: 'Display', value: 'WUXING Brand DZ50' },
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