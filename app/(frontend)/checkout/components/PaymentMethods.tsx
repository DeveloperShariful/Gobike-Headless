// app/(frontend)/checkout/components/PaymentMethods.tsx

'use client';
import Image from 'next/image';
import React, { useRef } from 'react';
import ExpressCheckouts from './ExpressCheckouts';
import PayPalPaymentGateway from './PayPalPaymentGateway';
import StripePaymentGateway from './StripePaymentGateway'; 
import PayPalMessage from './PayPalMessage';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';

interface PaymentGateway { id: string; title: string; description: string; enabled?: boolean; }
interface CustomerInfo { firstName?: string; lastName?: string; email?: string; phone?: string; address1?: string; city?: string; state?: string; postcode?: string; }
export interface ShippingFormData { firstName: string; lastName: string; address1: string; city: string; state: string; postcode: string; email: string; phone: string; }
interface ShippingRate { id: string; label: string; cost: string; }

interface PaymentMethodsProps {
  gateways: PaymentGateway[];
  selectedPaymentMethod: string;
  onPaymentMethodChange: (methodId: string) => void;
  onPlaceOrder: (paymentData?: { transaction_id?: string; shippingAddress?: Partial<ShippingFormData>; redirect_needed?: boolean; paymentMethodId?: string; }) => Promise<{ orderId: number; orderKey: string } | void | null>;
  isPlacingOrder: boolean;
  isShippingSelected: boolean;
  total: number;
  customerInfo: CustomerInfo;
  cartItems: any[];
  shippingInfo?: CustomerInfo;
  selectedShipping: string;
  shippingRates: ShippingRate[];
  appliedCoupons: any[];
}

export default function PaymentMethods(props: PaymentMethodsProps) {
  const { 
    gateways, selectedPaymentMethod, onPaymentMethodChange, total, onPlaceOrder, 
    isPlacingOrder, isShippingSelected, customerInfo, cartItems, shippingInfo, 
    selectedShipping, shippingRates, appliedCoupons 
  } = props;

  const stripeFormRef = useRef<HTMLFormElement>(null);
  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  const initialOptions = {
    clientId: paypalClientId || "",
    currency: "AUD",
    intent: "capture",
    components: "buttons,messages,googlepay",
  };

  const getGatewayIcon = (id: string): React.ReactNode => {
    if (id.includes('ppcp-gateway')) return <Image src="https://www.paypalobjects.com/webstatic/mktg/Logo/pp-logo-100px.png" alt="PayPal" width={80} height={20} className="h-6 w-auto" unoptimized />;
    if (id.includes('klarna')) return <Image src="https://x.klarnacdn.net/payment-method/assets/badges/generic/klarna.svg" alt="Klarna" width={50} height={20} className="h-6 w-auto" />;
    if (id.includes('afterpay')) return <Image src="https://static.afterpay.com/integration/logo-afterpay-colour.svg" alt="Afterpay" width={80} height={20} className="h-6 w-auto" unoptimized />;
    
    // ★★★ Zip Pay এর লোগো অ্যাড করা হলো ★★★
    if (id.includes('zip')) return <Image src="https://gobikes.au/wp-content/uploads/2026/05/Zip-Pay-Logo.webp" alt="Zip Pay" width={50} height={20} className="h-6 w-auto" unoptimized />;
    
    if (id.includes('stripe')) return (<span className="flex items-center gap-1"><Image src="https://gobikes.au/wp-content/uploads/2026/05/Credit-Card-Icons.webp" alt="Visa" width={300} height={200} className="h-7 w-auto rounded-[5px] md:h-[28px]" style={{ width: 'auto' }} /></span>);
    return null;
  };

  const handlePlaceOrderClick = () => {
    if (selectedPaymentMethod.includes('stripe') && stripeFormRef.current) {
      stripeFormRef.current.requestSubmit();
    } else {
      onPlaceOrder();
    }
  };

  const isPayPalSelected = selectedPaymentMethod.includes('ppcp-gateway');
  
  // ১. API থেকে আসা ডেটা ফিল্টার করা
  const availableGateways = gateways.filter(gateway => {
    if (gateway.id === 'stripe_link') return false;
    if ((gateway.id.includes('afterpay_clearpay') || gateway.id.includes('klarna')) && total > 2000) return false;
    return true;
  });

  // ২. ★★★ জোর করে (Forcefully) Zip Pay অ্যাড করা ★★★
  const hasStripe = availableGateways.some(g => g.id === 'stripe');
  const hasZip = availableGateways.some(g => g.id === 'stripe_zip');

  // যদি Stripe কার্ড অপশন থাকে কিন্তু Zip না থাকে, তবে ম্যানুয়ালি Zip ঢুকিয়ে দিচ্ছি
  if (hasStripe && !hasZip) {
      availableGateways.push({
          id: 'stripe_zip',
          title: 'Zip Pay',
          description: 'Own it now, pay later with Zip Pay.',
          enabled: true
      });
  }

  return (
    <PayPalScriptProvider options={initialOptions}>
      <div className="w-full flex flex-col gap-2.5">
      <div className="w-full">
        <ExpressCheckouts 
            total={total} 
            onOrderPlace={onPlaceOrder} 
            isShippingSelected={isShippingSelected}
            cartItems={cartItems}
            customerInfo={customerInfo}
            selectedShipping={selectedShipping}
            shippingRates={shippingRates}
            appliedCoupons={appliedCoupons} 
        />
      </div>
      
      <PayPalMessage total={total} />
      
      <div className="border border-[#e0e0e0] rounded-lg overflow-hidden flex flex-col">
        {availableGateways.map(gateway => (
          <div key={gateway.id} className="border-b border-[#e0e0e0] last:border-b-0">
            <div 
                className="flex items-center p-[18px_8px] cursor-pointer bg-[#f9f9f9] transition-colors duration-200 hover:bg-[#f0f0f0]" 
                onClick={() => onPaymentMethodChange(gateway.id)}
            >
              <input type="radio" id={gateway.id} name="payment_method" value={gateway.id} checked={selectedPaymentMethod === gateway.id} readOnly className="w-[18px] h-[18px] mr-[15px] shrink-0 accent-[#ff0000]" />
              <label htmlFor={gateway.id} className="font-semibold text-base grow cursor-pointer">{gateway.title}</label>
              <div className="ml-[15px]">
                {getGatewayIcon(gateway.id)}
              </div>
            </div>
            
            {/* যেহেতু 'stripe_zip'-এর ভেতরে 'stripe' শব্দটি আছে, তাই এটি অটোমেটিক StripePaymentGateway কে লোড করবে */}
            {selectedPaymentMethod === gateway.id && gateway.id.includes('stripe') && (
              <div className="p-[10px_5px_5px_5px] bg-[#f9f9f9] border-t border-[#e0e0e0]">
                <StripePaymentGateway 
                    ref={stripeFormRef} 
                    selectedPaymentMethod={selectedPaymentMethod} 
                    onPlaceOrder={onPlaceOrder} 
                    customerInfo={customerInfo} 
                    total={total}
                    cartItems={cartItems}
                    shippingInfo={shippingInfo}
                    selectedShipping={selectedShipping}
                    shippingRates={shippingRates}
                    appliedCoupons={appliedCoupons} 
                />
              </div>
            )}
            {selectedPaymentMethod === gateway.id && !gateway.id.includes('stripe') && gateway.description && (
               <div className="p-[10px_5px_5px_5px] bg-[#f9f9f9] border-t border-[#e0e0e0]">
                   <div className="w-full">
                       <p className="text-sm text-[#555] leading-normal m-0" dangerouslySetInnerHTML={{ __html: gateway.description }} />
                   </div>
               </div>
            )}
          </div>
        ))}
      </div>
      <div className="w-full mt-2.5">
        {isPayPalSelected ? (
          <div className="min-h-[150px]">
            <PayPalPaymentGateway
             total={total}
             isPlacingOrder={isPlacingOrder} 
             onPlaceOrder={onPlaceOrder} 
             isShippingSelected={isShippingSelected} 
             cartItems={cartItems}
             customerInfo={customerInfo}
             shippingInfo={shippingInfo}
             selectedShipping={selectedShipping}
             shippingRates={shippingRates}
             appliedCoupons={appliedCoupons}
             />
          </div>
        ) : (
          selectedPaymentMethod && (
            <button
              onClick={handlePlaceOrderClick}
              disabled={isPlacingOrder || !isShippingSelected}
              className="w-full p-3.5 bg-[#1a1a1a] text-white border-none rounded-lg text-base font-semibold cursor-pointer mt-5 transition-colors duration-200 hover:bg-[#333] disabled:bg-[#cccccc] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isPlacingOrder ? 'Processing...' : `Place Order`}
            </button>
          )
        )}
      </div>
    </div>
    </PayPalScriptProvider>
  );
}