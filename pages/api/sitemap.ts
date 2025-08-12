import { getServerSideSitemap } from 'next-sitemap';

const fields = [
  {
    loc: 'https://yourdomain.com/',
    lastmod: new Date().toISOString(),
    changefreq: 'daily' as const,
    priority: 1.0,
  },
];

export default getServerSideSitemap(fields);
