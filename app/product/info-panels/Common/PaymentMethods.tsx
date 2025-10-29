import Image from 'next/image';
import styles from '../PanelStyles.module.css'; // আমরা কমন স্টাইল ফাইলটিই ব্যবহার করব

export default function PaymentMethods() {
  return (
    <div className={styles.paymentContainer}>
      <h4>100% Secure & Trusted</h4>
      <p>We accept all major credit cards and payment providers for a safe and secure checkout process.</p>
      <div className={styles.paymentGrid}>
        <Image 
          src="https://gobikes.au/wp-content/uploads/2018/07/trust-symbols_b-1.jpg" 
          alt="Guaranteed Safe Checkout Methods" 
          width={400} 
          height={40} 
          style={{ objectFit: 'contain', width: '100%', height: 'auto' }}
        />
      </div>
    </div>
  );
}