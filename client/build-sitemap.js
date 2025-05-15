// Tập tin này dùng để build sitemap.xml cho các trang tĩnh khi triển khai
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://lichsuviet.edu.vn';

// Các trang tĩnh có trong ứng dụng
const staticPages = [
  { path: '/', priority: '1.0', changefreq: 'daily' },
  { path: '/tim-kiem', priority: '0.7', changefreq: 'weekly' },
  { path: '/dieu-khoan-su-dung', priority: '0.3', changefreq: 'monthly' },
  { path: '/chinh-sach-bao-mat', priority: '0.3', changefreq: 'monthly' },
];

// Tạo nội dung sitemap
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages.map(page => `  <url>
    <loc>${BASE_URL}${page.path}</loc>
    <priority>${page.priority}</priority>
    <changefreq>${page.changefreq}</changefreq>
    <lastmod>${new Date().toISOString()}</lastmod>
  </url>`).join('\n')}
</urlset>`;

// Lưu file sitemap.xml
const outputPath = path.join(__dirname, 'public', 'sitemap.xml');
fs.writeFileSync(outputPath, sitemap, 'utf8');

console.log(`Static sitemap created at ${outputPath}`);

// Tạo file robots.txt
const robots = `User-agent: *
Allow: /
Sitemap: ${BASE_URL}/sitemap.xml

# Không cho phép các crawler vào trang admin
User-agent: *
Disallow: /admin/
Disallow: /api/
`;

const robotsPath = path.join(__dirname, 'public', 'robots.txt');
fs.writeFileSync(robotsPath, robots, 'utf8');

console.log(`Robots.txt created at ${robotsPath}`);