// ফাইল পাথ: app/product/productInfoPanelsMap.ts
import { ComponentType } from 'react';

// === সম্পূর্ণ এবং সঠিক Product ইন্টারফেস ===
// এই ইন্টারফেসটি ProductClient.tsx থেকে আনা হয়েছে যাতে টাইপ সামঞ্জস্যপূর্ণ থাকে।
interface ImageNode { sourceUrl: string; }
interface Product {
  id: string;
  databaseId: number;
  slug: string;
  name: string;
  description: string;
  shortDescription?: string;
  image?: ImageNode;
  galleryImages: { nodes: ImageNode[]; };
  price?: string;
  onSale: boolean;
  regularPrice?: string;
  salePrice?: string;
  stockStatus?: string | null;
  stockQuantity?: number | null;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  // প্রয়োজনে এখানে আরও প্রোপার্টি যোগ করা যাবে
}

// === GoBike 16 Panels ===
import TechSpec16 from './info-panels/Gobike-16/TechnicalSpecifications';
import InTheBox16 from './info-panels/Gobike-16/WhatsInTheBox';

// === GoBike 12 Panels ===
import TechSpec12 from './info-panels/Gobike-12/TechnicalSpecifications';
import InTheBox12 from './info-panels/Gobike-12/WhatsInTheBox';

// === GoBike 20 Panels ===
import TechSpec20 from './info-panels/Gobike-20/TechnicalSpecifications';
import InTheBox20 from './info-panels/Gobike-20/WhatsInTheBox';

// === Common Panels ===
import PaymentMethods from './info-panels/Common/PaymentMethods';

// PanelConfig ইন্টারফেস এখন সঠিক Product টাইপ ব্যবহার করবে
interface PanelConfig {
  id: string;
  label: string;
  component: ComponentType<{ product: Product }>;
}

export const productInfoPanelsMap: { [key: string]: PanelConfig[] } = {
  
  // --- GoBike 16 ---
  'ebike-for-sale-16-inch-gobike-ages-5-9': [
    { id: 'specs16', label: 'TECHNICAL SPECIFICATIONS', component: TechSpec16 },
    { id: 'box16', label: "WHAT'S IN THE BOX", component: InTheBox16 },
    { id: 'payment16', label: 'PAYMENT METHODS', component: PaymentMethods },
  ],
  
  // --- GoBike 12 ---
  'ebike-for-kids-12-inch-electric-bike-ages-2-5': [
    { id: 'specs12', label: 'TECHNICAL SPECIFICATIONS', component: TechSpec12 },
    { id: 'box12', label: "WHAT'S IN THE BOX", component: InTheBox12 },
    { id: 'payment12', label: 'PAYMENT METHODS', component: PaymentMethods },
  ],

  // --- GoBike 20 ---
  '20-inch-electric-bikes-for-sale-ebike-for-kids': [
    { id: 'specs20', label: 'TECHNICAL SPECIFICATIONS', component: TechSpec20 },
    { id: 'box20', label: "WHAT'S IN THE BOX", component: InTheBox20 },
    { id: 'payment20', label: 'PAYMENT METHODS', component: PaymentMethods },
  ],
  
};