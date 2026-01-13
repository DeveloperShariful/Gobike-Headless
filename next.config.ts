/** @type {import('next').NextConfig} */
const nextConfig = {
  
  typescript: {
    ignoreBuildErrors: true,
  },
  
  experimental: {
    optimizePackageImports: [
      'react-icons',
      'react-select',
      'framer-motion',
      'lodash',
      'date-fns',
      '@headlessui/react'
    ],
  },
  
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'sharifulbuilds.com', pathname: '/wp-content/uploads/**' },
      { protocol: 'https', hostname: 'gobike.au', pathname: '/wp-content/uploads/**' },
      { protocol: 'https', hostname: 'gobikes.au', pathname: '/wp-content/uploads/**' },
      { protocol: 'https', hostname: 'i.ytimg.com', pathname: '/**' },
      { protocol: 'https', hostname: 'x.klarnacdn.net', pathname: '/**' },
      { protocol: 'https', hostname: 'static.afterpay.com', pathname: '/**' },
    ],
  },
};

export default nextConfig;