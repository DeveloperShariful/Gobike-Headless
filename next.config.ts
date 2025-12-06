/** @type {import('next').NextConfig} */
const nextConfig = {
  
  typescript: {
    ignoreBuildErrors: true,
  },
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'sharifulbuilds.com',
        pathname: '/wp-content/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'gobike.au',
        pathname: '/wp-content/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'gobikes.au',
        pathname: '/wp-content/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
        pathname: '/**', // <-- समाधान: pathname যোগ করা হয়েছে
      },
      {
        protocol: 'https',
        hostname: 'x.klarnacdn.net',
        pathname: '/**', // Klarna-এর লোগোর জন্য
      },
      {
        protocol: 'https',
        hostname: 'static.afterpay.com',
        pathname: '/**', // Afterpay-এর লোগোর জন্য
      },
    ],
  },
  
  // দ্রষ্টব্য: Partytown ("worker" strategy)-এর জন্য এখানে আর কোনো কনফিগারেশনের প্রয়োজন নেই।
};

// --- সমাধান: ES Module সিনট্যাক্স ব্যবহার করা হচ্ছে ---
export default nextConfig;