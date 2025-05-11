import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@db';
import { periods } from '@shared/schema';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const periodsList = await db.query.periods.findMany({
      orderBy: (periods, { asc }) => [asc(periods.id)],
    });
    
    res.status(200).json(periodsList);
  } catch (error) {
    console.error('Error fetching periods:', error);
    res.status(500).json({ error: 'Failed to fetch periods' });
  }
}