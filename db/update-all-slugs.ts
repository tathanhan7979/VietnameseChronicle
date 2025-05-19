import { db } from "./index";
import { events, historicalFigures, historicalSites, news } from "../shared/schema";
import { eq } from "drizzle-orm";

/**
 * Hàm tạo slug từ chuỗi tiếng Việt
 * - Xử lý ký tự tiếng Việt cải tiến
 */
function createSlug(text: string): string {
  if (!text) return "";
  
  // Chuyển thành chữ thường
  let str = text.toLowerCase();
  
  // Bản đồ chuyển đổi ký tự có dấu tiếng Việt
  const vietnameseMap: { [key: string]: string } = {
    'à': 'a', 'á': 'a', 'ả': 'a', 'ã': 'a', 'ạ': 'a',
    'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ẳ': 'a', 'ẵ': 'a', 'ặ': 'a',
    'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ậ': 'a',
    'đ': 'd',
    'è': 'e', 'é': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ẹ': 'e',
    'ê': 'e', 'ề': 'e', 'ế': 'e', 'ể': 'e', 'ễ': 'e', 'ệ': 'e',
    'ì': 'i', 'í': 'i', 'ỉ': 'i', 'ĩ': 'i', 'ị': 'i',
    'ò': 'o', 'ó': 'o', 'ỏ': 'o', 'õ': 'o', 'ọ': 'o',
    'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ổ': 'o', 'ỗ': 'o', 'ộ': 'o',
    'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ở': 'o', 'ỡ': 'o', 'ợ': 'o',
    'ù': 'u', 'ú': 'u', 'ủ': 'u', 'ũ': 'u', 'ụ': 'u',
    'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ử': 'u', 'ữ': 'u', 'ự': 'u',
    'ỳ': 'y', 'ý': 'y', 'ỷ': 'y', 'ỹ': 'y', 'ỵ': 'y'
  };
  
  // Xử lý từng ký tự trong chuỗi
  let result = '';
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    result += vietnameseMap[char] || char;
  }
  
  // Loại bỏ các dấu còn sót lại
  result = result
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  
  // Thay thế khoảng trắng bằng dấu gạch ngang và loại bỏ ký tự đặc biệt
  result = result
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
  
  // Cắt dấu gạch ngang ở đầu và cuối
  result = result.replace(/^-+|-+$/g, '');
  
  return result;
}

/**
 * Cập nhật slug cho tất cả các sự kiện
 */
async function updateEventSlugs() {
  console.log("Đang cập nhật slug cho sự kiện...");
  const allEvents = await db.select().from(events);
  let updatedCount = 0;
  
  for (const event of allEvents) {
    const newSlug = createSlug(event.title);
    if (event.slug !== newSlug) {
      await db.update(events)
        .set({ slug: newSlug })
        .where(eq(events.id, event.id));
      console.log(`- Đã cập nhật slug sự kiện: "${event.title}" -> "${newSlug}"`);
      updatedCount++;
    }
  }
  
  console.log(`Hoàn thành: Đã cập nhật ${updatedCount}/${allEvents.length} sự kiện.`);
}

/**
 * Cập nhật slug cho tất cả các nhân vật lịch sử
 */
async function updateHistoricalFigureSlugs() {
  console.log("Đang cập nhật slug cho nhân vật lịch sử...");
  const allFigures = await db.select().from(historicalFigures);
  let updatedCount = 0;
  
  for (const figure of allFigures) {
    const newSlug = createSlug(figure.name);
    if (figure.slug !== newSlug) {
      await db.update(historicalFigures)
        .set({ slug: newSlug })
        .where(eq(historicalFigures.id, figure.id));
      console.log(`- Đã cập nhật slug nhân vật: "${figure.name}" -> "${newSlug}"`);
      updatedCount++;
    }
  }
  
  console.log(`Hoàn thành: Đã cập nhật ${updatedCount}/${allFigures.length} nhân vật lịch sử.`);
}

/**
 * Cập nhật slug cho tất cả các di tích lịch sử
 */
async function updateHistoricalSiteSlugs() {
  console.log("Đang cập nhật slug cho di tích lịch sử...");
  const allSites = await db.select().from(historicalSites);
  let updatedCount = 0;
  
  for (const site of allSites) {
    const newSlug = createSlug(site.name);
    if (site.slug !== newSlug) {
      await db.update(historicalSites)
        .set({ slug: newSlug })
        .where(eq(historicalSites.id, site.id));
      console.log(`- Đã cập nhật slug di tích: "${site.name}" -> "${newSlug}"`);
      updatedCount++;
    }
  }
  
  console.log(`Hoàn thành: Đã cập nhật ${updatedCount}/${allSites.length} di tích lịch sử.`);
}

/**
 * Cập nhật slug cho tất cả các tin tức
 */
async function updateNewsSlugs() {
  console.log("Đang cập nhật slug cho tin tức...");
  const allNews = await db.select().from(news);
  let updatedCount = 0;
  
  for (const item of allNews) {
    const newSlug = createSlug(item.title);
    if (item.slug !== newSlug) {
      await db.update(news)
        .set({ slug: newSlug })
        .where(eq(news.id, item.id));
      console.log(`- Đã cập nhật slug tin tức: "${item.title}" -> "${newSlug}"`);
      updatedCount++;
    }
  }
  
  console.log(`Hoàn thành: Đã cập nhật ${updatedCount}/${allNews.length} tin tức.`);
}

/**
 * Hàm chính để cập nhật tất cả các slug
 */
async function updateAllSlugs() {
  try {
    console.log("Bắt đầu cập nhật tất cả slug...");
    
    await updateEventSlugs();
    await updateHistoricalFigureSlugs();
    await updateHistoricalSiteSlugs();
    await updateNewsSlugs();
    
    console.log("Đã hoàn thành cập nhật tất cả slug!");
  } catch (error) {
    console.error("Lỗi khi cập nhật slug:", error);
  } finally {
    process.exit(0);
  }
}

// Chạy hàm cập nhật
updateAllSlugs();