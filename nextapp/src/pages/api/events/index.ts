import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@db';
import { events } from '@shared/schema';

// Định nghĩa type cho event với eventTypes
interface EventWithTypes {
  id: number;
  title: string;
  description: string;
  periodId: number;
  year: string;
  imageUrl: string | null;
  detailedDescription: string | null;
  sortOrder: number;
  period?: any;
  eventTypes?: any[];
  eventTypesToEvents?: any[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { limit, periodId } = req.query;
  
  try {
    let query = db.query.events;
    let queryOptions: any = {
      orderBy: (events: any, { asc }: any) => [asc(events.id)],
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
      queryOptions.where = (events: any, { eq }: any) => eq(events.periodId, Number(periodId));
    }
    
    // Giới hạn số lượng kết quả nếu được chỉ định
    if (limit && !isNaN(Number(limit))) {
      queryOptions.limit = Number(limit);
    }
    
    const eventsList = await query.findMany(queryOptions);
    
    // Format dữ liệu sự kiện để bao gồm danh sách eventTypes
    const formattedEvents = eventsList.map((event: any) => {
      // Xử lý eventTypes một cách an toàn
      const eventTypes = event.eventTypes ? 
        Array.isArray(event.eventTypes) ? 
          event.eventTypes.map((relation: any) => relation.eventType) : 
          [] : 
        [];
          
      const formattedEvent = {
        ...event,
        eventTypes
      };
      
      // Xóa thuộc tính không cần thiết
      if (formattedEvent.eventTypesToEvents) {
        delete formattedEvent.eventTypesToEvents;
      }
      
      return formattedEvent;
    });
    
    res.status(200).json(formattedEvents);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
}