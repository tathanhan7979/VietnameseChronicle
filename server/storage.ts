import { db } from "@db";
import { 
  periods, 
  events,
  users, 
  historicalFigures,
  eventTypes,
  eventToEventType,
  historicalSites,
  feedback,
  settings,
  news,
  contributors,
  type Period,
  type Event,
  type User,
  type InsertUser,
  type HistoricalFigure,
  type InsertHistoricalFigure,
  type EventType,
  type HistoricalSite,
  type Feedback,
  type InsertFeedback,
  type Setting,
  type InsertSetting,
  type News,
  type InsertNews,
  type Contributor,
  type InsertContributor
} from "@shared/schema";
import { eq, and, or, like, sql, desc, asc, count, max } from "drizzle-orm";

// Helper to handle database errors
const handleDbError = (error: unknown, operation: string) => {
  console.error(`Error in ${operation}:`, error);
  throw new Error(`Database error in ${operation}`);
};

// Hàm tạo slug từ chuỗi tiếng Việt
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

// Import những chức năng quản lý tin tức
import { newsController } from "./news-methods";

export const storage = {
  // Contributors - Người đóng góp
  getAllContributors: async (): Promise<Contributor[]> => {
    try {
      return await db.select().from(contributors).orderBy(asc(contributors.sortOrder));
    } catch (error) {
      handleDbError(error, "getAllContributors");
      return [];
    }
  },
  
  getContributor: async (id: number): Promise<Contributor | null> => {
    try {
      const result = await db.select().from(contributors).where(eq(contributors.id, id));
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      handleDbError(error, "getContributor");
      return null;
    }
  },
  
  createContributor: async (data: InsertContributor): Promise<Contributor> => {
    try {
      const result = await db.insert(contributors).values(data).returning();
      return result[0];
    } catch (error) {
      handleDbError(error, "createContributor");
      throw error;
    }
  },
  
  updateContributor: async (id: number, data: Partial<InsertContributor>): Promise<Contributor> => {
    try {
      const result = await db.update(contributors)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(contributors.id, id))
        .returning();
      
      if (result.length === 0) {
        throw new Error("Không tìm thấy người đóng góp");
      }
      
      return result[0];
    } catch (error) {
      handleDbError(error, "updateContributor");
      throw error;
    }
  },
  
  deleteContributor: async (id: number): Promise<boolean> => {
    try {
      const result = await db.delete(contributors)
        .where(eq(contributors.id, id))
        .returning({ id: contributors.id });
      
      return result.length > 0;
    } catch (error) {
      handleDbError(error, "deleteContributor");
      throw error;
    }
  },
  
  updateContributorSortOrder: async (id: number, sortOrder: number): Promise<boolean> => {
    try {
      const result = await db.update(contributors)
        .set({ sortOrder, updatedAt: new Date() })
        .where(eq(contributors.id, id))
        .returning({ id: contributors.id });
      
      return result.length > 0;
    } catch (error) {
      handleDbError(error, "updateContributorSortOrder");
      throw error;
    }
  },
  
  getActiveContributors: async (): Promise<Contributor[]> => {
    try {
      return await db.select().from(contributors)
        .where(eq(contributors.isActive, true))
        .orderBy(asc(contributors.sortOrder));
    } catch (error) {
      handleDbError(error, "getActiveContributors");
      return [];
    }
  },
  // Event to Event Type relations
  getAllEventToEventTypes: async () => {
    try {
      const results = await db.select().from(eventToEventType);
      return results;
    } catch (error) {
      handleDbError(error, "getAllEventToEventTypes");
      return [];
    }
  },
    
  // Users methods
  getUserById: async (id: number) => {
    try {
      const userResult = await db.query.users.findFirst({
        where: eq(sql`id`, id)
      });
      return userResult || null;
    } catch (error) {
      handleDbError(error, "getUserById");
      return null;
    }
  },
  
  getUserByUsername: async (username: string) => {
    try {
      const userResult = await db.query.users.findFirst({
        where: eq(sql`username`, username)
      });
      return userResult || null;
    } catch (error) {
      handleDbError(error, "getUserByUsername");
      return null;
    }
  },
  
  getAllUsers: async () => {
    try {
      const users = await db.query.users.findMany({
        orderBy: [asc(sql`username`)]
      });
      return users;
    } catch (error) {
      handleDbError(error, "getAllUsers");
      return [];
    }
  },
  
  createUser: async (userData: any) => {
    try {
      const [newUser] = await db.insert(users)
        .values(userData)
        .returning();
      return newUser;
    } catch (error) {
      handleDbError(error, "createUser");
      return null;
    }
  },
  
  updateUser: async (id: number, userData: any) => {
    try {
      // Loại bỏ password khỏi cập nhật nếu nó trống
      if (userData.password === undefined || userData.password === '') {
        delete userData.password;
      }
      
      const [updatedUser] = await db.update(users)
        .set(userData)
        .where(eq(users.id, id))
        .returning();
      return updatedUser || null;
    } catch (error) {
      handleDbError(error, "updateUser");
      return null;
    }
  },
  
  deleteUser: async (id: number) => {
    try {
      const [deletedUser] = await db.delete(users)
        .where(eq(users.id, id))
        .returning();
      return deletedUser || null;
    } catch (error) {
      handleDbError(error, "deleteUser");
      return null;
    }
  },
  // Settings methods
  getSetting: async (key: string): Promise<Setting | null> => {
    try {
      const result = await db.query.settings.findFirst({
        where: eq(settings.key, key)
      });
      return result || null;
    } catch (error) {
      handleDbError(error, "getSetting");
      return null;
    }
  },
  
  getAllSettings: async (): Promise<Setting[]> => {
    try {
      return await db.query.settings.findMany();
    } catch (error) {
      handleDbError(error, "getAllSettings");
      return [];
    }
  },
  
  updateSetting: async (key: string, value: string): Promise<Setting | null> => {
    try {
      // Kiểm tra xem setting đã tồn tại chưa
      const existingSetting = await db.query.settings.findFirst({
        where: eq(settings.key, key)
      });
      
      if (existingSetting) {
        // Nếu đã tồn tại, cập nhật giá trị
        const [updated] = await db
          .update(settings)
          .set({ value, updatedAt: new Date() })
          .where(eq(settings.key, key))
          .returning();
        return updated;
      } else {
        // Nếu chưa tồn tại, tạo mới
        const [created] = await db
          .insert(settings)
          .values({ 
            key, 
            value,
            displayName: key,
            description: '',
            category: 'general',
            inputType: 'text',
            sortOrder: 0
          })
          .returning();
        return created;
      }
    } catch (error) {
      handleDbError(error, "updateSetting");
      return null;
    }
  },
  
  deleteSetting: async (key: string): Promise<boolean> => {
    try {
      await db
        .delete(settings)
        .where(eq(settings.key, key));
      return true;
    } catch (error) {
      handleDbError(error, "deleteSetting");
      return false;
    }
  },
  
  initializeDefaultSettings: async (): Promise<void> => {
    try {
      // Các thiết lập mặc định
      const defaultSettings = [
        {
          key: "site_favicon",
          value: "",
          description: "Icon hiển thị trên thẻ trình duyệt (favicon)",
          displayName: "Icon trang web",
          category: "general",
          inputType: "text",
          sortOrder: 0
        },
        {
          key: "home_background_url",
          value: "https://images.unsplash.com/photo-1624009582782-1be02fbb7f23?q=80&w=2071&auto=format&fit=crop",
          description: "URL ảnh nền của trang chủ",
          displayName: "Ảnh nền trang chủ",
          category: "general",
          inputType: "text",
          sortOrder: 1
        },
        {
          key: "last_sitemap_update",
          value: "",
          description: "Thời gian cập nhật sitemap.xml gần nhất",
          displayName: "Cập nhật sitemap gần nhất",
          category: "seo",
          inputType: "readonly",
          sortOrder: 0
        },
        {
          key: "sitemap_auto_update",
          value: "false",
          description: "Tự động cập nhật sitemap.xml khi có thay đổi nội dung",
          displayName: "Tự động cập nhật sitemap",
          category: "seo",
          inputType: "select",
          sortOrder: 1
        },
        {
          key: "site_url",
          value: "https://lichsuviet.edu.vn",
          description: "URL chính của trang web, sử dụng cho sitemap và các liên kết tuyệt đối",
          displayName: "URL trang web",
          category: "seo",
          inputType: "text",
          sortOrder: 2
        },
        {
          key: "sitemap_changefreq",
          value: "daily",
          description: "Tần suất thay đổi nội dung mặc định (daily, weekly, monthly)",
          displayName: "Tần suất cập nhật",
          category: "seo",
          inputType: "select",
          sortOrder: 3
        },
        {
          key: "sitemap_priority",
          value: "0.8",
          description: "Mức độ ưu tiên mặc định cho các trang (0.1 đến 1.0)",
          displayName: "Mức độ ưu tiên",
          category: "seo",
          inputType: "text",
          sortOrder: 4
        },
        {
          key: "telegram_bot_token",
          value: "",
          description: "Token của bot Telegram",
          displayName: "Token Telegram Bot",
          category: "notifications",
          inputType: "text",
          sortOrder: 0
        },
        {
          key: "telegram_chat_id",
          value: "",
          description: "ID nhóm chat Telegram",
          displayName: "Chat ID Telegram",
          category: "notifications",
          inputType: "text",
          sortOrder: 1
        },
        {
          key: "facebook_app_id",
          value: "",
          description: "ID ứng dụng Facebook để tích hợp chia sẻ",
          displayName: "Facebook App ID",
          category: "social",
          inputType: "text",
          sortOrder: 0
        },
        {
          key: "privacy_policy",
          value: "<h2>Chính sách bảo mật</h2><p>Thông tin chi tiết về chính sách bảo mật...</p>",
          description: "Nội dung chính sách bảo mật",
          displayName: "Chính sách bảo mật",
          category: "legal",
          inputType: "textarea",
          sortOrder: 0
        },
        {
          key: "terms_of_service",
          value: "<h2>Điều khoản sử dụng</h2><p>Thông tin chi tiết về điều khoản sử dụng...</p>",
          description: "Nội dung điều khoản sử dụng",
          displayName: "Điều khoản sử dụng",
          category: "legal",
          inputType: "textarea",
          sortOrder: 1
        }
      ];
      
      // Kiểm tra và tạo/cập nhật các thiết lập
      for (const setting of defaultSettings) {
        const existing = await db.query.settings.findFirst({
          where: eq(settings.key, setting.key)
        });
        
        if (!existing) {
          await db.insert(settings).values(setting);
        }
      }
    } catch (error) {
      handleDbError(error, "initializeDefaultSettings");
    }
  },

  // Feedback methods
  // ======= Quản lý sự kiện =======
  
  getAllEventsWithTypes: async (): Promise<Event[]> => {
    try {
      const allEvents = await db.query.events.findMany({
        orderBy: asc(events.sortOrder),
        with: {
          eventTypes: {
            with: {
              eventType: true
            }
          }
        }
      });
      
      // Biến đổi dữ liệu để phù hợp với interface Event
      const transformedEvents = allEvents.map(event => {
        // Ánh xạ từ mối quan hệ eventTypes sang mảng EventType
        const mappedEventTypes = event.eventTypes?.map(relation => relation.eventType);
        
        return {
          ...event,
          eventTypes: mappedEventTypes || []
        };
      });
      
      return transformedEvents;
    } catch (error) {
      console.error('Error getting all events with types:', error);
      return [];
    }
  },
  
  createEvent: async (data: any): Promise<Event> => {
    try {
      const [newEvent] = await db.insert(events).values(data).returning();
      return newEvent;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  },
  
  updateEvent: async (id: number, data: any): Promise<Event | null> => {
    try {
      const [updatedEvent] = await db.update(events)
        .set(data)
        .where(eq(events.id, id))
        .returning();
      return updatedEvent || null;
    } catch (error) {
      console.error(`Error updating event ${id}:`, error);
      throw error;
    }
  },
  
  deleteEvent: async (id: number): Promise<boolean> => {
    try {
      const result = await db.delete(events)
        .where(eq(events.id, id));
      return true;
    } catch (error) {
      console.error(`Error deleting event ${id}:`, error);
      throw error;
    }
  },
  
  associateEventWithTypes: async (eventId: number, typeIds: (number | string)[]): Promise<void> => {
    try {
      // Convert to numbers if they are strings
      const numericTypeIds = typeIds.map(id => typeof id === 'string' ? parseInt(id, 10) : id);
      
      // Create association records
      const associations = numericTypeIds.map(typeId => ({
        eventId,
        eventTypeId: typeId
      }));
      
      await db.insert(eventToEventType).values(associations);
    } catch (error) {
      console.error(`Error associating event ${eventId} with types:`, error);
      throw error;
    }
  },
  
  removeEventTypeAssociations: async (eventId: number): Promise<void> => {
    try {
      await db.delete(eventToEventType)
        .where(eq(eventToEventType.eventId, eventId));
    } catch (error) {
      console.error(`Error removing event type associations for event ${eventId}:`, error);
      throw error;
    }
  },
  
  removeEventTypeAssociationsByType: async (typeId: number): Promise<void> => {
    try {
      await db.delete(eventToEventType)
        .where(eq(eventToEventType.eventTypeId, typeId));
    } catch (error) {
      console.error(`Error removing associations for event type ${typeId}:`, error);
      throw error;
    }
  },
  
  reorderEvents: async (orderedIds: number[]): Promise<boolean> => {
    try {
      for (let i = 0; i < orderedIds.length; i++) {
        await db.update(events)
          .set({ sortOrder: i })
          .where(eq(events.id, orderedIds[i]));
      }
      return true;
    } catch (error) {
      console.error('Error reordering events:', error);
      return false;
    }
  },
  
  // ======= Quản lý feedback =======
  
  createFeedback: async (data: InsertFeedback): Promise<Feedback> => {
    try {
      const [result] = await db.insert(feedback).values(data).returning();
      return result;
    } catch (error) {
      handleDbError(error, "createFeedback");
      throw error; // Rethrow để xử lý ở tầng controller
    }
  },
  
  getAllFeedback: async (): Promise<Feedback[]> => {
    try {
      return await db.query.feedback.findMany({
        orderBy: [
          // Hiển thị các feedback chưa xử lý lên đầu
          asc(feedback.resolved),
          // Sắp xếp theo thời gian tạo, mới nhất lên đầu
          desc(feedback.createdAt)
        ]
      });
    } catch (error) {
      handleDbError(error, "getAllFeedback");
      return [];
    }
  },
  
  getFeedbackById: async (id: number): Promise<Feedback | null> => {
    try {
      const result = await db.query.feedback.findFirst({
        where: eq(feedback.id, id)
      });
      return result || null;
    } catch (error) {
      handleDbError(error, "getFeedbackById");
      return null;
    }
  },
  
  updateFeedbackStatus: async (id: number, resolved: boolean, response?: string): Promise<Feedback | null> => {
    try {
      const [updated] = await db
        .update(feedback)
        .set({ 
          resolved,
          response,
          respondedAt: resolved ? new Date() : null
        })
        .where(eq(feedback.id, id))
        .returning();
      return updated || null;
    } catch (error) {
      handleDbError(error, "updateFeedbackStatus");
      return null;
    }
  },
  
  getPendingFeedbackCount: async (): Promise<number> => {
    try {
      const pendingFeedback = await db.query.feedback.findMany({
        where: eq(feedback.resolved, false)
      });
      return pendingFeedback.length;
    } catch (error) {
      handleDbError(error, "getPendingFeedbackCount");
      return 0;
    }
  },
  // Event Type methods
  getAllEventTypes: async (): Promise<EventType[]> => {
    try {
      return await db.query.eventTypes.findMany({
        orderBy: asc(eventTypes.name)
      });
    } catch (error) {
      handleDbError(error, "getAllEventTypes");
      return [];
    }
  },
  
  createEventType: async (typeData: Omit<EventType, 'id'>): Promise<EventType> => {
    try {
      const [result] = await db.insert(eventTypes).values(typeData).returning();
      return result;
    } catch (error) {
      handleDbError(error, "createEventType");
      throw error;
    }
  },
  
  updateEventType: async (id: number, typeData: Partial<EventType>): Promise<EventType | null> => {
    try {
      const [updated] = await db
        .update(eventTypes)
        .set(typeData)
        .where(eq(eventTypes.id, id))
        .returning();
      return updated || null;
    } catch (error) {
      handleDbError(error, "updateEventType");
      return null;
    }
  },
  
  getEventsUsingEventType: async (typeId: number): Promise<number[]> => {
    try {
      const relations = await db.query.eventToEventType.findMany({
        where: eq(eventToEventType.eventTypeId, typeId),
      });
      return relations.map(rel => rel.eventId);
    } catch (error) {
      handleDbError(error, "getEventsUsingEventType");
      return [];
    }
  },
  
  deleteEventType: async (id: number): Promise<boolean> => {
    try {
      await db
        .delete(eventTypes)
        .where(eq(eventTypes.id, id));
      return true;
    } catch (error) {
      handleDbError(error, "deleteEventType");
      return false;
    }
  },
  
  reorderEventTypes: async (orderedIds: number[]): Promise<boolean> => {
    try {
      for (let i = 0; i < orderedIds.length; i++) {
        await db
          .update(eventTypes)
          .set({ sortOrder: i })
          .where(eq(eventTypes.id, orderedIds[i]));
      }
      return true;
    } catch (error) {
      handleDbError(error, "reorderEventTypes");
      return false;
    }
  },
  
  getEventTypeBySlug: async (slug: string): Promise<EventType | null> => {
    try {
      const result = await db.query.eventTypes.findFirst({
        where: eq(eventTypes.slug, slug)
      });
      return result || null;
    } catch (error) {
      handleDbError(error, "getEventTypeBySlug");
      return null;
    }
  },
  
  getEventsByPeriod: async (periodId: number): Promise<Event[]> => {
    try {
      const result = await db.query.events.findMany({
        where: eq(events.periodId, periodId),
        orderBy: asc(events.sortOrder)
      });
      return result;
    } catch (error) {
      handleDbError(error, "getEventsByPeriod");
      return [];
    }
  },

  getEventsByType: async (typeSlug: string): Promise<Event[]> => {
    try {
      // First get the event type
      const eventType = await storage.getEventTypeBySlug(typeSlug);
      if (!eventType) return [];
      
      // Then find all event-type relations for this type
      const relations = await db.query.eventToEventType.findMany({
        where: eq(eventToEventType.eventTypeId, eventType.id)
      });
      
      // Get all event IDs
      const eventIds = relations.map(rel => rel.eventId);
      if (eventIds.length === 0) return [];
      
      // Get all events
      const result = await db.query.events.findMany({
        where: (fields) => {
          const conditions = eventIds.map(id => eq(fields.id, id));
          return or(...conditions);
        },
        orderBy: [asc(events.periodId), asc(events.sortOrder)]
      });
      
      return result;
    } catch (error) {
      handleDbError(error, "getEventsByType");
      return [];
    }
  },
  // Period methods
  getAllPeriods: async (): Promise<Period[]> => {
    try {
      return await db.query.periods.findMany({
        orderBy: asc(periods.sortOrder)
      });
    } catch (error) {
      handleDbError(error, "getAllPeriods");
      return [];
    }
  },
  
  // Lấy tất cả thời kỳ có isShow = true cho trang chủ
  getVisiblePeriods: async (): Promise<Period[]> => {
    try {
      return await db.query.periods.findMany({
        where: eq(periods.isShow, true),
        orderBy: asc(periods.sortOrder)
      });
    } catch (error) {
      handleDbError(error, "getVisiblePeriods");
      return [];
    }
  },
  
  createPeriod: async (periodData: Omit<Period, 'id'>): Promise<Period> => {
    try {
      const [result] = await db.insert(periods).values(periodData).returning();
      return result;
    } catch (error) {
      handleDbError(error, "createPeriod");
      throw error;
    }
  },
  
  updatePeriod: async (id: number, periodData: Partial<Period>): Promise<Period | null> => {
    try {
      const [updated] = await db
        .update(periods)
        .set(periodData)
        .where(eq(periods.id, id))
        .returning();
      return updated || null;
    } catch (error) {
      handleDbError(error, "updatePeriod");
      return null;
    }
  },
  
  deletePeriod: async (id: number): Promise<boolean> => {
    try {
      await db
        .delete(periods)
        .where(eq(periods.id, id));
      return true;
    } catch (error) {
      handleDbError(error, "deletePeriod");
      return false;
    }
  },
  
  reorderPeriods: async (orderedIds: number[]): Promise<boolean> => {
    try {
      console.log('Storage: Starting reorderPeriods with orderedIds:', orderedIds);
      
      // Kiểm tra và chuyển đổi tất cả ID sang số nguyên
      const numericIds = orderedIds.map(id => {
        // Đảm bảo tất cả là số nguyên dương
        const numId = typeof id === 'string' ? parseInt(id, 10) : Number(id);
        return isNaN(numId) ? 0 : numId;
      }).filter(id => id > 0); // Lọc bỏ các ID không hợp lệ
      
      console.log('Storage: Using cleaned IDs:', numericIds);
      
      if (numericIds.length === 0) {
        console.error('Storage: No valid IDs after cleaning');
        return false;
      }
      
      // Lấy tất cả periods hiện có trong database
      const existingPeriods = await db.query.periods.findMany();
      console.log('Storage: Existing periods count:', existingPeriods.length);
      
      // Phân tích các ID
      const existingIds = existingPeriods.map(p => p.id);
      const missingIds = numericIds.filter(id => !existingIds.includes(id));
      const extraIds = existingIds.filter(id => !numericIds.includes(id));
      
      if (missingIds.length > 0) {
        console.warn('Storage: Some IDs from request do not exist in database:', missingIds);
      }
      
      if (extraIds.length > 0) {
        console.warn('Storage: Some periods in database are not in the request:', extraIds);
      }
      
      // Thực hiện việc cập nhật thứ tự cho các period hợp lệ
      const validIds = numericIds.filter(id => existingIds.includes(id));
      console.log('Storage: Processing valid period IDs:', validIds);
      
      if (validIds.length === 0) {
        console.error('Storage: No valid periods to reorder');
        return false;
      }
      
      // Cập nhật lần lượt từng period có trong cả request và database
      for (let i = 0; i < validIds.length; i++) {
        const id = validIds[i];
        console.log(`Storage: Setting sortOrder=${i} for period id=${id}`);
        
        try {
          const result = await db
            .update(periods)
            .set({ sortOrder: i })
            .where(eq(periods.id, id));
            
          console.log(`Storage: Updated period id=${id} to sortOrder=${i}`);
        } catch (err) {
          console.error(`Storage: Error updating period id=${id}:`, err);
          // Tiếp tục với ID tiếp theo thay vì bỏ cuộc
        }
      }
      
      console.log('Storage: Successfully reordered periods');
      return true;
    } catch (error) {
      console.error('Storage: Error in reorderPeriods:', error);
      handleDbError(error, "reorderPeriods");
      return false;
    }
  },
  
  getPeriodById: async (id: number): Promise<Period | null> => {
    try {
      const periodData = await db.select().from(periods).where(eq(periods.id, id));
      return periodData.length > 0 ? periodData[0] : null;
    } catch (error) {
      handleDbError(error, "getPeriodById");
      return null;
    }
  },
  
  // Lấy thời kỳ theo slug
  getPeriodBySlug: async (slug: string): Promise<Period | null> => {
    try {
      const result = await db.query.periods.findFirst({
        where: eq(periods.slug, slug)
      });
      return result || null;
    } catch (error) {
      handleDbError(error, "getPeriodBySlug");
      return null;
    }
  },
  
  // Event methods
  getAllEvents: async (): Promise<(Event & { eventTypes?: EventType[] })[]> => {
    try {
      const allEvents = await db.query.events.findMany({
        orderBy: [asc(events.periodId), asc(events.sortOrder)]
      });
      
      // For each event, load its event types
      const eventsWithTypes = await Promise.all(allEvents.map(async (event) => {
        // Get event types for this event
        const relations = await db.query.eventToEventType.findMany({
          where: eq(eventToEventType.eventId, event.id),
          with: {
            eventType: true
          }
        });
        
        // Map to event types
        const types = relations.map(rel => rel.eventType);
        
        return {
          ...event,
          eventTypes: types
        };
      }));
      
      return eventsWithTypes;
    } catch (error) {
      handleDbError(error, "getAllEvents");
      return [];
    }
  },
  
  getEventById: async (id: number): Promise<(Event & { eventTypes?: EventType[] }) | null> => {
    try {
      const event = await db.query.events.findFirst({
        where: eq(events.id, id)
      });
      
      if (!event) return null;
      
      // Get event types for this event
      const relations = await db.query.eventToEventType.findMany({
        where: eq(eventToEventType.eventId, id),
        with: {
          eventType: true
        }
      });
      
      // Map to event types
      const types = relations.map(rel => rel.eventType);
      
      return {
        ...event,
        eventTypes: types
      };
    } catch (error) {
      handleDbError(error, "getEventById");
      return null;
    }
  },
  
  getEventsByPeriodWithTypes: async (periodId: number): Promise<(Event & { eventTypes?: EventType[] })[]> => {
    try {
      const periodEvents = await db.query.events.findMany({
        where: eq(events.periodId, periodId),
        orderBy: asc(events.sortOrder)
      });
      
      // For each event, load its event types
      const eventsWithTypes = await Promise.all(periodEvents.map(async (event) => {
        // Get event types for this event
        const relations = await db.query.eventToEventType.findMany({
          where: eq(eventToEventType.eventId, event.id),
          with: {
            eventType: true
          }
        });
        
        // Map to event types
        const types = relations.map(rel => rel.eventType);
        
        return {
          ...event,
          eventTypes: types
        };
      }));
      
      return eventsWithTypes;
    } catch (error) {
      handleDbError(error, "getEventsByPeriodWithTypes");
      return [];
    }
  },

  // Lấy sự kiện theo slug của thời kỳ
  getEventsByPeriodSlug: async (periodSlug: string): Promise<(Event & { eventTypes?: EventType[] })[]> => {
    try {
      // Đầu tiên tìm thời kỳ theo slug
      const period = await db.query.periods.findFirst({
        where: eq(periods.slug, periodSlug)
      });
      
      if (!period) return [];
      
      // Sau đó lấy các sự kiện theo periodId
      const periodEvents = await db.query.events.findMany({
        where: eq(events.periodId, period.id),
        orderBy: asc(events.sortOrder)
      });
      
      // For each event, load its event types
      const eventsWithTypes = await Promise.all(periodEvents.map(async (event) => {
        // Get event types for this event
        const relations = await db.query.eventToEventType.findMany({
          where: eq(eventToEventType.eventId, event.id),
          with: {
            eventType: true
          }
        });
        
        // Map to event types
        const types = relations.map(rel => rel.eventType);
        
        return {
          ...event,
          eventTypes: types
        };
      }));
      
      return eventsWithTypes;
    } catch (error) {
      handleDbError(error, "getEventsByPeriodSlug");
      return [];
    }
  },
  
  // Historical Figure methods
  getAllHistoricalFigures: async (): Promise<HistoricalFigure[]> => {
    try {
      const figures = await db.query.historicalFigures.findMany({
        orderBy: asc(historicalFigures.sortOrder),
        with: {
          period: true
        }
      });
      
      return figures;
    } catch (error) {
      handleDbError(error, "getAllHistoricalFigures");
      return [];
    }
  },
  
  getHistoricalFigureById: async (id: number): Promise<HistoricalFigure | null> => {
    try {
      const result = await db.query.historicalFigures.findFirst({
        where: eq(historicalFigures.id, id),
        with: {
          period: true
        }
      });
      
      return result || null;
    } catch (error) {
      handleDbError(error, "getHistoricalFigureById");
      return null;
    }
  },
  
  getHistoricalFiguresByPeriod: async (periodId: number): Promise<HistoricalFigure[]> => {
    try {
      const figures = await db.query.historicalFigures.findMany({
        where: eq(historicalFigures.periodId, periodId),
        orderBy: asc(historicalFigures.sortOrder),
        with: {
          period: true
        }
      });
      
      return figures;
    } catch (error) {
      handleDbError(error, "getHistoricalFiguresByPeriod");
      return [];
    }
  },
  
  getHistoricalFiguresByPeriodSlug: async (slug: string): Promise<HistoricalFigure[]> => {
    try {
      // Trước tiên lấy thời kỳ dựa trên slug
      const period = await db.query.periods.findFirst({
        where: eq(periods.slug, slug)
      });
      
      if (!period) {
        return [];
      }
      
      // Sau đó lấy các nhân vật theo periodId
      const figures = await db.query.historicalFigures.findMany({
        where: eq(historicalFigures.periodId, period.id),
        orderBy: asc(historicalFigures.sortOrder),
        with: {
          period: true
        }
      });
      
      return figures;
    } catch (error) {
      handleDbError(error, "getHistoricalFiguresByPeriodSlug");
      return [];
    }
  },

  createHistoricalFigure: async (figureData: Omit<HistoricalFigure, 'id' | 'sortOrder'>): Promise<HistoricalFigure | null> => {
    try {
      // Lấy giá trị sortOrder lớn nhất hiện tại
      const maxSortOrder = await db
        .select({ maxOrder: max(historicalFigures.sortOrder) })
        .from(historicalFigures);
      
      const sortOrder = (maxSortOrder[0]?.maxOrder || 0) + 1;
      
      const [newFigure] = await db.insert(historicalFigures)
        .values({
          ...figureData,
          sortOrder: sortOrder
        })
        .returning();
        
      return newFigure;
    } catch (error) {
      handleDbError(error, "createHistoricalFigure");
      return null;
    }
  },
  
  updateHistoricalFigure: async (id: number, figureData: Partial<HistoricalFigure>): Promise<HistoricalFigure | null> => {
    try {
      const [updatedFigure] = await db.update(historicalFigures)
        .set(figureData)
        .where(eq(historicalFigures.id, id))
        .returning();
        
      return updatedFigure || null;
    } catch (error) {
      handleDbError(error, "updateHistoricalFigure");
      return null;
    }
  },
  
  deleteHistoricalFigure: async (id: number): Promise<boolean> => {
    try {
      const result = await db.delete(historicalFigures)
        .where(eq(historicalFigures.id, id));
        
      return true;
    } catch (error) {
      handleDbError(error, "deleteHistoricalFigure");
      return false;
    }
  },
  
  reorderHistoricalFigures: async (orderedIds: number[]): Promise<boolean> => {
    try {
      // Cập nhật thứ tự của các nhân vật lịch sử dựa trên thứ tự id
      await db.transaction(async (tx) => {
        for (let i = 0; i < orderedIds.length; i++) {
          await tx.update(historicalFigures)
            .set({ sortOrder: i })
            .where(eq(historicalFigures.id, orderedIds[i]));
        }
      });
      
      return true;
    } catch (error) {
      handleDbError(error, "reorderHistoricalFigures");
      return false;
    }
  },
  
  // Historical Sites methods
  getAllHistoricalSites: async (): Promise<HistoricalSite[]> => {
    try {
      return await db.query.historicalSites.findMany({
        orderBy: asc(historicalSites.sortOrder)
      });
    } catch (error) {
      handleDbError(error, "getAllHistoricalSites");
      return [];
    }
  },
  
  getHistoricalSiteById: async (id: number): Promise<HistoricalSite | null> => {
    try {
      const result = await db.query.historicalSites.findFirst({
        where: eq(historicalSites.id, id)
      });
      return result || null;
    } catch (error) {
      handleDbError(error, "getHistoricalSiteById");
      return null;
    }
  },
  
  getHistoricalSitesByPeriod: async (periodId: number): Promise<HistoricalSite[]> => {
    try {
      return await db.query.historicalSites.findMany({
        where: eq(historicalSites.periodId, periodId),
        orderBy: asc(historicalSites.sortOrder)
      });
    } catch (error) {
      handleDbError(error, "getHistoricalSitesByPeriod");
      return [];
    }
  },
  
  getHistoricalSitesByPeriodSlug: async (periodSlug: string): Promise<HistoricalSite[]> => {
    try {
      // Đầu tiên tìm thời kỳ theo slug
      const period = await db.query.periods.findFirst({
        where: eq(periods.slug, periodSlug)
      });
      
      if (!period) return [];
      
      // Sau đó lấy các di tích theo periodId
      return await db.query.historicalSites.findMany({
        where: eq(historicalSites.periodId, period.id),
        orderBy: asc(historicalSites.sortOrder)
      });
    } catch (error) {
      handleDbError(error, "getHistoricalSitesByPeriodSlug");
      return [];
    }
  },
  
  // Thêm các phương thức quản lý CRUD cho địa danh lịch sử
  createHistoricalSite: async (siteData: Omit<HistoricalSite, 'id'>): Promise<HistoricalSite> => {
    try {
      const [result] = await db.insert(historicalSites).values(siteData).returning();
      return result;
    } catch (error) {
      handleDbError(error, "createHistoricalSite");
      throw error;
    }
  },
  
  updateHistoricalSite: async (id: number, siteData: Partial<HistoricalSite>): Promise<HistoricalSite | null> => {
    try {
      const [updated] = await db
        .update(historicalSites)
        .set(siteData)
        .where(eq(historicalSites.id, id))
        .returning();
      return updated || null;
    } catch (error) {
      handleDbError(error, "updateHistoricalSite");
      return null;
    }
  },
  
  deleteHistoricalSite: async (id: number): Promise<boolean> => {
    try {
      await db
        .delete(historicalSites)
        .where(eq(historicalSites.id, id));
      return true;
    } catch (error) {
      handleDbError(error, "deleteHistoricalSite");
      return false;
    }
  },
  
  reorderHistoricalSites: async (orderedIds: number[]): Promise<boolean> => {
    try {
      // Chuyển đổi tất cả ID sang số nguyên nếu cần
      const numericIds = orderedIds.map(id => {
        return typeof id === 'string' ? parseInt(id, 10) : Number(id);
      }).filter(id => !isNaN(id) && id > 0);
      
      // Cập nhật thứ tự cho từng địa danh
      for (let i = 0; i < numericIds.length; i++) {
        await db
          .update(historicalSites)
          .set({ sortOrder: i })
          .where(eq(historicalSites.id, numericIds[i]));
      }
      return true;
    } catch (error) {
      handleDbError(error, "reorderHistoricalSites");
      return false;
    }
  },
  
  // Search functionality
  search: async (term?: string, periodSlug?: string, eventTypeSlug?: string): Promise<{
    periods: Period[],
    events: (Event & { eventTypes?: EventType[] })[],
    figures: HistoricalFigure[],
    eventTypes: EventType[],
    sites: HistoricalSite[]
  }> => {
    try {
      let filteredPeriods: Period[] = [];
      let filteredEvents: (Event & { eventTypes?: EventType[] })[] = [];
      let filteredFigures: HistoricalFigure[] = [];
      let filteredEventTypes: EventType[] = [];
      
      // Nếu không có tham số tìm kiếm nào, lấy tất cả dữ liệu
      const noFilters = !term && !periodSlug && !eventTypeSlug;
      
      // Get all event types for the dropdown
      filteredEventTypes = await db.query.eventTypes.findMany({
        orderBy: asc(eventTypes.name)
      });
      
      // If there's a period slug filter, get that period first
      let periodFilter: Period | null = null;
      if (periodSlug) {
        const result = await db.query.periods.findFirst({
          where: eq(periods.slug, periodSlug)
        });
        periodFilter = result || null;
      }
      
      // If there's an event type filter, get the events for that type
      let eventTypeFilter: EventType | null = null;
      let eventIdsByType: number[] = [];
      if (eventTypeSlug) {
        const result = await db.query.eventTypes.findFirst({
          where: eq(eventTypes.slug, eventTypeSlug)
        });
        eventTypeFilter = result || null;
        
        if (eventTypeFilter) {
          // Get all event IDs for this type
          const relations = await db.query.eventToEventType.findMany({
            where: eq(eventToEventType.eventTypeId, eventTypeFilter.id)
          });
          eventIdsByType = relations.map(rel => rel.eventId);
        }
      }
      
      // Search terms for periods
      if (term) {
        filteredPeriods = await db.query.periods.findMany({
          where: or(
            like(periods.name, `%${term}%`),
            like(periods.description, `%${term}%`)
          ),
          orderBy: asc(periods.sortOrder)
        });
      } else if (periodFilter) {
        // If only period filter, return just that period
        filteredPeriods = [periodFilter];
      } else {
        // If no term or period filter, return all periods
        filteredPeriods = await db.query.periods.findMany({
          orderBy: asc(periods.sortOrder)
        });
      }
      
      // Search terms for events
      if (term || periodFilter || eventTypeFilter || noFilters) {
        let eventsQuery = db.query.events;
        const conditions = [];
        
        if (term) {
          conditions.push(
            or(
              like(events.title, `%${term}%`),
              like(events.description, `%${term}%`)
            )
          );
        }
        
        if (periodFilter) {
          conditions.push(eq(events.periodId, periodFilter.id));
        }
        
        if (eventTypeFilter && eventIdsByType.length > 0) {
          // Create a SQL condition for matching event IDs
          const eventIdSql = or(...eventIdsByType.map(id => eq(events.id, id)));
          conditions.push(eventIdSql);
        } else if (eventTypeFilter && eventIdsByType.length === 0) {
          // If we've filtered by event type but no events match, return empty array
          return {
            periods: filteredPeriods,
            events: [],
            figures: [],
            eventTypes: filteredEventTypes,
            sites: []
          };
        }
        
        if (conditions.length > 0 || noFilters) {
          const baseEvents = await eventsQuery.findMany({
            where: conditions.length > 0 ? and(...conditions) : undefined,
            orderBy: [asc(events.periodId), asc(events.sortOrder)]
          });
          
          // For each event, load its event types
          filteredEvents = await Promise.all(baseEvents.map(async (event) => {
            // Get event types for this event
            const relations = await db.query.eventToEventType.findMany({
              where: eq(eventToEventType.eventId, event.id),
              with: {
                eventType: true
              }
            });
            
            // Map to event types
            const types = relations.map(rel => rel.eventType);
            
            return {
              ...event,
              eventTypes: types
            };
          }));
        }
      }
      
      // Search terms for historical figures
      if (term || periodFilter || noFilters) {
        let figuresQuery = db.query.historicalFigures;
        const conditions = [];
        
        if (term) {
          conditions.push(
            or(
              like(historicalFigures.name, `%${term}%`),
              like(historicalFigures.description, `%${term}%`)
            )
          );
        }
        
        if (periodFilter) {
          // Sử dụng periodId để tìm chính xác
          conditions.push(eq(historicalFigures.periodId, periodFilter.id));
        }
        
        if (conditions.length > 0 || noFilters) {
          filteredFigures = await figuresQuery.findMany({
            where: conditions.length > 0 ? and(...conditions) : undefined,
            orderBy: asc(historicalFigures.sortOrder)
          });
        }
      }
      
      // Search terms for historical sites
      let filteredSites: HistoricalSite[] = [];
      if (term || periodFilter || noFilters) {
        let sitesQuery = db.query.historicalSites;
        const conditions = [];
        
        if (term) {
          conditions.push(
            or(
              like(historicalSites.name, `%${term}%`),
              like(historicalSites.location, `%${term}%`),
              like(historicalSites.description, `%${term}%`)
            )
          );
        }
        
        if (periodFilter) {
          conditions.push(eq(historicalSites.periodId, periodFilter.id));
        }
        
        if (conditions.length > 0 || noFilters) {
          filteredSites = await sitesQuery.findMany({
            where: conditions.length > 0 ? and(...conditions) : undefined,
            orderBy: asc(historicalSites.sortOrder)
          });
        }
      }
      
      return {
        periods: filteredPeriods,
        events: filteredEvents,
        figures: filteredFigures,
        eventTypes: filteredEventTypes,
        sites: filteredSites
      };
    } catch (error) {
      handleDbError(error, "search");
      return { periods: [], events: [], figures: [], eventTypes: [], sites: [] };
    }
  },
  
  // Lấy tất cả các thực thể liên quan đến một thời kỳ
  getPeriodRelatedEntities: async (periodId: number): Promise<{
    events: Event[], 
    figures: HistoricalFigure[], 
    sites: HistoricalSite[]
  }> => {
    try {
      // Lấy tất cả các sự kiện thuộc thời kỳ này
      const eventsData = await db.select().from(events).where(eq(events.periodId, periodId));
      
      // Lấy tất cả nhân vật lịch sử thuộc thời kỳ này
      const figuresData = await db.select().from(historicalFigures).where(eq(historicalFigures.periodId, periodId));
      
      // Lấy tất cả địa danh lịch sử thuộc thời kỳ này
      const sitesData = await db.select().from(historicalSites).where(eq(historicalSites.periodId, periodId));
      
      return { 
        events: eventsData, 
        figures: figuresData, 
        sites: sitesData 
      };
    } catch (error) {
      handleDbError(error, "getPeriodRelatedEntities");
      return { events: [], figures: [], sites: [] };
    }
  },
  

  
  // Cập nhật thời kỳ cho một loạt sự kiện
  updateEventsPeriod: async (eventIds: number[], newPeriodId: number): Promise<boolean> => {
    try {
      for (const eventId of eventIds) {
        await db.update(events)
          .set({ periodId: newPeriodId })
          .where(eq(events.id, eventId));
      }
      return true;
    } catch (error) {
      handleDbError(error, "updateEventsPeriod");
      return false;
    }
  },
  
  // Cập nhật thời kỳ cho một loạt nhân vật lịch sử
  updateHistoricalFiguresPeriod: async (figureIds: number[], newPeriodId: number): Promise<boolean> => {
    try {
      // Lấy thông tin thời kỳ mới để cập nhật periodText
      const period = await db.query.periods.findFirst({
        where: eq(periods.id, newPeriodId)
      });
      
      if (!period) return false;
      
      for (const figureId of figureIds) {
        await db.update(historicalFigures)
          .set({ 
            periodId: newPeriodId,
            periodText: period.name // Cập nhật cả periodText để tương thích ngược
          })
          .where(eq(historicalFigures.id, figureId));
      }
      return true;
    } catch (error) {
      handleDbError(error, "updateHistoricalFiguresPeriod");
      return false;
    }
  },
  
  // Cập nhật thời kỳ cho một loạt địa danh lịch sử
  updateHistoricalSitesPeriod: async (siteIds: number[], newPeriodId: number): Promise<boolean> => {
    try {
      for (const siteId of siteIds) {
        await db.update(historicalSites)
          .set({ periodId: newPeriodId })
          .where(eq(historicalSites.id, siteId));
      }
      return true;
    } catch (error) {
      handleDbError(error, "updateHistoricalSitesPeriod");
      return false;
    }
  },
  
  // Các hàm xử lý Người đóng góp (Contributors)
  getAllContributors: async (): Promise<Contributor[]> => {
    try {
      return await db.select().from(contributors)
        .orderBy(asc(contributors.sortOrder), asc(contributors.name));
    } catch (error) {
      handleDbError(error, "getAllContributors");
      return [];
    }
  },
  
  getActiveContributors: async (): Promise<Contributor[]> => {
    try {
      return await db.select().from(contributors)
        .where(eq(contributors.isActive, true))
        .orderBy(asc(contributors.sortOrder), asc(contributors.name));
    } catch (error) {
      handleDbError(error, "getActiveContributors");
      return [];
    }
  },
  
  getContributor: async (id: number): Promise<Contributor | null> => {
    try {
      const result = await db.select().from(contributors)
        .where(eq(contributors.id, id))
        .limit(1);
      return result[0] || null;
    } catch (error) {
      handleDbError(error, "getContributor");
      return null;
    }
  },
  
  createContributor: async (data: InsertContributor): Promise<Contributor> => {
    try {
      const [newContributor] = await db.insert(contributors).values(data).returning();
      return newContributor;
    } catch (error) {
      handleDbError(error, "createContributor");
      throw error;
    }
  },
  
  updateContributor: async (id: number, data: Partial<InsertContributor>): Promise<Contributor | null> => {
    try {
      const [updatedContributor] = await db.update(contributors)
        .set(data)
        .where(eq(contributors.id, id))
        .returning();
      return updatedContributor || null;
    } catch (error) {
      handleDbError(error, "updateContributor");
      throw error;
    }
  },
  
  updateContributorSortOrder: async (id: number, sortOrder: number): Promise<boolean> => {
    try {
      await db.update(contributors)
        .set({ sortOrder })
        .where(eq(contributors.id, id));
      return true;
    } catch (error) {
      handleDbError(error, "updateContributorSortOrder");
      return false;
    }
  },
  
  deleteContributor: async (id: number): Promise<boolean> => {
    try {
      await db.delete(contributors).where(eq(contributors.id, id));
      return true;
    } catch (error) {
      handleDbError(error, "deleteContributor");
      return false;
    }
  },
  
  // Lấy tất cả tin tức (có thể lọc theo trạng thái)
  getAllNews: async (filters: { published?: boolean } = {}): Promise<News[]> => {
    try {
      const conditions = [];
      
      // Lọc theo trạng thái xuất bản nếu có
      if (filters.published !== undefined) {
        conditions.push(eq(news.published, filters.published));
      }
      
      return await db.select().from(news)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(news.createdAt));
    } catch (error) {
      handleDbError(error, "getAllNews");
      return [];
    }
  }
};
