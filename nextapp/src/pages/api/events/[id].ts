import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@db';
import { events } from '@shared/schema';
import { eq } from 'drizzle-orm';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  
  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ error: 'Valid event ID is required' });
  }

  const eventId = Number(id);

  try {
    const event = await db.query.events.findFirst({
      where: eq(events.id, eventId),
      with: {
        period: true,
        eventTypes: {
          with: {
            eventType: true,
          },
        },
      },
    });
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Format dữ liệu sự kiện để đơn giản hóa danh sách loại sự kiện
    const formattedEvent = {
      ...event,
      eventTypes: event.eventTypes?.map(relation => relation.eventType),
    };
    
    res.status(200).json(formattedEvent);
  } catch (error) {
    console.error(`Error fetching event with ID ${id}:`, error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
}