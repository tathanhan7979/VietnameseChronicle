import { storage } from "./storage";
import fs from "fs";
import path from "path";

/**
 * Tạo sitemap.xml tự động từ dữ liệu trong cơ sở dữ liệu
 */
export async function generateSitemap() {
  try {
    // Lấy dữ liệu từ database
    const periods = await storage.getAllPeriods();
    const events = await storage.getAllEvents();
    const figures = await storage.getAllHistoricalFigures();
    const sites = await storage.getAllHistoricalSites();

    // Lấy các thiết lập SEO từ cơ sở dữ liệu
    const siteUrlSetting = await storage.getSetting('site_url');
    const changeFreqSetting = await storage.getSetting('sitemap_changefreq');
    const prioritySetting = await storage.getSetting('sitemap_priority');
    
    // Sử dụng giá trị thiết lập hoặc giá trị mặc định
    const baseUrl = siteUrlSetting?.value || "https://lichsuviet.edu.vn";
    const defaultChangeFreq = changeFreqSetting?.value || "daily";
    const defaultPriority = prioritySetting?.value || "0.8";
    const currentDate = new Date().toISOString().split("T")[0];
    
    // Chuẩn bị các URL
    const urls = [];

    // Thêm trang chủ và các trang tĩnh
    urls.push({
      loc: `${baseUrl}/`,
      lastmod: currentDate,
      priority: "1.0",  // Trang chủ luôn có mức ưu tiên cao nhất
      changefreq: defaultChangeFreq,
    });

    // Thêm các thời kỳ lịch sử
    for (const period of periods) {
      if (period.isShow !== false) { // Chỉ thêm các thời kỳ được hiển thị
        urls.push({
          loc: `${baseUrl}/thoi-ky/${period.slug}`,
          lastmod: currentDate,
          priority: "0.9",  // Thời kỳ có mức ưu tiên cao thứ hai
          changefreq: defaultChangeFreq,
        });
      }
    }

    // Hàm giúp tạo slug thân thiện từ chuỗi tiếng Việt
    function createFriendlySlug(text: string): string {
      return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[đĐ]/g, "d")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
    }

    // Thêm các sự kiện
    for (const event of events) {
      // Sử dụng slug từ database hoặc tạo mới từ title nếu không có
      const eventSlug = event.slug || createFriendlySlug(event.title);
      
      urls.push({
        loc: `${baseUrl}/su-kien/${event.id}/${eventSlug}`,
        lastmod: currentDate,
        priority: defaultPriority,  // Sử dụng mức ưu tiên từ thiết lập
        changefreq: defaultChangeFreq,
      });
    }

    // Thêm các nhân vật lịch sử
    for (const figure of figures) {
      // Sử dụng slug từ database hoặc tạo mới từ name nếu không có
      const figureSlug = figure.slug || createFriendlySlug(figure.name);
      
      urls.push({
        loc: `${baseUrl}/nhan-vat/${figure.id}/${figureSlug}`,
        lastmod: currentDate,
        priority: defaultPriority,  // Sử dụng mức ưu tiên từ thiết lập
        changefreq: defaultChangeFreq,
      });
    }

    // Thêm các di tích lịch sử
    for (const site of sites) {
      // Sử dụng slug từ database hoặc tạo mới từ name nếu không có
      const siteSlug = site.slug || createFriendlySlug(site.name);
      
      urls.push({
        loc: `${baseUrl}/di-tich/${site.id}/${siteSlug}`,
        lastmod: currentDate,
        priority: defaultPriority,  // Sử dụng mức ưu tiên từ thiết lập
        changefreq: defaultChangeFreq,
      });
    }

    // Tạo nội dung file sitemap.xml
    let xmlContent = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xmlContent += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Thêm các URL vào sitemap
    for (const url of urls) {
      xmlContent += "  <url>\n";
      xmlContent += `    <loc>${url.loc}</loc>\n`;
      xmlContent += `    <lastmod>${url.lastmod}</lastmod>\n`;
      xmlContent += `    <changefreq>${url.changefreq}</changefreq>\n`;
      xmlContent += `    <priority>${url.priority}</priority>\n`;
      xmlContent += "  </url>\n";
    }

    xmlContent += "</urlset>";

    // Ghi file sitemap.xml
    const publicDir = path.join(process.cwd(), "client", "public");
    
    // Đảm bảo thư mục public tồn tại
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    fs.writeFileSync(path.join(publicDir, "sitemap.xml"), xmlContent);
    console.log("Generated sitemap.xml successfully");

    // Tạo file robots.txt nếu chưa tồn tại
    const robotsContent = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /auth/

Sitemap: ${baseUrl}/sitemap.xml
`;
    
    fs.writeFileSync(path.join(publicDir, "robots.txt"), robotsContent);
    console.log("Generated robots.txt successfully");

    return { success: true, message: "Sitemap and robots.txt generated successfully" };
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return { success: false, message: "Error generating sitemap", error };
  }
}