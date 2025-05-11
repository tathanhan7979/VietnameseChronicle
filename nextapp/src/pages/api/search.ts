import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@db';
import { periods, events, historicalFigures, historicalSites, eventTypes } from '@shared/schema';
import { and, like, eq } from 'drizzle-orm';
import { SearchResult } from '../../lib/types';

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
        like(periods.name.toLowerCase(), searchTerm),
        periodId ? eq(periods.id, Number(periodId)) : undefined
      ),
    });

    periodResults.forEach(period => {
      results.push({
        id: `period-${period.id}`,
        type: 'period',
        title: period.name,
        subtitle: period.timeframe,
        link: `/thoi-ky/${period.slug}`,
        icon: 'timeline',
      });
    });

    // Tìm kiếm trong bảng events
    const eventResults = await db.query.events.findMany({
      where: and(
        like(events.title.toLowerCase(), searchTerm),
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
      if (eventTypeId) {
        const hasEventType = event.eventTypes.some(
          et => et.eventType.id === Number(eventTypeId)
        );

        if (!hasEventType) {
          return;
        }
      }

      results.push({
        id: `event-${event.id}`,
        type: 'event',
        title: event.title,
        subtitle: `${event.year} - ${event.period?.name || ''}`,
        link: `/su-kien/${event.id}/${event.slug || event.title.toLowerCase().replace(/ /g, '-')}`,
        icon: 'event',
      });
    });

    // Tìm kiếm trong bảng historical figures
    const figureResults = await db.query.historicalFigures.findMany({
      where: and(
        like(historicalFigures.name.toLowerCase(), searchTerm),
        periodId ? eq(historicalFigures.periodId, Number(periodId)) : undefined
      ),
      with: {
        period: true,
      },
    });

    figureResults.forEach(figure => {
      results.push({
        id: `figure-${figure.id}`,
        type: 'figure',
        title: figure.name,
        subtitle: `${figure.lifespan} - ${figure.period?.name || ''}`,
        link: `/nhan-vat/${figure.id}/${figure.slug || figure.name.toLowerCase().replace(/ /g, '-')}`,
        icon: 'person',
      });
    });

    // Tìm kiếm trong bảng historical sites
    const siteResults = await db.query.historicalSites.findMany({
      where: and(
        like(historicalSites.name.toLowerCase(), searchTerm),
        periodId ? eq(historicalSites.periodId, Number(periodId)) : undefined
      ),
      with: {
        period: true,
      },
    });

    siteResults.forEach(site => {
      results.push({
        id: `site-${site.id}`,
        type: 'site',
        title: site.name,
        subtitle: `${site.location} - ${site.period?.name || ''}`,
        link: `/di-tich/${site.id}/${site.slug || site.name.toLowerCase().replace(/ /g, '-')}`,
        icon: 'location',
      });
    });

    res.status(200).json(results);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
}