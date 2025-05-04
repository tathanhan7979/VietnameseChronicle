import { db } from "@db";
import { 
  periods, 
  events, 
  historicalFigures,
  eventTypes,
  eventToEventType,
  historicalSites,
  feedback,
  settings,
  type Period,
  type Event,
  type HistoricalFigure,
  type EventType,
  type HistoricalSite,
  type Feedback,
  type InsertFeedback,
  type Setting,
  type InsertSetting
} from "@shared/schema";
import { eq, like, and, or, desc, asc } from "drizzle-orm";

// Helper to handle database errors
const handleDbError = (error: unknown, operation: string) => {
  console.error(`Error in ${operation}:`, error);
  throw new Error(`Database error in ${operation}`);
};

export const storage = {
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
          key: "home_background_url",
          value: "https://images.unsplash.com/photo-1624009582782-1be02fbb7f23?q=80&w=2071&auto=format&fit=crop",
          description: "URL ảnh nền của trang chủ",
          displayName: "Ảnh nền trang chủ",
          category: "general",
          inputType: "text",
          sortOrder: 0
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
      // Bắt đầu một transaction để đảm bảo tính nhất quán
      // Tích hợp các ID theo thứ tự mới
      for (let i = 0; i < orderedIds.length; i++) {
        await db
          .update(periods)
          .set({ sortOrder: i })
          .where(eq(periods.id, orderedIds[i]));
      }
      return true;
    } catch (error) {
      handleDbError(error, "reorderPeriods");
      return false;
    }
  },
  
  getPeriodById: async (id: number): Promise<Period | null> => {
    try {
      const result = await db.query.periods.findFirst({
        where: eq(periods.id, id)
      });
      return result || null;
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
  
  getEventsByPeriod: async (periodId: number): Promise<(Event & { eventTypes?: EventType[] })[]> => {
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
      handleDbError(error, "getEventsByPeriod");
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
      return await db.query.historicalFigures.findMany({
        orderBy: asc(historicalFigures.sortOrder)
      });
    } catch (error) {
      handleDbError(error, "getAllHistoricalFigures");
      return [];
    }
  },
  
  getHistoricalFigureById: async (id: number): Promise<HistoricalFigure | null> => {
    try {
      const result = await db.query.historicalFigures.findFirst({
        where: eq(historicalFigures.id, id)
      });
      return result || null;
    } catch (error) {
      handleDbError(error, "getHistoricalFigureById");
      return null;
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
          conditions.push(like(historicalFigures.period, `%${periodFilter.name}%`));
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
  }
};
