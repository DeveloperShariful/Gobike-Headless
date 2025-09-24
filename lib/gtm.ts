// --- টাইপ ডেফিনিশন ---
// এটি নিশ্চিত করে যে window অবজেক্টের উপর dataLayer থাকলেও TypeScript কোনো এরর দেবে না
type WindowWithDataLayer = Window & {
  dataLayer: Record<string, unknown>[];
};

// window অবজেক্টটিকে নতুন টাইপ দিয়ে ঘোষণা করা হচ্ছে
declare const window: WindowWithDataLayer;


// --- ই-কমার্স আইটেমের জন্য একটি সাধারণ টাইপ ---
interface GTMProduct {
    item_name: string;
    item_id: number | string;
    price: number;
    quantity: number;
    item_category?: string; // ঐচ্ছিক
    item_brand?: string;    // ঐচ্ছিক
}


// ==========================================================
// স্ট্যান্ডার্ড ইভেন্টগুলো
// ==========================================================

/**
 * একটি সাধারণ Pageview ইভেন্ট পাঠায়।
 * @param url - বর্তমান পেজের URL
 */
export const gtmPageView = (url: string) => {
  if (typeof window.dataLayer !== "undefined") {
    window.dataLayer.push({
      event: 'page_view', // Google Analytics 4-এর জন্য 'page_view' ব্যবহার করা ভালো
      page_path: url,
    });
  } else {
    console.log({
        event: 'page_view',
        page_path: url,
    });
  }
};


// ==========================================================
// ই-কমার্স ইভেন্টগুলো
// ==========================================================

/**
 * যখন কোনো ব্যবহারকারী একটি প্রোডাক্টের বিস্তারিত দেখেন।
 * @param item - দেখা প্রোডাক্টটির বিস্তারিত তথ্য
 */
export const gtmViewItem = (item: GTMProduct) => {
    if (typeof window.dataLayer !== "undefined") {
        window.dataLayer.push({
            event: 'view_item',
            ecommerce: {
                currency: 'AUD',
                value: item.price,
                items: [item]
            }
        });
    } else {
        console.log({
            event: 'view_item',
            ecommerce: {
                currency: 'AUD',
                value: item.price,
                items: [item]
            }
        });
    }
};

/**
 * যখন কোনো ব্যবহারকারী একটি প্রোডাক্ট কার্টে যোগ করেন।
 * @param item - কার্টে যোগ করা প্রোডাক্টটির তথ্য
 */
export const gtmAddToCart = (item: GTMProduct) => {
    if (typeof window.dataLayer !== "undefined") {
        window.dataLayer.push({
            event: 'add_to_cart',
            ecommerce: {
                currency: 'AUD',
                value: item.price * item.quantity,
                items: [item]
            }
        });
    } else {
        console.log({
            event: 'add_to_cart',
            ecommerce: {
                currency: 'AUD',
                value: item.price * item.quantity,
                items: [item]
            }
        });
    }
};


/**
 * যখন কোনো ব্যবহারকারী কার্ট থেকে একটি প্রোডাক্ট মুছে ফেলেন।
 * @param item - মুছে ফেলা প্রোডাক্টটির তথ্য
 */
export const gtmRemoveFromCart = (item: GTMProduct) => {
    if (typeof window.dataLayer !== "undefined") {
        window.dataLayer.push({
            event: 'remove_from_cart',
            ecommerce: {
                currency: 'AUD',
                value: item.price * item.quantity,
                items: [item]
            }
        });
    } else {
        console.log({
            event: 'remove_from_cart',
            ecommerce: {
                currency: 'AUD',
                value: item.price * item.quantity,
                items: [item]
            }
        });
    }
};


/**
 * যখন কোনো ব্যবহারকারী কার্ট পেজটি দেখেন।
 * @param items - কার্টে থাকা সমস্ত প্রোডাক্টের তালিকা
 */
export const gtmViewCart = (items: GTMProduct[]) => {
    const totalValue = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    if (typeof window.dataLayer !== "undefined") {
        window.dataLayer.push({
            event: 'view_cart',
            ecommerce: {
                currency: 'AUD',
                value: totalValue,
                items: items
            }
        });
    } else {
        console.log({
            event: 'view_cart',
            ecommerce: {
                currency: 'AUD',
                value: totalValue,
                items: items
            }
        });
    }
};
export const gtmBeginCheckout = (items: GTMProduct[]) => {
    const totalValue = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    if (typeof window.dataLayer !== "undefined") {
        window.dataLayer.push({
            event: 'begin_checkout',
            ecommerce: {
                currency: 'AUD',
                value: totalValue,
                items: items
            }
        });
    }
};