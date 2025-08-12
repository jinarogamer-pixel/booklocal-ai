import { getServerSideSitemap } from 'next-sitemap';

export default async function handler(ctx: any) {
  // Example: Add your dynamic URLs here
  const fields = [
    {
      loc: 'https://yourdomain.com/',
      lastmod: new Date().toISOString(),
      changefreq: 'daily',
      priority: 1.0,
    },
  ];
  return getServerSideSitemap(ctx, fields);
}
