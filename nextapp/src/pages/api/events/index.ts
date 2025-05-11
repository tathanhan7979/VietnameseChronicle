import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@db';
import { events } from '@shared/schema';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { limit, periodId } = req.query;
  
  try {
    let query = db.query.events;
    let queryOptions: any = {
      orderBy: (events, { asc }) => [asc(events.id)],
      with: {
        period: true,
        eventTypes: {
          with: {
            eventType: true,
          },
        },
      },
    };
    
    // Thêm điều kiện lọc theo periodId nếu được chỉ định
    if (periodId && !isNaN(Number(periodId))) {
      queryOptions.where = (events, { eq }) => eq(events.periodId, Number(periodId));
    }
    
    // Giới hạn số lượng kết quả nếu được chỉ định
    if (limit && !isNaN(Number(limit))) {
      queryOptions.limit = Number(limit);
    }
    
    const eventsList = await query.findMany(queryOptions);
    
    // Format dữ liệu sự kiện để bao gồm danh sách eventTypes
    const formattedEvents = eventsList.map(event => {
      const formattedEvent = {
        ...event,
        eventTypes: event.eventTypes?.map(relation => relation.eventType),
      };
      // @ts-ignore - xóa thuộc tính không cần thiết
      delete formattedEvent.eventTypesToEvents;
      return formattedEvent;
    });
    
    res.status(200).json(formattedEvents);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
}