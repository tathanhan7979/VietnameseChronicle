import { db } from "@db";
import { 
  periods, 
  events, 
  historicalFigures,
  eventTypes,
  eventToEventType,
  type Period,
  type Event,
  type HistoricalFigure,
  type EventType
} from "@shared/schema";
import { eq, like, and, or, desc, asc } from "drizzle-orm";

// Helper to handle database errors
const handleDbError = (error: unknown, operation: string) => {
  console.error(`Error in ${operation}:`, error);
  throw new Error(`Database error in ${operation}`);
};

export const storage = {
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
  search: async (term?: string, periodSlug?: string, eventTypeSlug?: string): Promise<{
    periods: Period[],
    events: Event[],
    figures: HistoricalFigure[],
    eventTypes: EventType[]
  }> => {
    try {
      let filteredPeriods: Period[] = [];
      let filteredEvents: Event[] = [];
      let filteredFigures: HistoricalFigure[] = [];
      let filteredEventTypes: EventType[] = [];
      
      // Get all event types for the dropdown
      filteredEventTypes = await db.query.eventTypes.findMany({
        orderBy: asc(eventTypes.name)
      });
      
      // If there's a period slug filter, get that period first
      let periodFilter: Period | null = null;
      if (periodSlug) {
        periodFilter = await db.query.periods.findFirst({
          where: eq(periods.slug, periodSlug)
        });
        if (periodFilter === undefined) periodFilter = null;
      }
      
      // If there's an event type filter, get the events for that type
      let eventTypeFilter: EventType | null = null;
      let eventIdsByType: number[] = [];
      if (eventTypeSlug) {
        eventTypeFilter = await db.query.eventTypes.findFirst({
          where: eq(eventTypes.slug, eventTypeSlug)
        });
        if (eventTypeFilter === undefined) eventTypeFilter = null;
        
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
      if (term || periodFilter || eventTypeFilter) {
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
          conditions.push((fields) => {
            const eventIdConditions = eventIdsByType.map(id => eq(fields.id, id));
            return or(...eventIdConditions);
          });
        } else if (eventTypeFilter && eventIdsByType.length === 0) {
          // If we've filtered by event type but no events match, return empty array
          return {
            periods: filteredPeriods,
            events: [],
            figures: [],
            eventTypes: filteredEventTypes
          };
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
        figures: filteredFigures,
        eventTypes: filteredEventTypes
      };
    } catch (error) {
      handleDbError(error, "search");
      return { periods: [], events: [], figures: [], eventTypes: [] };
    }
  }
};
