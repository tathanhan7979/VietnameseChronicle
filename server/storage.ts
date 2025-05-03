import { db } from "@db";
import { 
  periods, 
  events, 
  historicalFigures,
  type Period,
  type Event,
  type HistoricalFigure
} from "@shared/schema";
import { eq, like, and, or, desc, asc } from "drizzle-orm";

// Helper to handle database errors
const handleDbError = (error: unknown, operation: string) => {
  console.error(`Error in ${operation}:`, error);
  throw new Error(`Database error in ${operation}`);
};

export const storage = {
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
  
  getPeriodById: async (id: number): Promise<Period | null> => {
    try {
      return await db.query.periods.findFirst({
        where: eq(periods.id, id)
      });
    } catch (error) {
      handleDbError(error, "getPeriodById");
      return null;
    }
  },
  
  getPeriodBySlug: async (slug: string): Promise<Period | null> => {
    try {
      return await db.query.periods.findFirst({
        where: eq(periods.slug, slug)
      });
    } catch (error) {
      handleDbError(error, "getPeriodBySlug");
      return null;
    }
  },
  
  // Event methods
  getAllEvents: async (): Promise<Event[]> => {
    try {
      return await db.query.events.findMany({
        orderBy: [asc(events.periodId), asc(events.sortOrder)]
      });
    } catch (error) {
      handleDbError(error, "getAllEvents");
      return [];
    }
  },
  
  getEventById: async (id: number): Promise<Event | null> => {
    try {
      return await db.query.events.findFirst({
        where: eq(events.id, id)
      });
    } catch (error) {
      handleDbError(error, "getEventById");
      return null;
    }
  },
  
  getEventsByPeriod: async (periodId: number): Promise<Event[]> => {
    try {
      return await db.query.events.findMany({
        where: eq(events.periodId, periodId),
        orderBy: asc(events.sortOrder)
      });
    } catch (error) {
      handleDbError(error, "getEventsByPeriod");
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
      return await db.query.historicalFigures.findFirst({
        where: eq(historicalFigures.id, id)
      });
    } catch (error) {
      handleDbError(error, "getHistoricalFigureById");
      return null;
    }
  },
  
  // Search functionality
  search: async (term?: string, periodSlug?: string): Promise<{
    periods: Period[],
    events: Event[],
    figures: HistoricalFigure[]
  }> => {
    try {
      let filteredPeriods: Period[] = [];
      let filteredEvents: Event[] = [];
      let filteredFigures: HistoricalFigure[] = [];
      
      // If there's a period slug filter, get that period first
      let periodFilter: Period | null = null;
      if (periodSlug) {
        periodFilter = await db.query.periods.findFirst({
          where: eq(periods.slug, periodSlug)
        });
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
      if (term || periodFilter) {
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
        
        if (conditions.length > 0) {
          filteredEvents = await eventsQuery.findMany({
            where: and(...conditions),
            orderBy: [asc(events.periodId), asc(events.sortOrder)]
          });
        }
      }
      
      // Search terms for historical figures
      if (term || periodFilter) {
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
        
        if (conditions.length > 0) {
          filteredFigures = await figuresQuery.findMany({
            where: and(...conditions),
            orderBy: asc(historicalFigures.sortOrder)
          });
        }
      }
      
      return {
        periods: filteredPeriods,
        events: filteredEvents,
        figures: filteredFigures
      };
    } catch (error) {
      handleDbError(error, "search");
      return { periods: [], events: [], figures: [] };
    }
  }
};
