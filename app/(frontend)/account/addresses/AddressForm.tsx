// app/account/addresses/AddressForm.tsx
'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

type Address = {
  firstName?: string;
  lastName?: string;
  company?: string | null;
  address1?: string;
  address2?: string | null;
  city?: string;
  state?: string | null;
  postcode?: string;
  country?: string;
  email?: string;
  phone?: string;
};

type AddressesProps = {
  billing?: Address | null;  // null হতে পারে
  shipping?: Address | null; // null হতে পারে
};

type UpdateActionState = {
  error?: string;
  success?: boolean;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button 
      type="submit" 
      disabled={pending}
      className="inline-block px-6 py-3 bg-[#007bff] text-white font-semibold rounded-md hover:bg-[#0056b3] transition-colors disabled:bg-[#ccc] disabled:cursor-not-allowed mt-4"
    >
      {pending ? 'Saving Addresses...' : 'Save Addresses'}
    </button>
  );
}

export default function AddressForm({
  addresses,
  updateAction,
}: {
  addresses: AddressesProps;
  updateAction: (prevState: any, formData: FormData) => Promise<UpdateActionState>;
}) {
  const initialState: UpdateActionState = {};
  const [state, formAction] = useActionState(updateAction, initialState);

  // ★★★ ফিক্স: ডাটা না থাকলে খালি অবজেক্ট ধরে নেওয়া হবে, যাতে অ্যাপ ক্র্যাশ না করে ★★★
  const billing = addresses?.billing || {};
  const shipping = addresses?.shipping || {};

  return (
    <form action={formAction}>
      {state.success && (
        <div className="mb-4 p-4 bg-[#d4edda] text-[#155724] border border-[#c3e6cb] rounded">
          Addresses updated successfully!
        </div>
      )}
      {state.error && (
        <div className="mb-4 p-4 bg-[#f8d7da] text-[#721c24] border border-[#f5c6cb] rounded">
          {state.error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Billing Address Section */}
        <div className="bg-[#fafafa] p-6 rounded-lg border border-[#eee]">
          <h3 className="text-xl font-bold mb-4 text-[#333] border-b pb-2">Billing Address</h3>
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">First Name</label>
              {/* ডাটা রিড করার সময় সেফটি চেক (|| '') দেওয়া হলো */}
              <input name="billing_firstName" defaultValue={billing.firstName || ''} required className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Last Name</label>
              <input name="billing_lastName" defaultValue={billing.lastName || ''} required className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Email</label>
              <input name="billing_email" type="email" defaultValue={billing.email || ''} required className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Phone</label>
              <input name="billing_phone" type="tel" defaultValue={billing.phone || ''} className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Street Address</label>
              <input name="billing_address1" defaultValue={billing.address1 || ''} required className="w-full p-2 border rounded mb-2" placeholder="House number and street name" />
              <input name="billing_address2" defaultValue={billing.address2 || ''} className="w-full p-2 border rounded" placeholder="Apartment, suite, unit, etc. (optional)" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">City</label>
              <input name="billing_city" defaultValue={billing.city || ''} required className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Postcode / ZIP</label>
              <input name="billing_postcode" defaultValue={billing.postcode || ''} required className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Country</label>
              <input name="billing_country" defaultValue={billing.country || ''} required className="w-full p-2 border rounded" />
            </div>
          </div>
        </div>

        {/* Shipping Address Section */}
        <div className="bg-[#fafafa] p-6 rounded-lg border border-[#eee]">
          <h3 className="text-xl font-bold mb-4 text-[#333] border-b pb-2">Shipping Address</h3>
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">First Name</label>
              <input name="shipping_firstName" defaultValue={shipping.firstName || ''} required className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Last Name</label>
              <input name="shipping_lastName" defaultValue={shipping.lastName || ''} required className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Street Address</label>
              <input name="shipping_address1" defaultValue={shipping.address1 || ''} required className="w-full p-2 border rounded mb-2" placeholder="House number and street name" />
              <input name="shipping_address2" defaultValue={shipping.address2 || ''} className="w-full p-2 border rounded" placeholder="Apartment, suite, unit, etc. (optional)" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">City</label>
              <input name="shipping_city" defaultValue={shipping.city || ''} required className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Postcode / ZIP</label>
              <input name="shipping_postcode" defaultValue={shipping.postcode || ''} required className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Country</label>
              <input name="shipping_country" defaultValue={shipping.country || ''} required className="w-full p-2 border rounded" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <SubmitButton />
      </div>
    </form>
  );
}