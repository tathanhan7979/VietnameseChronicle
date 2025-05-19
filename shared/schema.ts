import { pgTable, text, serial, integer, boolean, jsonb, primaryKey, doublePrecision, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users table for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  can_manage_periods: boolean("can_manage_periods").default(false).notNull(),
  can_manage_events: boolean("can_manage_events").default(false).notNull(),
  can_manage_figures: boolean("can_manage_figures").default(false).notNull(),
  can_manage_sites: boolean("can_manage_sites").default(false).notNull(),
  can_manage_news: boolean("can_manage_news").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastLoginAt: timestamp("last_login_at")
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  isAdmin: true,
  can_manage_periods: true,
  can_manage_events: true,
  can_manage_figures: true,
  can_manage_sites: true,
  can_manage_news: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Historical Periods table
export const periods = pgTable("periods", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  timeframe: text("timeframe").notNull(),
  description: text("description").notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  isShow: boolean("is_show").default(true).notNull(),
  icon: text("icon").default("circle"),
});

export const insertPeriodSchema = createInsertSchema(periods);
export type InsertPeriod = z.infer<typeof insertPeriodSchema>;
export type Period = typeof periods.$inferSelect;

// Historical Events table
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  periodId: integer("period_id").references(() => periods.id).notNull(),
  title: text("title").notNull(),
  slug: text("slug"),  // Thêm trường slug cho URL thân thiện
  description: text("description").notNull(),
  detailedDescription: text("detailed_description"),
  year: text("year").notNull(),
  imageUrl: text("image_url"),
  // eventType field is removed, using many-to-many relationship instead
  sortOrder: integer("sort_order").default(0).notNull(),
});

export const insertEventSchema = createInsertSchema(events);
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;

// Historical Figures table
export const historicalFigures = pgTable("historical_figures", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug"),  // Thêm trường slug cho URL thân thiện
  periodId: integer("period_id").references(() => periods.id).notNull(), // Làm cho periodId bắt buộc
  periodText: text("period"), // Để lại trường nhưng không bắt buộc - sẽ dần dần loại bỏ
  lifespan: text("lifespan").notNull(),
  description: text("description").notNull(),
  detailedDescription: text("detailed_description"),
  imageUrl: text("image_url").notNull(),
  achievements: jsonb("achievements"),
  sortOrder: integer("sort_order").default(0).notNull(),
});

export const insertHistoricalFigureSchema = createInsertSchema(historicalFigures);
export type InsertHistoricalFigure = z.infer<typeof insertHistoricalFigureSchema>;
export type HistoricalFigure = typeof historicalFigures.$inferSelect;

// Event Types table
export const eventTypes = pgTable("event_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  color: text("color"),
  sortOrder: integer("sort_order").default(0).notNull(),
});

export const insertEventTypeSchema = createInsertSchema(eventTypes);
export type InsertEventType = z.infer<typeof insertEventTypeSchema>;
export type EventType = typeof eventTypes.$inferSelect;

// Junction table for Event to EventType (many-to-many)
export const eventToEventType = pgTable("event_to_event_type", {
  eventId: integer("event_id").notNull().references(() => events.id),
  eventTypeId: integer("event_type_id").notNull().references(() => eventTypes.id),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.eventId, table.eventTypeId] })
  };
});

export const insertEventToEventTypeSchema = createInsertSchema(eventToEventType);
export type InsertEventToEventType = z.infer<typeof insertEventToEventTypeSchema>;
export type EventToEventType = typeof eventToEventType.$inferSelect;

// Define Relations
export const periodsRelations = relations(periods, ({ many }) => ({
  events: many(events)
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  period: one(periods, { fields: [events.periodId], references: [periods.id] }),
  eventTypes: many(eventToEventType)
}));

export const eventTypesRelations = relations(eventTypes, ({ many }) => ({
  events: many(eventToEventType)
}));

export const eventToEventTypeRelations = relations(eventToEventType, ({ one }) => ({
  event: one(events, { fields: [eventToEventType.eventId], references: [events.id] }),
  eventType: one(eventTypes, { fields: [eventToEventType.eventTypeId], references: [eventTypes.id] })
}));

// Historical Sites table
export const historicalSites = pgTable("historical_sites", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug"),  // Thêm trường slug cho URL thân thiện
  location: text("location").notNull(),
  periodId: integer("period_id").references(() => periods.id),
  description: text("description").notNull(),
  detailedDescription: text("detailed_description"),
  imageUrl: text("image_url"),
  mapUrl: text("map_url"),
  address: text("address"),
  yearBuilt: text("year_built"),
  relatedEventId: integer("related_event_id").references(() => events.id),
  sortOrder: integer("sort_order").default(0).notNull(),
});

export const insertHistoricalSiteSchema = createInsertSchema(historicalSites);
export type InsertHistoricalSite = z.infer<typeof insertHistoricalSiteSchema>;
export type HistoricalSite = typeof historicalSites.$inferSelect;

// Relations for Historical Sites
export const historicalSitesRelations = relations(historicalSites, ({ one }) => ({
  period: one(periods, { fields: [historicalSites.periodId], references: [periods.id] }),
  relatedEvent: one(events, { fields: [historicalSites.relatedEventId], references: [events.id] })
}));

// Update period relations to include historical sites and figures
export const periodsRelationsWithSites = relations(periods, ({ many }) => ({
  events: many(events),
  historicalSites: many(historicalSites),
  historicalFigures: many(historicalFigures)
}));

// Relations for Historical Figures
export const historicalFiguresRelations = relations(historicalFigures, ({ one }) => ({
  period: one(periods, { fields: [historicalFigures.periodId], references: [periods.id] })
}));

// Bảng lưu thông tin góp ý
export const feedback = pgTable("feedback", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  content: text("content").notNull(),
  resolved: boolean("resolved").default(false).notNull(),
  response: text("response"),
  respondedAt: timestamp("responded_at"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const insertFeedbackSchema = createInsertSchema(feedback);
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
export type Feedback = typeof feedback.$inferSelect;

// Bảng thiết lập hệ thống
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value"),
  description: text("description"),
  category: text("category").default("general").notNull(), // general, social, analytics, etc.
  displayName: text("display_name").notNull(),
  inputType: text("input_type").default("text").notNull(), // text, textarea, number, file, etc.
  sortOrder: integer("sort_order").default(0).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const insertSettingSchema = createInsertSchema(settings);
export type InsertSetting = z.infer<typeof insertSettingSchema>;
export type Setting = typeof settings.$inferSelect;

// Bảng tin tức
export const news = pgTable("news", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(),
  summary: text("summary"),
  imageUrl: text("image_url"),
  eventTypeId: integer("event_type_id").references(() => eventTypes.id),
  periodId: integer("period_id").references(() => periods.id),
  eventId: integer("event_id").references(() => events.id),
  historicalFigureId: integer("historical_figure_id").references(() => historicalFigures.id),
  historicalSiteId: integer("historical_site_id").references(() => historicalSites.id),
  viewCount: integer("view_count").default(0).notNull(),
  published: boolean("published").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertNewsSchema = createInsertSchema(news);
export type InsertNews = z.infer<typeof insertNewsSchema>;
export type News = typeof news.$inferSelect;

// Tạo quan hệ giữa tin tức và các bảng khác
export const newsRelations = relations(news, ({ one }) => ({
  eventType: one(eventTypes, {
    fields: [news.eventTypeId],
    references: [eventTypes.id],
  }),
  period: one(periods, {
    fields: [news.periodId],
    references: [periods.id],
  }),
  event: one(events, {
    fields: [news.eventId],
    references: [events.id],
  }),
  historicalFigure: one(historicalFigures, {
    fields: [news.historicalFigureId],
    references: [historicalFigures.id],
  }),
  historicalSite: one(historicalSites, {
    fields: [news.historicalSiteId],
    references: [historicalSites.id],
  }),
}));

// Bảng lưu thông tin người đóng góp
export const contributors = pgTable("contributors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  avatarUrl: text("avatar_url"),
  description: text("description").notNull(),
  role: text("role").notNull(),
  contactInfo: text("contact_info"),
  sortOrder: integer("sort_order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertContributorSchema = createInsertSchema(contributors);
export type InsertContributor = z.infer<typeof insertContributorSchema>;
export type Contributor = typeof contributors.$inferSelect;
