import { SitemapStream, streamToPromise } from 'sitemap';
import { writeFileSync } from 'fs';

const sitemap = new SitemapStream({ hostname: 'https://decorizz.com' });

sitemap.write({ url: '/', changefreq: 'daily', priority: 1.0 });
sitemap.write({ url: '/shop', changefreq: 'daily', priority: 0.9 });

sitemap.end();

streamToPromise(sitemap).then(data => {
  writeFileSync('./public/sitemap.xml', data.toString());
});
