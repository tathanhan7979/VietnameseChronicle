import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@db';
import { periods, events, historicalFigures, historicalSites, eventTypes } from '@shared/schema';
import { and, like, eq, sql, asc } from 'drizzle-orm';

// Search result interface
interface SearchResult {
  id: string;
  type: 'period' | 'event' | 'figure' | 'site';
  title: string;
  subtitle: string;
  link: string;
  icon: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { q, periodId, eventTypeId } = req.query;

  if (!q || typeof q !== 'string') {
    return res.status(400).json({ error: 'Search query is required' });
  }

  try {
    const searchTerm = `%${q.toLowerCase()}%`;
    const results: SearchResult[] = [];

    // Tìm kiếm trong bảng periods
    const periodResults = await db.query.periods.findMany({
      where: and(
        like(sql`LOWER(${periods.name})`, searchTerm),
        periodId ? eq(periods.id, Number(periodId)) : undefined
      ),
      orderBy: periods.sortOrder ? asc(periods.sortOrder) : undefined
    });

    periodResults.forEach(period => {
      const slug = period.slug || period.name.toLowerCase().replace(/ /g, '-');
      results.push({
        id: `period-${period.id}`,
        type: 'period',
        title: period.name,
        subtitle: period.timeframe,
        link: `/thoi-ky/${slug}`,
        icon: 'timeline',
      });
    });

    // Tìm kiếm trong bảng events
    const eventResults = await db.query.events.findMany({
      where: and(
        like(sql`LOWER(${events.title})`, searchTerm),
        periodId ? eq(events.periodId, Number(periodId)) : undefined
      ),
      with: {
        period: true,
        eventTypes: {
          with: {
            eventType: true,
          },
        },
      },
    });

    eventResults.forEach(event => {
      // Kiểm tra xem event có thuộc vào eventTypeId được chỉ định không
      if (eventTypeId && event.eventTypes) {
        const hasEventType = event.eventTypes.some(
          et => et.eventType && et.eventType.id === Number(eventTypeId)
        );

        if (!hasEventType) {
          return;
        }
      }

      const slug = event.title.toLowerCase().replace(/ /g, '-');
      results.push({
        id: `event-${event.id}`,
        type: 'event',
        title: event.title,
        subtitle: `${event.year} - ${event.period?.name || ''}`,
        link: `/su-kien/${event.id}/${slug}`,
        icon: 'event',
      });
    });

    // Tìm kiếm trong bảng historical figures
    const figureResults = await db.query.historicalFigures.findMany({
      where: and(
        like(sql`LOWER(${historicalFigures.name})`, searchTerm),
        periodId ? eq(historicalFigures.periodId, Number(periodId)) : undefined
      ),
      with: {
        period: true,
      },
    });

    figureResults.forEach(figure => {
      const slug = figure.name.toLowerCase().replace(/ /g, '-');
      results.push({
        id: `figure-${figure.id}`,
        type: 'figure',
        title: figure.name,
        subtitle: `${figure.lifespan} - ${figure.period?.name || ''}`,
        link: `/nhan-vat/${figure.id}/${slug}`,
        icon: 'person',
      });
    });

    // Tìm kiếm trong bảng historical sites
    const siteResults = await db.query.historicalSites.findMany({
      where: and(
        like(sql`LOWER(${historicalSites.name})`, searchTerm),
        periodId ? eq(historicalSites.periodId, Number(periodId)) : undefined
      ),
      with: {
        period: true,
      },
    });

    siteResults.forEach(site => {
      const slug = site.name.toLowerCase().replace(/ /g, '-');
      results.push({
        id: `site-${site.id}`,
        type: 'site',
        title: site.name,
        subtitle: `${site.location} - ${site.period?.name || ''}`,
        link: `/di-tich/${site.id}/${slug}`,
        icon: 'location',
      });
    });

    res.status(200).json(results);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
}