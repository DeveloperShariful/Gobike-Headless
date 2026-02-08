// app/product/[slug]/_components/QuantityAddToCart.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../../../../context/CartContext';
import toast from 'react-hot-toast';

interface ProductForCart {
  id: string;
  databaseId: number;
  name: string;
  price?: string | null;
  image?: string | null;
  slug: string;
}

export default function QuantityAddToCart({ product }: { product: ProductForCart }) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart, loading: isCartLoading, closeMiniCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [isBuying, setIsBuying] = useState(false);
  const router = useRouter();

  const handleAddToCart = async () => {
    setIsAdding(true);
    await addToCart(product, quantity);
    setIsAdding(false);
  };

  const handleBuyNow = async () => {
    setIsBuying(true);
    try {
      await addToCart(product, quantity);
      closeMiniCart();
      toast.dismiss();
      router.push('/checkout');
    } catch (error) {
      console.error("Failed to process 'Buy Now':", error);
      toast.dismiss();
      toast.error('Could not process order.');
      setIsBuying(false);
    }
  };

  const handleQuantityChange = (amount: number) => {
    setQuantity(prev => Math.max(1, prev + amount));
  };

  const isLoading = isCartLoading || isAdding || isBuying;

  return (
    // .actionsContainer replaced
    <div className="flex flex-col gap-2.5 w-full">
      
      {/* .quantityAndCartWrapper replaced */}
      <div className="flex w-full gap-2 mt-4">
        
        {/* .quantitySelector replaced */}
        <div className="flex items-center border border-gray-300 rounded-md">
          <button
            onClick={() => handleQuantityChange(-1)}
            disabled={isLoading || quantity <= 1}
            aria-label="Decrease quantity"
            className="bg-gray-100 border-none py-1.5 px-4 cursor-pointer text-xl disabled:bg-gray-200 disabled:cursor-not-allowed hover:bg-gray-200"
          >
            -
          </button>
          <span className="px-4 font-bold">{quantity}</span>
          <button
            onClick={() => handleQuantityChange(1)}
            disabled={isLoading}
            aria-label="Increase quantity"
            className="bg-gray-100 border-none py-1.5 px-4 cursor-pointer text-xl disabled:bg-gray-200 disabled:cursor-not-allowed hover:bg-gray-200"
          >
            +
          </button>
        </div>

        {/* .addToCartButton replaced */}
        <button
          className="flex-grow bg-black text-white border-none py-1.5 px-5 text-2xl font-bold cursor-pointer rounded-md transition-colors duration-300 ease-in-out hover:bg-gray-800 disabled:bg-[#cccccc] disabled:cursor-not-allowed"
          onClick={handleAddToCart}
          disabled={isLoading}
        >
          {isAdding ? 'Adding...' : 'Add to Cart'}
        </button>
      </div>

      {/* .buyNowButton replaced */}
      <button
        className="w-full bg-[#01d382] text-white border-none py-1.5 px-6 text-xl font-bold cursor-pointer rounded-md text-center transition-colors duration-300 ease-in-out hover:bg-[#2ee001] disabled:bg-[#cccccc] disabled:cursor-not-allowed"
        onClick={handleBuyNow}
        disabled={isLoading}
      >
        {isBuying ? 'Processing...' : 'Buy Now'}
      </button>
    </div>
  );
}