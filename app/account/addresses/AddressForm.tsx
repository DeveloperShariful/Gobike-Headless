// app/account/addresses/AddressForm.tsx
'use client'; 

import { useFormState, useFormStatus } from 'react-dom';
import styles from './addresses.module.css'; // ★ লোকাল CSS ইম্পোর্ট

// Address টাইপ (অপরিবর্তিত)
type Address = {
  firstName: string; lastName: string; company: string | null; address1: string;
  address2: string | null; city: string; state: string | null;
  postcode: string; country: string; email?: string; phone?: string;
};

// সার্ভার অ্যাকশন স্টেট-এর টাইপ (অপরিবর্তিত)
type UpdateActionState = {
  error?: string;
  success?: boolean;
};

// সাবমিট বাটন
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={styles.saveButton} disabled={pending}>
      {pending ? 'Saving...' : 'Save Addresses'}
    </button>
  );
}

// --- মূল ফর্ম কম্পোনেন্ট ---
export default function AddressForm({
  addresses,
  updateAction,
}: {
  addresses: { billing: Address; shipping: Address };
  updateAction: (
    prevState: UpdateActionState,
    formData: FormData
  ) => Promise<UpdateActionState>;
}) {
  const initialState: UpdateActionState = {};
  const [state, formAction] = useFormState(updateAction, initialState);

  return (
    <form action={formAction}>
      {/* ★ ফর্ম গ্রিড লেআউট */}
      <div className={styles.formGrid}>
        
        {/* ★ সাকসেস বা এরর মেসেজ গ্রিডের ভেতরে */}
        {state.success && (
          <p className={styles.successMessage}>Addresses saved successfully!</p>
        )}
        {state.error && <p className={styles.errorMessage}>{state.error}</p>}

        {/* --- বিলিং কলাম --- */}
        <div className={styles.addressColumn}>
          <h3>Billing Address</h3>
          
          <div className={styles.formGroup}>
            <label htmlFor="billing_firstName" className={styles.label}>First Name:</label>
            <input
              id="billing_firstName"
              name="billing_firstName"
              className={styles.formInput}
              defaultValue={addresses.billing.firstName || ''}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="billing_lastName" className={styles.label}>Last Name:</label>
            <input
              id="billing_lastName"
              name="billing_lastName"
              className={styles.formInput}
              defaultValue={addresses.billing.lastName || ''}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="billing_address1" className={styles.label}>Address 1:</label>
            <input
              id="billing_address1"
              name="billing_address1"
              className={styles.formInput}
              defaultValue={addresses.billing.address1 || ''}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="billing_city" className={styles.label}>City:</label>
            <input
              id="billing_city"
              name="billing_city"
              className={styles.formInput}
              defaultValue={addresses.billing.city || ''}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="billing_postcode" className={styles.label}>Postcode:</label>
            <input
              id="billing_postcode"
              name="billing_postcode"
              className={styles.formInput}
              defaultValue={addresses.billing.postcode || ''}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="billing_country" className={styles.label}>Country Code (e.g., AU):</label>
            <input
              id="billing_country"
              name="billing_country"
              className={styles.formInput}
              defaultValue={addresses.billing.country || ''}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="billing_email" className={styles.label}>Email:</label>
            <input
              id="billing_email"
              name="billing_email"
              type="email"
              className={styles.formInput}
              defaultValue={addresses.billing.email || ''}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="billing_phone" className={styles.label}>Phone:</label>
            <input
              id="billing_phone"
              name="billing_phone"
              type="tel"
              className={styles.formInput}
              defaultValue={addresses.billing.phone || ''}
              required
            />
          </div>
        </div>

        {/* --- শিপিং কলাম --- */}
        <div className={styles.addressColumn}>
          <h3>Shipping Address</h3>

          <div className={styles.formGroup}>
            <label htmlFor="shipping_firstName" className={styles.label}>First Name:</label>
            <input
              id="shipping_firstName"
              name="shipping_firstName"
              className={styles.formInput}
              defaultValue={addresses.shipping.firstName || ''}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="shipping_lastName" className={styles.label}>Last Name:</label>
            <input
              id="shipping_lastName"
              name="shipping_lastName"
              className={styles.formInput}
              defaultValue={addresses.shipping.lastName || ''}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="shipping_address1" className={styles.label}>Address 1:</label>
            <input
              id="shipping_address1"
              name="shipping_address1"
              className={styles.formInput}
              defaultValue={addresses.shipping.address1 || ''}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="shipping_city" className={styles.label}>City:</label>
            <input
              id="shipping_city"
              name="shipping_city"
              className={styles.formInput}
              defaultValue={addresses.shipping.city || ''}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="shipping_postcode" className={styles.label}>Postcode:</label>
            <input
              id="shipping_postcode"
              name="shipping_postcode"
              className={styles.formInput}
              defaultValue={addresses.shipping.postcode || ''}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="shipping_country" className={styles.label}>Country Code (e.g., AU):</label>
            <input
              id="shipping_country"
              name="shipping_country"
              className={styles.formInput}
              defaultValue={addresses.shipping.country || ''}
              required
            />
          </div>
        </div>
      </div>

      {/* --- সাবমিট বাটন (গ্রিডের বাইরে) --- */}
      <div className={styles.submitRow}>
        <SubmitButton />
      </div>
    </form>
  );
}