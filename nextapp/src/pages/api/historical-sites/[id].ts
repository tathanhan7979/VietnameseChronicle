import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../../db';
import { historicalSites } from '../../../../shared/schema';
import { eq } from 'drizzle-orm';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  
  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ error: 'Valid historical site ID is required' });
  }

  const siteId = Number(id);

  try {
    const site = await db.query.historicalSites.findFirst({
      where: eq(historicalSites.id, siteId),
      with: {
        period: true,
      },
    });
    
    if (!site) {
      return res.status(404).json({ error: 'Historical site not found' });
    }
    
    res.status(200).json(site);
  } catch (error) {
    console.error(`Error fetching historical site with ID ${id}:`, error);
    res.status(500).json({ error: 'Failed to fetch historical site' });
  }
}