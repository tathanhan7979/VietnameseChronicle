import { pgTable, text, serial, integer, boolean, jsonb, primaryKey, doublePrecision, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users table from the original
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
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
  icon: text("icon").notNull(),
  sortOrder: integer("sort_order").notNull(),
});

export const insertPeriodSchema = createInsertSchema(periods);
export type InsertPeriod = z.infer<typeof insertPeriodSchema>;
export type Period = typeof periods.$inferSelect;

// Historical Events table
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  periodId: integer("period_id").references(() => periods.id).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  detailedDescription: text("detailed_description"),
  year: text("year").notNull(),
  imageUrl: text("image_url"),
  // eventType field is removed, using many-to-many relationship instead
  sortOrder: integer("sort_order").notNull(),
});

export const insertEventSchema = createInsertSchema(events);
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;

// Historical Figures table
export const historicalFigures = pgTable("historical_figures", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  period: text("period").notNull(),
  lifespan: text("lifespan").notNull(),
  description: text("description").notNull(),
  detailedDescription: text("detailed_description"),
  imageUrl: text("image_url").notNull(),
  achievements: jsonb("achievements"),
  sortOrder: integer("sort_order").notNull(),
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
  location: text("location").notNull(),
  periodId: integer("period_id").references(() => periods.id),
  description: text("description").notNull(),
  detailedDescription: text("detailed_description"),
  imageUrl: text("image_url"),
  mapUrl: text("map_url"),
  address: text("address"),
  yearBuilt: text("year_built"),
  relatedEventId: integer("related_event_id").references(() => events.id),
  sortOrder: integer("sort_order").notNull(),
});

export const insertHistoricalSiteSchema = createInsertSchema(historicalSites);
export type InsertHistoricalSite = z.infer<typeof insertHistoricalSiteSchema>;
export type HistoricalSite = typeof historicalSites.$inferSelect;

// Relations for Historical Sites
export const historicalSitesRelations = relations(historicalSites, ({ one }) => ({
  period: one(periods, { fields: [historicalSites.periodId], references: [periods.id] }),
  relatedEvent: one(events, { fields: [historicalSites.relatedEventId], references: [events.id] })
}));

// Update period relations to include historical sites
export const periodsRelationsWithSites = relations(periods, ({ many }) => ({
  events: many(events),
  historicalSites: many(historicalSites)
}));

// Bảng lưu thông tin góp ý
export const feedback = pgTable("feedback", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const insertFeedbackSchema = createInsertSchema(feedback);
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
export type Feedback = typeof feedback.$inferSelect;
