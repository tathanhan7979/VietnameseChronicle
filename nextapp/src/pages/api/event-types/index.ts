import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../../db';
import { eventTypes } from '../../../../shared/schema';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const eventTypesList = await db.query.eventTypes.findMany({
      orderBy: (eventTypes, { asc }) => [asc(eventTypes.id)],
    });
    
    res.status(200).json(eventTypesList);
  } catch (error) {
    console.error('Error fetching event types:', error);
    res.status(500).json({ error: 'Failed to fetch event types' });
  }
}