import { db } from "@db";
import { eq, and, desc, sql, isNull, or, like, gt, lt, asc } from "drizzle-orm";
import { News, InsertNews, news, periods, events, historicalFigures, historicalSites } from "@shared/schema";

/**
 * Tạo slug từ chuỗi tiếng Việt
 * - Chuyển thành chữ thường
 * - Loại bỏ dấu
 * - Thay thế khoảng trắng bằng dấu gạch ngang
 * - Loại bỏ ký tự đặc biệt
 */
function createSlug(text: string): string {
  if (!text) return "";
  
  // Chuyển thành chữ thường
  let str = text.toLowerCase();
  
  // Loại bỏ dấu tiếng Việt
  str = str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
  
  // Thay thế khoảng trắng bằng dấu gạch ngang và loại bỏ ký tự đặc biệt
  str = str
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
  
  return str;
}

export const newsController = {
  /**
   * Lấy danh sách tất cả tin tức (cho admin)
   */
  getAllNews: async (): Promise<News[]> => {
    try {
      return await db.query.news.findMany({
        orderBy: [desc(news.createdAt)],
      });
    } catch (error) {
      console.error("Error getting all news:", error);
      throw new Error("Không thể lấy danh sách tin tức");
    }
  },

  /**
   * Lấy danh sách tin tức có phân trang và lọc (cho frontend)
   */
  getNewsPaginated: async (
    page: number = 1,
    limit: number = 10,
    status: string = "all",
    searchQuery: string = ""
  ): Promise<{ data: News[]; total: number }> => {
    try {
      const offset = (page - 1) * limit;
      let query = db.select().from(news);
      let countQuery = db.select({ count: sql<number>`count(*)` }).from(news);

      // Lọc theo trạng thái
      if (status !== "all") {
        if (status === "published") {
          query = query.where(eq(news.published, true));
          countQuery = countQuery.where(eq(news.published, true));
        } else if (status === "draft") {
          query = query.where(eq(news.published, false));
          countQuery = countQuery.where(eq(news.published, false));
        } else if (status === "featured") {
          query = query.where(eq(news.is_featured, true));
          countQuery = countQuery.where(eq(news.is_featured, true));
        }
      }

      // Tìm kiếm theo từ khóa
      if (searchQuery) {
        const likePattern = `%${searchQuery}%`;
        query = query.where(
          or(
            like(news.title, likePattern),
            like(news.content, likePattern),
            like(news.summary, likePattern)
          )
        );
        countQuery = countQuery.where(
          or(
            like(news.title, likePattern),
            like(news.content, likePattern),
            like(news.summary, likePattern)
          )
        );
      }
      
      // Lấy tổng số tin tức
      const [{ count }] = await countQuery;
      
      // Lấy danh sách tin tức có phân trang
      const data = await query
        .orderBy(desc(news.createdAt))
        .limit(limit)
        .offset(offset);
      
      return {
        data,
        total: count,
      };
    } catch (error) {
      console.error("Error getting paginated news:", error);
      throw new Error("Không thể lấy danh sách tin tức");
    }
  },

  /**
   * Lấy chi tiết tin tức theo ID
   */
  getNewsById: async (id: number): Promise<News | null> => {
    try {
      return await db.query.news.findFirst({
        where: eq(news.id, id),
      });
    } catch (error) {
      console.error(`Error getting news with ID ${id}:`, error);
      throw new Error("Không thể lấy chi tiết tin tức");
    }
  },

  /**
   * Lấy chi tiết tin tức theo slug
   */
  getNewsBySlug: async (slug: string): Promise<News | null> => {
    try {
      return await db.query.news.findFirst({
        where: eq(news.slug, slug),
      });
    } catch (error) {
      console.error(`Error getting news with slug ${slug}:`, error);
      throw new Error("Không thể lấy chi tiết tin tức");
    }
  },

  /**
   * Tăng số lượt xem của tin tức
   */
  incrementViewCount: async (id: number): Promise<void> => {
    try {
      await db
        .update(news)
        .set({
          viewCount: sql`${news.viewCount} + 1`,
        })
        .where(eq(news.id, id));
    } catch (error) {
      console.error(`Error incrementing view count for news ${id}:`, error);
      throw new Error("Không thể cập nhật lượt xem");
    }
  },

  /**
   * Thêm tin tức mới
   */
  createNews: async (data: Omit<InsertNews, "id">): Promise<News> => {
    try {
      // Tạo slug nếu chưa có
      if (!data.slug && data.title) {
        data.slug = createSlug(data.title);
      }
      
      // Thêm tin tức mới
      const [newNews] = await db.insert(news).values(data).returning();
      return newNews;
    } catch (error) {
      console.error("Error creating news:", error);
      throw new Error("Không thể tạo tin tức mới");
    }
  },

  /**
   * Cập nhật tin tức
   */
  updateNews: async (
    id: number,
    data: Partial<Omit<InsertNews, "id">>
  ): Promise<News> => {
    try {
      // Tạo slug nếu cập nhật tiêu đề và không cung cấp slug
      if (data.title && !data.slug) {
        data.slug = createSlug(data.title);
      }
      
      // Cập nhật tin tức
      const [updatedNews] = await db
        .update(news)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(news.id, id))
        .returning();
      
      return updatedNews;
    } catch (error) {
      console.error(`Error updating news ${id}:`, error);
      throw new Error("Không thể cập nhật tin tức");
    }
  },

  /**
   * Xóa tin tức
   */
  deleteNews: async (id: number): Promise<News> => {
    try {
      const [deletedNews] = await db
        .delete(news)
        .where(eq(news.id, id))
        .returning();
      
      return deletedNews;
    } catch (error) {
      console.error(`Error deleting news ${id}:`, error);
      throw new Error("Không thể xóa tin tức");
    }
  },

  /**
   * Lấy danh sách tin tức liên quan
   * Dựa trên: cùng thời kỳ / sự kiện / nhân vật / di tích / loại sự kiện
   */
  getRelatedNews: async (
    newsId: number,
    limit: number = 5
  ): Promise<News[]> => {
    try {
      // Lấy thông tin tin tức hiện tại
      const currentNews = await db.query.news.findFirst({
        where: eq(news.id, newsId),
      });

      if (!currentNews) {
        throw new Error("Không tìm thấy tin tức");
      }

      let query = db.select().from(news).where(
        and(
          // Không lấy tin tức hiện tại
          sql`${news.id} != ${newsId}`,
          // Chỉ lấy tin tức đã xuất bản
          eq(news.published, true)
        )
      );

      // Tạo điều kiện dựa trên mối liên quan
      const conditions = [];

      // Thời kỳ liên quan
      if (currentNews.period_id) {
        conditions.push(eq(news.period_id, currentNews.period_id));
      }

      // Sự kiện liên quan
      if (currentNews.event_id) {
        conditions.push(eq(news.event_id, currentNews.event_id));
      }

      // Nhân vật liên quan
      if (currentNews.figure_id) {
        conditions.push(eq(news.figure_id, currentNews.figure_id));
      }

      // Di tích liên quan
      if (currentNews.site_id) {
        conditions.push(eq(news.site_id, currentNews.site_id));
      }

      // Nếu có ít nhất một điều kiện
      if (conditions.length > 0) {
        query = query.where(or(...conditions));
      }

      // Lấy tin tức liên quan
      const relatedNews = await query
        .orderBy(desc(news.createdAt))
        .limit(limit);

      // Nếu không đủ tin tức liên quan, lấy thêm tin tức mới nhất
      if (relatedNews.length < limit) {
        const moreNews = await db
          .select()
          .from(news)
          .where(
            and(
              sql`${news.id} != ${newsId}`,
              eq(news.published, true),
              // Loại bỏ những tin đã có trong danh sách liên quan
              sql`${news.id} NOT IN (${relatedNews.map((n) => n.id).join(",")})`
            )
          )
          .orderBy(desc(news.createdAt))
          .limit(limit - relatedNews.length);

        return [...relatedNews, ...moreNews];
      }

      return relatedNews;
    } catch (error) {
      console.error(`Error getting related news for ${newsId}:`, error);
      return [];
    }
  },

  /**
   * Lấy tin tức nổi bật
   */
  getFeaturedNews: async (limit: number = 5): Promise<News[]> => {
    try {
      // Sử dụng cột 'published' thay vì 'is_published'
      // Vì chưa có cột 'is_featured', tạm thời lấy tất cả bài đã published
      return await db
        .select()
        .from(news)
        .where(eq(news.published, true))
        .orderBy(desc(news.createdAt))
        .limit(limit);
    } catch (error) {
      console.error("Error getting featured news:", error);
      return [];
    }
  },

  /**
   * Lấy tin tức mới nhất
   */
  getLatestNews: async (limit: number = 10): Promise<News[]> => {
    try {
      return await db
        .select()
        .from(news)
        .where(eq(news.published, true))
        .orderBy(desc(news.createdAt))
        .limit(limit);
    } catch (error) {
      console.error("Error getting latest news:", error);
      return [];
    }
  },

  /**
   * Lấy tin tức phổ biến nhất (theo lượt xem)
   */
  getPopularNews: async (limit: number = 5): Promise<News[]> => {
    try {
      return await db
        .select()
        .from(news)
        .where(eq(news.published, true))
        .orderBy(desc(news.view_count))
        .limit(limit);
    } catch (error) {
      console.error("Error getting popular news:", error);
      return [];
    }
  },

  /**
   * Lấy tin tức theo thời kỳ
   */
  getNewsByPeriod: async (periodId: number, limit: number = 10): Promise<News[]> => {
    try {
      return await db
        .select()
        .from(news)
        .where(
          and(
            eq(news.published, true),
            eq(news.period_id, periodId)
          )
        )
        .orderBy(desc(news.createdAt))
        .limit(limit);
    } catch (error) {
      console.error(`Error getting news for period ${periodId}:`, error);
      return [];
    }
  },

  /**
   * Lấy tin tức theo sự kiện
   */
  getNewsByEvent: async (eventId: number, limit: number = 10): Promise<News[]> => {
    try {
      return await db
        .select()
        .from(news)
        .where(
          and(
            eq(news.published, true),
            eq(news.event_id, eventId)
          )
        )
        .orderBy(desc(news.createdAt))
        .limit(limit);
    } catch (error) {
      console.error(`Error getting news for event ${eventId}:`, error);
      return [];
    }
  },

  /**
   * Lấy tin tức theo nhân vật
   */
  getNewsByFigure: async (figureId: number, limit: number = 10): Promise<News[]> => {
    try {
      return await db
        .select()
        .from(news)
        .where(
          and(
            eq(news.published, true),
            eq(news.figure_id, figureId)
          )
        )
        .orderBy(desc(news.createdAt))
        .limit(limit);
    } catch (error) {
      console.error(`Error getting news for figure ${figureId}:`, error);
      return [];
    }
  },

  /**
   * Lấy tin tức theo di tích
   */
  getNewsBySite: async (siteId: number, limit: number = 10): Promise<News[]> => {
    try {
      return await db
        .select()
        .from(news)
        .where(
          and(
            eq(news.published, true),
            eq(news.site_id, siteId)
          )
        )
        .orderBy(desc(news.createdAt))
        .limit(limit);
    } catch (error) {
      console.error(`Error getting news for site ${siteId}:`, error);
      return [];
    }
  }
};