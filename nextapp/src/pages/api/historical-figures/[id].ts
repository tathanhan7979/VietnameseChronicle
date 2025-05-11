import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@db';
import { historicalFigures } from '@shared/schema';
import { eq } from 'drizzle-orm';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  
  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ error: 'Valid historical figure ID is required' });
  }

  const figureId = Number(id);

  try {
    const figure = await db.query.historicalFigures.findFirst({
      where: eq(historicalFigures.id, figureId),
      with: {
        period: true,
      },
    });
    
    if (!figure) {
      return res.status(404).json({ error: 'Historical figure not found' });
    }
    
    res.status(200).json(figure);
  } catch (error) {
    console.error(`Error fetching historical figure with ID ${id}:`, error);
    res.status(500).json({ error: 'Failed to fetch historical figure' });
  }
}