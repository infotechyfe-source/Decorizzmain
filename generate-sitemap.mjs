import { SitemapStream, streamToPromise } from 'sitemap'
import { writeFileSync } from 'fs'

const baseUrl = 'https://decorizz.com'

const sitemap = new SitemapStream({ hostname: baseUrl })

const today = new Date().toISOString()

// 🔹 Static Pages
const pages = [
  { url: '/', changefreq: 'daily', priority: 1.0 },
  { url: '/shop', changefreq: 'daily', priority: 0.9 },
  { url: '/spiritual-art-gallery', changefreq: 'weekly', priority: 0.8 },
  { url: '/new-art-gallery', changefreq: 'weekly', priority: 0.8 },
  { url: '/acrylic-art-gallery', changefreq: 'weekly', priority: 0.8 },
  { url: '/decor-by-room', changefreq: 'weekly', priority: 0.8 },
  { url: '/lighting', changefreq: 'weekly', priority: 0.8 },
  { url: '/about', changefreq: 'monthly', priority: 0.6 },
  { url: '/contact', changefreq: 'monthly', priority: 0.6 }
]

pages.forEach(page => {
  sitemap.write({
    url: page.url,
    changefreq: page.changefreq,
    priority: page.priority,
    lastmod: today
  })
})

sitemap.end()

streamToPromise(sitemap).then(data => {
  writeFileSync('./public/sitemap.xml', data.toString())
  console.log(' Sitemap generated successfully!')
})
