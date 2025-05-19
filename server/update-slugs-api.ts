import { Request, Response } from 'express';
import { db } from '../db';
import { sql } from 'drizzle-orm';
import { events, historicalFigures, historicalSites, news } from '../shared/schema';

/**
 * Hàm tạo slug từ chuỗi tiếng Việt
 * - Xử lý ký tự tiếng Việt cải tiến
 */
function createSlug(text: string): string {
  if (!text) return '';
  
  // Chuyển thành chữ thường
  let slug = text.toLowerCase();
  
  // Thay thế các ký tự tiếng Việt
  slug = slug
    // Các nguyên âm có dấu
    .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
    .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
    .replace(/[ìíịỉĩ]/g, 'i')
    .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
    .replace(/[ùúụủũưừứựửữ]/g, 'u')
    .replace(/[ỳýỵỷỹ]/g, 'y')
    .replace(/đ/g, 'd')
    // Các ký tự đặc biệt
    .replace(/[^a-z0-9\s-]/g, '')
    // Thay thế khoảng trắng bằng dấu gạch ngang
    .replace(/[\s]+/g, '-')
    // Loại bỏ các dấu gạch ngang liên tiếp
    .replace(/-+/g, '-')
    // Loại bỏ dấu gạch ngang ở đầu và cuối
    .replace(/^-+|-+$/g, '');
  
  return slug;
}

/**
 * Cập nhật slug cho tất cả các sự kiện
 */
async function updateEventSlugs() {
  // Lấy danh sách tất cả các sự kiện
  const allEvents = await db.select().from(events);
  
  let updatedCount = 0;
  for (const event of allEvents) {
    const newSlug = createSlug(event.title);
    if (newSlug !== event.slug) {
      await db.update(events)
        .set({ slug: newSlug })
        .where(sql`${events.id} = ${event.id}`);
      updatedCount++;
    }
  }
  
  return {
    total: allEvents.length,
    updated: updatedCount
  };
}

/**
 * Cập nhật slug cho tất cả các nhân vật lịch sử
 */
async function updateHistoricalFigureSlugs() {
  // Lấy danh sách tất cả các nhân vật
  const allFigures = await db.select().from(historicalFigures);
  
  let updatedCount = 0;
  for (const figure of allFigures) {
    const newSlug = createSlug(figure.name);
    if (newSlug !== figure.slug) {
      await db.update(historicalFigures)
        .set({ slug: newSlug })
        .where(sql`${historicalFigures.id} = ${figure.id}`);
      updatedCount++;
    }
  }
  
  return {
    total: allFigures.length,
    updated: updatedCount
  };
}

/**
 * Cập nhật slug cho tất cả các di tích lịch sử
 */
async function updateHistoricalSiteSlugs() {
  // Lấy danh sách tất cả các di tích
  const allSites = await db.select().from(historicalSites);
  
  let updatedCount = 0;
  for (const site of allSites) {
    const newSlug = createSlug(site.name);
    if (newSlug !== site.slug) {
      await db.update(historicalSites)
        .set({ slug: newSlug })
        .where(sql`${historicalSites.id} = ${site.id}`);
      updatedCount++;
    }
  }
  
  return {
    total: allSites.length,
    updated: updatedCount
  };
}

/**
 * Cập nhật slug cho tất cả các tin tức
 */
async function updateNewsSlugs() {
  // Lấy danh sách tất cả các tin tức
  const allNews = await db.select().from(news);
  
  let updatedCount = 0;
  for (const item of allNews) {
    const newSlug = createSlug(item.title);
    if (newSlug !== item.slug) {
      await db.update(news)
        .set({ slug: newSlug })
        .where(sql`${news.id} = ${item.id}`);
      updatedCount++;
    }
  }
  
  return {
    total: allNews.length,
    updated: updatedCount
  };
}

/**
 * API handler cập nhật tất cả slug
 */
export async function updateAllSlugsHandler(req: Request, res: Response) {
  try {
    console.log('Bắt đầu cập nhật tất cả các slug...');
    
    // Cập nhật slug cho từng loại nội dung
    const eventsResult = await updateEventSlugs();
    const figuresResult = await updateHistoricalFigureSlugs();
    const sitesResult = await updateHistoricalSiteSlugs();
    const newsResult = await updateNewsSlugs();
    
    // Tổng hợp kết quả
    const result = {
      success: true,
      message: 'Cập nhật slug thành công',
      stats: {
        events: eventsResult,
        figures: figuresResult,
        sites: sitesResult,
        news: newsResult,
        totalItems: eventsResult.total + figuresResult.total + sitesResult.total + newsResult.total,
        totalUpdated: eventsResult.updated + figuresResult.updated + sitesResult.updated + newsResult.updated
      }
    };
    
    console.log('Kết quả cập nhật slug:', JSON.stringify(result));
    
    // Trả về response và đảm bảo không có response nào được gửi sau đó
    res.status(200).json(result);
  } catch (error) {
    console.error('Lỗi khi cập nhật slug:', error);
    
    // Đảm bảo trả về một đối tượng JSON hợp lệ
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi cập nhật slug',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
}