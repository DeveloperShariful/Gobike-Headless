//app/(frontend)/checkout/CheckoutClient.tsx

'use client';

import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useCallback, useReducer, useRef, useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { gql } from '@apollo/client';
import client from '@/lib/apolloClient';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie'; 
import OrderNotes from './components/OrderNotes';
import ShippingForm from './components/ShippingForm';
import OrderSummary from './components/OrderSummary';
import PaymentMethods from './components/PaymentMethods';

interface GraphQLError {
  message: string;
  [key: string]: unknown;
}

interface ApolloErrorLike {
  graphQLErrors: unknown;
}
interface ShippingFormData { firstName: string; lastName: string; address1: string; city: string; state: string; postcode: string; email: string; phone: string; }
interface ShippingRate { id: string; label: string; cost: string; }
interface AppliedCoupon { code: string; }
interface CartData { subtotal: string; total: string; shippingTotal: string; discountTotal: string; appliedCoupons: AppliedCoupon[] | null; availableShippingMethods?: { rates: ShippingRate[] }[] | null }
interface PaymentGateway { id: string; title: string; description: string; }

const GET_CHECKOUT_DATA = gql` query GetCheckoutData { cart { subtotal(format: FORMATTED) total(format: FORMATTED) shippingTotal(format: FORMATTED) discountTotal(format: FORMATTED) appliedCoupons { code } availableShippingMethods { rates { id label cost } } } } `;
const APPLY_COUPON_MUTATION = gql` mutation ApplyCoupon($input: ApplyCouponInput!) { applyCoupon(input: $input) { cart { total subtotal discountTotal appliedCoupons { code } } } } `;
const REMOVE_COUPON_MUTATION = gql` mutation RemoveCoupons($input: RemoveCouponsInput!) { removeCoupons(input: $input) { cart { total subtotal discountTotal appliedCoupons { code } } } } `;
const UPDATE_CUSTOMER_MUTATION = gql`mutation UpdateCustomerForCheckout($input: UpdateCustomerInput!) { updateCustomer(input: $input) { customer { id } } }`;
const UPDATE_SHIPPING_METHOD_MUTATION = gql`mutation UpdateShippingMethod($input: UpdateShippingMethodInput!) { updateShippingMethod(input: $input) { cart { total } } }`;

type State = { 
  customerInfo: Partial<ShippingFormData>; 
  shippingRates: ShippingRate[]; 
  selectedShipping: string; 
  selectedPaymentMethod: string; 
  cartData: CartData | null; 
  orderNotes: string; 
  addressInputStarted: boolean; 
  shipToDifferentAddress: boolean;
  shippingInfo: Partial<ShippingFormData>;
  loading: { cart: boolean; shipping: boolean; applyingCoupon: boolean; removingCoupon: boolean; order: boolean; }; 
};

type Action = 
  | { type: 'SET_CUSTOMER_INFO'; payload: Partial<ShippingFormData> }
  | { type: 'SET_SHIPPING_INFO'; payload: Partial<ShippingFormData> }
  | { type: 'SET_SELECTED_SHIPPING'; payload: string }
  | { type: 'SET_SELECTED_PAYMENT_METHOD'; payload: string }
  | { type: 'SET_ORDER_NOTES'; payload: string }
  | { type: 'SET_ADDRESS_INPUT_STARTED'; payload: boolean }
  | { type: 'SET_SHIP_TO_DIFFERENT_ADDRESS'; payload: boolean }
  | { type: 'SET_LOADING'; key: keyof State['loading']; payload: boolean } 
  | { type: 'SET_CHECKOUT_DATA'; payload: { cart: CartData } } 
  | { type: 'UPDATE_TOTALS'; payload: { shippingTotal: string; total: string } };

const initialState: State = { 
  customerInfo: {}, 
  shippingRates: [], 
  selectedShipping: '', 
  selectedPaymentMethod: 'ppcp-gateway', 
  cartData: null, 
  orderNotes: '', 
  addressInputStarted: false, 
  shipToDifferentAddress: false,
  shippingInfo: {},
  loading: { cart: true, shipping: false, applyingCoupon: false, removingCoupon: false, order: false }, 
};


function checkoutReducer(state: State, action: Action): State {
    switch (action.type) {
        case 'SET_CUSTOMER_INFO':
            return { ...state, customerInfo: { ...state.customerInfo, ...action.payload } };
        case 'SET_SHIPPING_INFO':
            return { ...state, shippingInfo: { ...state.shippingInfo, ...action.payload } };
        case 'SET_SELECTED_SHIPPING':
            return { ...state, selectedShipping: action.payload };
        case 'SET_SELECTED_PAYMENT_METHOD':
            return { ...state, selectedPaymentMethod: action.payload };
        case 'SET_ORDER_NOTES':
            return { ...state, orderNotes: action.payload };
        case 'SET_ADDRESS_INPUT_STARTED':
            return { ...state, addressInputStarted: action.payload };
        case 'SET_SHIP_TO_DIFFERENT_ADDRESS':
            return { ...state, shipToDifferentAddress: action.payload };
        case 'SET_LOADING': 
            return { ...state, loading: { ...state.loading, [action.key]: action.payload } };
        case 'SET_CHECKOUT_DATA':
            const rates = action.payload.cart?.availableShippingMethods?.[0]?.rates || [];
            const newSelectedShipping = rates.length > 0 ? rates[0].id : '';
            return { ...state, cartData: action.payload.cart, shippingRates: rates, selectedShipping: rates.some(rate => rate.id === state.selectedShipping) ? state.selectedShipping : newSelectedShipping, };
        case 'UPDATE_TOTALS':
            if (!state.cartData) return state;
            return { ...state, cartData: { ...state.cartData, shippingTotal: action.payload.shippingTotal, total: action.payload.total, }, };
        default: 
            return state;
    }
}


function isApolloError(error: unknown): boolean { return (typeof error === 'object' && error !== null && 'graphQLErrors' in error); }
const getErrorMessage = (error: unknown): string => { 
  if (isApolloError(error)) {
    const graphQLErrors = (error as ApolloErrorLike).graphQLErrors;
    if (
      Array.isArray(graphQLErrors) && 
      graphQLErrors.length > 0 &&
      typeof graphQLErrors[0] === 'object' &&
      graphQLErrors[0] !== null &&
      'message' in graphQLErrors[0] &&
      typeof (graphQLErrors[0] as GraphQLError).message === 'string'
    ) {
      return (graphQLErrors[0] as GraphQLError).message;
    }
  }
  
  if (error instanceof Error) { 
    return error.message.replace(/<[^>]*>?/gm, ''); 
  } 
  
  return 'An unexpected error occurred.'; 
};

function CheckoutClientComponent({ paymentGateways }: { paymentGateways: PaymentGateway[] }) {
  const router = useRouter();
  const { cartItems, loading: isCartContextLoading, clearCart } = useCart();
  const [state, dispatch] = useReducer(checkoutReducer, initialState);
  const { customerInfo, shippingRates, selectedShipping, selectedPaymentMethod, cartData, orderNotes, addressInputStarted, loading, shipToDifferentAddress, shippingInfo } = state;
  const [orderPlacementInProgress, setOrderPlacementInProgress] = useState(false);
  const customerInfoRef = useRef(customerInfo);
  useEffect(() => { customerInfoRef.current = customerInfo; }, [customerInfo]);

  const shippingInfoRef = useRef(shippingInfo);
  useEffect(() => { shippingInfoRef.current = shippingInfo; }, [shippingInfo]);

  const refetchCartData = useCallback(async () => { dispatch({ type: 'SET_LOADING', key: 'cart', payload: true }); try { const { data } = await client.query<{ cart: CartData }>({ query: GET_CHECKOUT_DATA, fetchPolicy: 'network-only' }); if (data?.cart) { dispatch({ type: 'SET_CHECKOUT_DATA', payload: { cart: data.cart } }); } } catch (err) {console.error("Error updating customer address:", err); toast.error('Could not refresh cart data.'); } finally { dispatch({ type: 'SET_LOADING', key: 'cart', payload: false }); } }, []);
  
  useEffect(() => { if (!isCartContextLoading && cartItems.length === 0 && !orderPlacementInProgress) router.push('/cart'); else refetchCartData(); }, [isCartContextLoading, cartItems.length, router, refetchCartData, orderPlacementInProgress]);
  
  // ★★★ আপডেটেড: Billing Address Function ★★★
  const handleAddressChange = useCallback(async (address: Partial<ShippingFormData>) => { 
    dispatch({ type: 'SET_CUSTOMER_INFO', payload: address });
    
    if (!addressInputStarted) { 
        dispatch({ type: 'SET_ADDRESS_INPUT_STARTED', payload: true });
    }

    const updatedBilling = { ...customerInfoRef.current, ...address };
    const updatedShipping = shipToDifferentAddress 
        ? shippingInfoRef.current 
        : updatedBilling;

    // চেক করা হচ্ছে আসলেই City, Postcode বা State চেঞ্জ হয়েছে কিনা
    const isShippingFieldChanged = 
        (address.city !== undefined && address.city !== customerInfoRef.current.city) ||
        (address.postcode !== undefined && address.postcode !== customerInfoRef.current.postcode) ||
        (address.state !== undefined && address.state !== customerInfoRef.current.state);

    // শুধুমাত্র যদি shipping ফিল্ড চেঞ্জ হয় এবং সবগুলো ডেটা থাকে, তবেই API কল হবে
    if (isShippingFieldChanged && updatedBilling.city && updatedBilling.postcode && updatedBilling.state) { 
        dispatch({ type: 'SET_LOADING', key: 'shipping', payload: true }); 
        try { 
            await client.mutate({ 
                mutation: UPDATE_CUSTOMER_MUTATION, 
                variables: { 
                    input: { 
                        shipping: updatedShipping, 
                        billing: updatedBilling 
                    } 
                } 
            }); 
            await refetchCartData(); 
        } catch (err) { 
            console.error("Error refetching cart data:", err); 
            toast.error('Could not calculate shipping.'); 
        } finally { 
            dispatch({ type: 'SET_LOADING', key: 'shipping', payload: false }); 
        } 
    } 
  }, [addressInputStarted, refetchCartData, shipToDifferentAddress]);

  const handleApplyCoupon = async (couponCode: string) => { if (cartData?.appliedCoupons && cartData.appliedCoupons.length > 0) { toast.error("Only one coupon can be applied per order."); return; } dispatch({ type: 'SET_LOADING', key: 'applyingCoupon', payload: true }); toast.loading('Applying coupon...'); try { await client.mutate({ mutation: APPLY_COUPON_MUTATION, variables: { input: { code: couponCode } } }); await refetchCartData(); toast.dismiss(); toast.success('Coupon applied!'); } catch (error) { toast.dismiss(); toast.error(getErrorMessage(error)); } finally { dispatch({ type: 'SET_LOADING', key: 'applyingCoupon', payload: false }); } };
  
  const handleRemoveCoupon = async (couponCode: string) => { if (loading.removingCoupon) return; dispatch({ type: 'SET_LOADING', key: 'removingCoupon', payload: true }); toast.loading('Removing coupon...'); try { await client.mutate({ mutation: REMOVE_COUPON_MUTATION, variables: { input: { codes: [couponCode] } } }); await refetchCartData(); toast.dismiss(); toast.success('Coupon removed.'); } catch (error) { toast.dismiss(); toast.error(getErrorMessage(error)); } finally { dispatch({ type: 'SET_LOADING', key: 'removingCoupon', payload: false }); } };
  
  const handleShippingSelect = (rateId: string) => {  dispatch({ type: 'SET_SELECTED_SHIPPING', payload: rateId }); const selectedRate = shippingRates.find(rate => rate.id === rateId); if (cartData && selectedRate) { const subtotal = parseFloat(cartData.subtotal.replace(/[^0-9.]/g, '')) || 0; const discount = parseFloat(cartData.discountTotal.replace(/[^0-9.]/g, '')) || 0; const shippingCost = parseFloat(selectedRate.cost) || 0; const newTotal = (subtotal - discount) + shippingCost; dispatch({ type: 'UPDATE_TOTALS', payload: { shippingTotal: `$${shippingCost.toFixed(2)}`, total: `$${newTotal.toFixed(2)}` } }); } client.mutate({ mutation: UPDATE_SHIPPING_METHOD_MUTATION, variables: { input: { shippingMethods: [rateId] } }, }).catch(err => { console.error("Failed to sync shipping method with server:", err); toast.error("Could not save shipping preference."); }); };
  
  // ★★★ আপডেটেড: Shipping Address Function ★★★
  const handleShippingAddressChange = useCallback(async (address: Partial<ShippingFormData>) => { 
    dispatch({ type: 'SET_SHIPPING_INFO', payload: address });

    const updatedShipping = { ...shippingInfoRef.current, ...address };
    const currentBilling = customerInfoRef.current;

    // চেক করা হচ্ছে আসলেই City, Postcode বা State চেঞ্জ হয়েছে কিনা
    const isShippingFieldChanged = 
        (address.city !== undefined && address.city !== shippingInfoRef.current.city) ||
        (address.postcode !== undefined && address.postcode !== shippingInfoRef.current.postcode) ||
        (address.state !== undefined && address.state !== shippingInfoRef.current.state);

    if (isShippingFieldChanged && updatedShipping.city && updatedShipping.postcode && updatedShipping.state) {
        dispatch({ type: 'SET_LOADING', key: 'shipping', payload: true });
        try {
            await client.mutate({
                mutation: UPDATE_CUSTOMER_MUTATION,
                variables: {
                    input: {
                        billing: currentBilling, 
                        shipping: updatedShipping 
                    }
                }
            });
            await refetchCartData(); 
        } catch (err) {
            console.error("Error updating shipping address:", err);
            toast.error('Could not update shipping cost.');
        } finally {
            dispatch({ type: 'SET_LOADING', key: 'shipping', payload: false });
        }
    }
  }, [refetchCartData]);

  const handleToggleShipToDifferent = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    dispatch({ type: 'SET_SHIP_TO_DIFFERENT_ADDRESS', payload: isChecked });
    if (!isChecked) {
        const billing = customerInfoRef.current;
        
        if (billing.city && billing.postcode && billing.state) {
            dispatch({ type: 'SET_LOADING', key: 'shipping', payload: true });
            try {
                await client.mutate({
                    mutation: UPDATE_CUSTOMER_MUTATION,
                    variables: {
                        input: {
                            billing: billing,
                            shipping: billing 
                        }
                    }
                });
                await refetchCartData();
            } catch (err) {
                console.error("Error syncing addresses:", err);
            } finally {
                dispatch({ type: 'SET_LOADING', key: 'shipping', payload: false });
            }
        }
    }
  };

  const handlePlaceOrder = async (paymentData?: { 
    transaction_id?: string; 
    shippingAddress?: Partial<ShippingFormData>; 
    redirect_needed?: boolean;
    paymentMethodId?: string;
    is_embedded_redirect?: boolean;
  }) => {
    
    const isExpressCheckout = !!paymentData?.shippingAddress;
    if (!isExpressCheckout && !selectedShipping) {
      toast.error("Please select a shipping method.");
      return;
    }
  
    const isBillingAddressValid = customerInfoRef.current.firstName && customerInfoRef.current.email;
    const isShippingAddressValid = !shipToDifferentAddress || (shippingInfoRef.current.firstName && shippingInfoRef.current.email);
  
    if (!paymentData?.shippingAddress && (!isBillingAddressValid || !isShippingAddressValid)) { 
        toast.error("Please fill in all required billing and shipping details."); 
        return; 
    }
  
    dispatch({ type: 'SET_LOADING', key: 'order', payload: true });
    setOrderPlacementInProgress(true);

    const affiliateId = Cookies.get('solid_affiliate_id');
    const visitId = Cookies.get('solid_affiliate_visit_id');
    const affiliateMetaData = [];
    if (affiliateId) {
        affiliateMetaData.push({ key: 'solid_affiliate_id', value: affiliateId });
    }
    if (visitId) {
        affiliateMetaData.push({ key: 'solid_affiliate_visit_id', value: visitId });
    }

    try {
        if (!cartData) {
            throw new Error("Cart data is not available.");
        }

        const billingDetails = paymentData?.shippingAddress && paymentData.shippingAddress.address1
          ? {
              firstName: paymentData.shippingAddress.firstName || '',
              lastName: paymentData.shippingAddress.lastName || '',
              address1: paymentData.shippingAddress.address1 || '',
              city: paymentData.shippingAddress.city || '',
              state: paymentData.shippingAddress.state || '',
              postcode: paymentData.shippingAddress.postcode || '',
              email: paymentData.shippingAddress.email || customerInfoRef.current.email,
              phone: paymentData.shippingAddress.phone || customerInfoRef.current.phone,
          }
          : customerInfoRef.current;
        
        const shippingDetails = shipToDifferentAddress ? shippingInfoRef.current : billingDetails;

        const orderPayload = {
            cartItems: cartItems,
            customerInfo: billingDetails,
            shippingInfo: shippingDetails,
            selectedShipping,
            shippingRates,
            appliedCoupons: cartData.appliedCoupons || [],
            orderNotes,
            selectedPaymentMethod: paymentData?.paymentMethodId || selectedPaymentMethod,
            affiliateMetaData
        };

        const response = await fetch('/api/stripe/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderPayload),
        });

        const newOrder = await response.json();

        if (!response.ok || !newOrder.success) {
            throw new Error(newOrder.error || 'Failed to create draft order before payment.');
        }
        
        // এখানে পেমেন্ট করার আগেই Order ID এবং Order Key রিটার্ন করা হচ্ছে
        // যাতে Stripe PaymentGateway বা ExpressCheckout পেমেন্ট কনফার্ম করতে পারে
        return { orderId: newOrder.wcOrderId, orderKey: newOrder.wcOrderKey };

    } catch (error) {
        toast.dismiss();
        toast.error(getErrorMessage(error));
        dispatch({ type: 'SET_LOADING', key: 'order', payload: false });
        setOrderPlacementInProgress(false);
        return null;
    }
  };

  const total = cartData?.total ? parseFloat(cartData.total.replace(/[^0-9.]/g, '')) : 0;
  const isShippingSelected = !!selectedShipping;
  if (loading.cart && !cartData) { return ( <div className="flex justify-center items-center min-h-[50vh] text-2xl"><h1 className="text-gray-700">Checkout</h1></div> ); }

  return (
    <div className="grid grid-cols-1 gap-8 w-full max-w-[1400px] mx-auto px-4 py-4 md:gap-10 lg:grid-cols-[1fr_550px] lg:gap-12">
      <div className="flex flex-col gap-8">
        <ShippingForm
            title={shipToDifferentAddress ? "Billing Details" : "Billing & Shipping Details"}
            onAddressChange={handleAddressChange}
            defaultValues={customerInfo}
        />
        
        <div className="mt-[5px] p-4 bg-[#f9f9f9] border border-[#ddd]">
            <label htmlFor="ship-to-different-address" className="flex items-center font-semibold cursor-pointer">
                <input
                    type="checkbox"
                    id="ship-to-different-address"
                    checked={shipToDifferentAddress}
                    onChange={handleToggleShipToDifferent}
                    className="mr-3 w-[18px] h-[18px]"
                />
                <span>Ship to a different address?</span>
            </label>
        </div>

        {shipToDifferentAddress && (
            <div className="mt-6">
                <ShippingForm
                    title="Shipping Details"
                    onAddressChange={handleShippingAddressChange}
                    defaultValues={shippingInfo}
                />
            </div>
        )}

        <OrderNotes notes={orderNotes} onNotesChange={(notes) => dispatch({ type: 'SET_ORDER_NOTES', payload: notes })} />
      </div>
      <div className="flex flex-col gap-8">
        <OrderSummary 
          cartItems={cartItems}
          cartData={cartData}
          onRemoveCoupon={handleRemoveCoupon}
          isRemovingCoupon={loading.removingCoupon}
          onApplyCoupon={handleApplyCoupon}
          isApplyingCoupon={loading.applyingCoupon}
          rates={shippingRates}
          selectedRateId={selectedShipping}
          onRateSelect={handleShippingSelect}
          isLoadingShipping={loading.shipping}
          addressEntered={addressInputStarted}
        />
        <PaymentMethods 
          gateways={paymentGateways}
          selectedPaymentMethod={selectedPaymentMethod} 
          onPaymentMethodChange={(method) => dispatch({ type: 'SET_SELECTED_PAYMENT_METHOD', payload: method })} 
          onPlaceOrder={handlePlaceOrder} 
          isPlacingOrder={loading.order} 
          total={total} 
          isShippingSelected={isShippingSelected} 
          customerInfo={customerInfoRef.current}
          cartItems={cartItems}
          shippingInfo={shipToDifferentAddress ? shippingInfoRef.current : customerInfoRef.current}
          selectedShipping={selectedShipping}
          shippingRates={shippingRates}
          appliedCoupons={cartData?.appliedCoupons || []}
        />
      </div>
    </div>
  );
}

export default function CheckoutClient(props: { paymentGateways: PaymentGateway[] }) {
    const [stripePromise] = useState(() => 
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY 
            ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) 
            : null
    );
    if (!stripePromise) {
        return <div className="flex justify-center items-center min-h-[50vh] text-2xl">Loading Payment Gateway...</div>;
    }
    
    return (
        <Elements stripe={stripePromise} options={{}}>
            <CheckoutClientComponent {...props} />
        </Elements>
    );
}