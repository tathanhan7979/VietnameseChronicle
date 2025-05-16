import { db } from "@db";
import {
  news,
  type News,
  type InsertNews,
  historicalFigures,
  historicalSites,
  events,
  periods,
  eventTypes,
} from "@shared/schema";
import { eq, desc, sql, and, or, isNull } from "drizzle-orm";

/**
 * Tạo slug từ chuỗi tiếng Việt
 * - Chuyển thành chữ thường
 * - Loại bỏ dấu
 * - Thay thế khoảng trắng bằng dấu gạch ngang
 * - Loại bỏ ký tự đặc biệt
 */
function createSlug(text: string): string {
  if (!text) return "";

  // Chuyển hoa thành thường
  let slug = text.toLowerCase();

  // Xóa dấu
  slug = slug.replace(/[áàảãạăắằẳẵặâấầẩẫậ]/g, "a");
  slug = slug.replace(/[éèẻẽẹêếềểễệ]/g, "e");
  slug = slug.replace(/[íìỉĩị]/g, "i");
  slug = slug.replace(/[óòỏõọôốồổỗộơớờởỡợ]/g, "o");
  slug = slug.replace(/[úùủũụưứừửữự]/g, "u");
  slug = slug.replace(/[ýỳỷỹỵ]/g, "y");
  slug = slug.replace(/đ/g, "d");

  // Xóa ký tự đặc biệt và thay thế khoảng trắng bằng dấu gạch ngang
  slug = slug.replace(/[^a-z0-9\s-]/g, "");
  slug = slug.replace(/[\s-]+/g, "-");
  slug = slug.replace(/^-+|-+$/g, "");

  return slug;
}

export const newsController = {
  /**
   * Lấy danh sách tất cả tin tức (cho admin)
   */
  getAllNews: async (): Promise<News[]> => {
    const result = await db.query.news.findMany({
      orderBy: [desc(news.createdAt)],
    });
    return result;
  },

  /**
   * Lấy danh sách tin tức có phân trang và lọc (cho frontend)
   */
  getNewsList: async ({
    limit = 10,
    page = 1,
    publishedOnly = true,
    periodId,
    eventId,
    historicalFigureId,
    historicalSiteId,
    eventTypeId,
  }: {
    limit?: number;
    page?: number;
    publishedOnly?: boolean;
    periodId?: number;
    eventId?: number;
    historicalFigureId?: number;
    historicalSiteId?: number;
    eventTypeId?: number;
  }) => {
    const offset = (page - 1) * limit;

    // Xây dựng câu truy vấn cơ bản
    let query = db.select().from(news);

    // Áp dụng bộ lọc
    if (publishedOnly) {
      query = query.where(eq(news.published, true));
    }

    if (periodId) {
      query = query.where(eq(news.periodId, periodId));
    }

    if (eventId) {
      query = query.where(eq(news.eventId, eventId));
    }

    if (historicalFigureId) {
      query = query.where(eq(news.historicalFigureId, historicalFigureId));
    }

    if (historicalSiteId) {
      query = query.where(eq(news.historicalSiteId, historicalSiteId));
    }

    if (eventTypeId) {
      query = query.where(eq(news.eventTypeId, eventTypeId));
    }

    // Đếm tổng số tin tức theo bộ lọc
    const countQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(news)
      .where(
        and(
          publishedOnly ? eq(news.published, true) : undefined,
          periodId ? eq(news.periodId, periodId) : undefined,
          eventId ? eq(news.eventId, eventId) : undefined,
          historicalFigureId ? eq(news.historicalFigureId, historicalFigureId) : undefined,
          historicalSiteId ? eq(news.historicalSiteId, historicalSiteId) : undefined,
          eventTypeId ? eq(news.eventTypeId, eventTypeId) : undefined
        )
      );

    // Thực hiện truy vấn
    const [totalResult] = await countQuery;
    const total = totalResult?.count || 0;

    // Áp dụng phân trang và sắp xếp
    query = query
      .orderBy(desc(news.createdAt))
      .limit(limit)
      .offset(offset);

    const data = await query;

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  /**
   * Lấy chi tiết tin tức theo ID
   */
  getNewsById: async (id: number): Promise<News | null> => {
    const result = await db.query.news.findFirst({
      where: eq(news.id, id),
    });
    return result || null;
  },

  /**
   * Lấy chi tiết tin tức theo slug
   */
  getNewsBySlug: async (slug: string): Promise<News | null> => {
    const result = await db.query.news.findFirst({
      where: eq(news.slug, slug),
    });
    return result || null;
  },

  /**
   * Tăng số lượt xem của tin tức
   */
  incrementNewsViewCount: async (id: number): Promise<void> => {
    await db
      .update(news)
      .set({
        viewCount: sql`${news.viewCount} + 1`,
      })
      .where(eq(news.id, id));
  },

  /**
   * Thêm tin tức mới
   */
  createNews: async (data: Omit<InsertNews, "id" | "slug" | "createdAt" | "updatedAt" | "viewCount">): Promise<News> => {
    // Tạo slug từ tiêu đề
    const slug = createSlug(data.title);
    
    // Kiểm tra nếu slug đã tồn tại, thêm hậu tố để đảm bảo duy nhất
    const existingNews = await db.query.news.findFirst({
      where: eq(news.slug, slug),
    });

    const finalSlug = existingNews
      ? `${slug}-${Date.now().toString().slice(-6)}`
      : slug;

    const insertData = {
      ...data,
      slug: finalSlug,
      viewCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const [createdNews] = await db.insert(news).values(insertData).returning();
    return createdNews;
  },

  /**
   * Cập nhật tin tức
   */
  updateNews: async (
    id: number,
    data: Partial<Omit<InsertNews, "id" | "slug" | "createdAt" | "viewCount">>
  ): Promise<News | null> => {
    // Kiểm tra tin tức có tồn tại không
    const existingNews = await db.query.news.findFirst({
      where: eq(news.id, id),
    });

    if (!existingNews) {
      return null;
    }

    // Nếu có thay đổi tiêu đề, cập nhật lại slug
    let slug = existingNews.slug;
    if (data.title && data.title !== existingNews.title) {
      slug = createSlug(data.title);
      
      // Kiểm tra nếu slug mới đã tồn tại cho tin tức khác
      const slugExists = await db.query.news.findFirst({
        where: and(eq(news.slug, slug), sql`${news.id} != ${id}`),
      });

      if (slugExists) {
        slug = `${slug}-${Date.now().toString().slice(-6)}`;
      }
    }

    const updateData = {
      ...data,
      slug,
      updatedAt: new Date(),
    };

    const [updatedNews] = await db
      .update(news)
      .set(updateData)
      .where(eq(news.id, id))
      .returning();

    return updatedNews;
  },

  /**
   * Xóa tin tức
   */
  deleteNews: async (id: number): Promise<void> => {
    await db.delete(news).where(eq(news.id, id));
  },

  /**
   * Lấy danh sách tin tức liên quan
   * Dựa trên: cùng thời kỳ / sự kiện / nhân vật / di tích / loại sự kiện
   */
  getRelatedNews: async (newsId: number, limit: number = 4): Promise<News[]> => {
    // Lấy thông tin tin tức cần tìm liên quan
    const sourceNews = await db.query.news.findFirst({
      where: eq(news.id, newsId),
    });

    if (!sourceNews) {
      return [];
    }

    // Xây dựng điều kiện OR cho các trường liên quan
    const conditions = [];

    if (sourceNews.periodId) {
      conditions.push(eq(news.periodId, sourceNews.periodId));
    }

    if (sourceNews.eventId) {
      conditions.push(eq(news.eventId, sourceNews.eventId));
    }

    if (sourceNews.historicalFigureId) {
      conditions.push(eq(news.historicalFigureId, sourceNews.historicalFigureId));
    }

    if (sourceNews.historicalSiteId) {
      conditions.push(eq(news.historicalSiteId, sourceNews.historicalSiteId));
    }

    if (sourceNews.eventTypeId) {
      conditions.push(eq(news.eventTypeId, sourceNews.eventTypeId));
    }

    // Nếu không có điều kiện liên quan, lấy tin tức mới nhất
    if (conditions.length === 0) {
      return db.query.news.findMany({
        where: and(
          eq(news.published, true),
          sql`${news.id} != ${newsId}`
        ),
        orderBy: [desc(news.createdAt)],
        limit,
      });
    }

    // Lấy tin tức liên quan dựa trên các điều kiện
    return db.query.news.findMany({
      where: and(
        eq(news.published, true),
        sql`${news.id} != ${newsId}`,
        or(...conditions)
      ),
      orderBy: [desc(news.createdAt)],
      limit,
    });
  },
};