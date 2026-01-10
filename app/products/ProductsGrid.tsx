// app/products/ProductsGrid.tsx
'use client'; 

import ProductCard from './ProductCard';
// import styles from './products.module.css'; // CSS Module সরানো হয়েছে

interface Product {
  id: string;
  databaseId: number;
  name: string;
  slug: string;
  image?: { sourceUrl: string };
  price?: string;
  onSale: boolean;
  salePrice?: string;
  regularPrice?: string;
  averageRating?: number;
  reviewCount?: number;
}

interface ProductsGridProps {
    products: Product[];
}

export default function ProductsGrid({ products }: ProductsGridProps) {
    if (!products || products.length === 0) {
        return <p className="text-center py-10 text-gray-500 text-xl">No products found for this category.</p>;
    }

    return (
        // Bikes/Spare Parts পেজের মতো গ্রিড লেআউট
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {products.map((product) => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    );
}