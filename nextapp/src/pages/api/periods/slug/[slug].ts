import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../../../db';
import { periods } from '../../../../../shared/schema';
import { eq } from 'drizzle-orm';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { slug } = req.query;
  
  if (!slug || typeof slug !== 'string') {
    return res.status(400).json({ error: 'Slug is required' });
  }

  try {
    const period = await db.query.periods.findFirst({
      where: eq(periods.slug, slug),
    });
    
    if (!period) {
      return res.status(404).json({ error: 'Period not found' });
    }
    
    res.status(200).json(period);
  } catch (error) {
    console.error(`Error fetching period with slug ${slug}:`, error);
    res.status(500).json({ error: 'Failed to fetch period' });
  }
}