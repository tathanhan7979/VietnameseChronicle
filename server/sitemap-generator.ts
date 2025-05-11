import fs from 'fs';
import path from 'path';
import { db } from '../db';
import { periods, events, historicalFigures, historicalSites } from '../shared/schema';
import { slugify } from '../client/src/lib/utils';

const BASE_URL = 'https://lichsuviet.edu.vn';

/**
 * Tạo sitemap.xml tự động từ dữ liệu trong cơ sở dữ liệu
 */
export async function generateSitemap() {
  try {
    // Tải dữ liệu từ cơ sở dữ liệu
    const allPeriods = await db.select().from(periods);
    const allEvents = await db.select().from(events);
    const allFigures = await db.select().from(historicalFigures);
    const allSites = await db.select().from(historicalSites);

    // Tạo danh sách URL
    const urls = [
      // Trang tĩnh
      { loc: `${BASE_URL}/`, priority: '1.0', changefreq: 'daily' },
      { loc: `${BASE_URL}/tim-kiem`, priority: '0.7', changefreq: 'weekly' },
      { loc: `${BASE_URL}/dieu-khoan-su-dung`, priority: '0.3', changefreq: 'monthly' },
      { loc: `${BASE_URL}/chinh-sach-bao-mat`, priority: '0.3', changefreq: 'monthly' },
      
      // Trang thời kỳ
      ...allPeriods.map(period => ({
        loc: `${BASE_URL}/thoi-ky/${period.slug}`,
        priority: '0.9',
        changefreq: 'weekly'
      })),
      
      // Trang sự kiện
      ...allEvents.map(event => ({
        loc: `${BASE_URL}/su-kien/${event.id}/${slugify(event.title)}`,
        priority: '0.8',
        changefreq: 'weekly'
      })),
      
      // Trang nhân vật lịch sử
      ...allFigures.map(figure => ({
        loc: `${BASE_URL}/nhan-vat/${figure.id}/${slugify(figure.name)}`,
        priority: '0.8',
        changefreq: 'weekly'
      })),
      
      // Trang di tích lịch sử
      ...allSites.map(site => ({
        loc: `${BASE_URL}/di-tich/${site.id}/${slugify(site.name)}`,
        priority: '0.8',
        changefreq: 'weekly'
      }))
    ];

    // Tạo sitemap XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <priority>${url.priority}</priority>
    <changefreq>${url.changefreq}</changefreq>
    <lastmod>${new Date().toISOString()}</lastmod>
  </url>`).join('\n')}
</urlset>`;

    // Tạo robots.txt
    const robots = `User-agent: *
Allow: /
Sitemap: ${BASE_URL}/sitemap.xml

# Không cho phép các crawler vào trang admin
User-agent: *
Disallow: /admin/
Disallow: /api/
`;

    // Ghi sitemap và robots.txt vào thư mục public
    const publicDir = path.resolve('./client/public');
    
    // Đảm bảo thư mục tồn tại
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap, 'utf8');
    fs.writeFileSync(path.join(publicDir, 'robots.txt'), robots, 'utf8');
    
    console.log('Sitemap và robots.txt đã được tạo thành công!');
    return { sitemap, robots };
  } catch (error) {
    console.error('Lỗi khi tạo sitemap:', error);
    throw error;
  }
}