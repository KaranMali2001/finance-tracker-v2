import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard/', '/sign-in', '/sign-up', '/api/'],
      },
    ],
    sitemap: 'https://wealth-reserve.vercel.app/sitemap.xml',
  };
}
