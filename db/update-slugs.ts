import { db } from "./index";
import { events, historicalFigures, historicalSites } from "../shared/schema";
import { eq } from "drizzle-orm";

/**
 * Hàm tạo slug từ chuỗi tiếng Việt
 * - Chuyển thành chữ thường
 * - Loại bỏ dấu
 * - Thay thế khoảng trắng bằng dấu gạch ngang
 * - Loại bỏ ký tự đặc biệt
 */
function createSlug(text: string): string {
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

/**
 * Cập nhật slug cho tất cả các sự kiện chưa có slug
 */
async function updateEventSlugs() {
  try {
    console.log("Đang cập nhật slug cho các sự kiện...");
    const allEvents = await db.query.events.findMany();
    
    let updateCount = 0;
    for (const event of allEvents) {
      if (!event.slug) {
        const newSlug = createSlug(event.title);
        await db.update(events)
          .set({ slug: newSlug })
          .where(eq(events.id, event.id));
        updateCount++;
      }
    }
    
    console.log(`Đã cập nhật slug cho ${updateCount} sự kiện.`);
  } catch (error) {
    console.error("Lỗi khi cập nhật slug cho sự kiện:", error);
  }
}

/**
 * Cập nhật slug cho tất cả các nhân vật lịch sử chưa có slug
 */
async function updateHistoricalFigureSlugs() {
  try {
    console.log("Đang cập nhật slug cho các nhân vật lịch sử...");
    const allFigures = await db.query.historicalFigures.findMany();
    
    let updateCount = 0;
    for (const figure of allFigures) {
      if (!figure.slug) {
        const newSlug = createSlug(figure.name);
        await db.update(historicalFigures)
          .set({ slug: newSlug })
          .where(eq(historicalFigures.id, figure.id));
        updateCount++;
      }
    }
    
    console.log(`Đã cập nhật slug cho ${updateCount} nhân vật lịch sử.`);
  } catch (error) {
    console.error("Lỗi khi cập nhật slug cho nhân vật lịch sử:", error);
  }
}

/**
 * Cập nhật slug cho tất cả các di tích lịch sử chưa có slug
 */
async function updateHistoricalSiteSlugs() {
  try {
    console.log("Đang cập nhật slug cho các di tích lịch sử...");
    const allSites = await db.query.historicalSites.findMany();
    
    let updateCount = 0;
    for (const site of allSites) {
      if (!site.slug) {
        const newSlug = createSlug(site.name);
        await db.update(historicalSites)
          .set({ slug: newSlug })
          .where(eq(historicalSites.id, site.id));
        updateCount++;
      }
    }
    
    console.log(`Đã cập nhật slug cho ${updateCount} di tích lịch sử.`);
  } catch (error) {
    console.error("Lỗi khi cập nhật slug cho di tích lịch sử:", error);
  }
}

/**
 * Hàm chính để cập nhật tất cả các slug
 */
async function updateAllSlugs() {
  try {
    await updateEventSlugs();
    await updateHistoricalFigureSlugs();
    await updateHistoricalSiteSlugs();

    console.log("Hoàn tất cập nhật slug cho tất cả dữ liệu.");
    process.exit(0);
  } catch (error) {
    console.error("Lỗi khi cập nhật slug:", error);
    process.exit(1);
  }
}

// Chạy hàm cập nhật
updateAllSlugs();