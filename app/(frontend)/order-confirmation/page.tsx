// app/order-confirmation/page.tsx

import { Suspense } from 'react';
import OrderConfirmationClient from './OrderConfirmationClient'; 
import styles from './OrderConfirmation.module.css'; 

export default function OrderConfirmationPage() {
  return (

    <Suspense fallback={
        <div className={styles.container}>
            <div className={styles.loader}></div>
            <h1 className={styles.title}>Loading Confirmation...</h1>
        </div>
    }>
      <OrderConfirmationClient />
    </Suspense>
  );
}