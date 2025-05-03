import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
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
  year: text("year").notNull(),
  imageUrl: text("image_url"),
  eventType: text("event_type"),
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
  imageUrl: text("image_url").notNull(),
  achievements: jsonb("achievements"),
  sortOrder: integer("sort_order").notNull(),
});

export const insertHistoricalFigureSchema = createInsertSchema(historicalFigures);
export type InsertHistoricalFigure = z.infer<typeof insertHistoricalFigureSchema>;
export type HistoricalFigure = typeof historicalFigures.$inferSelect;

// Define Relations
export const periodsRelations = relations(periods, ({ many }) => ({
  events: many(events)
}));

export const eventsRelations = relations(events, ({ one }) => ({
  period: one(periods, { fields: [events.periodId], references: [periods.id] })
}));
