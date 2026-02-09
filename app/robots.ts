//File: app/robots.ts

import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://gobike.au';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',            
        '/cart/',           
        '/checkout/',      
        '/my-account/',    
        '/search',          
        '/admin/',  
        '/affiliate-portal/',             
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}