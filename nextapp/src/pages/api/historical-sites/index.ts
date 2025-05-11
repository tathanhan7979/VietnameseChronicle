import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@db';
import { historicalSites } from '@shared/schema';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { limit, periodId } = req.query;
  
  try {
    let query = db.query.historicalSites;
    let queryOptions: any = {
      orderBy: (historicalSites, { asc }) => [asc(historicalSites.id)],
      with: {
        period: true,
      },
    };
    
    // Thêm điều kiện lọc theo periodId nếu được chỉ định
    if (periodId && !isNaN(Number(periodId))) {
      queryOptions.where = (historicalSites, { eq }) => eq(historicalSites.periodId, Number(periodId));
    }
    
    // Giới hạn số lượng kết quả nếu được chỉ định
    if (limit && !isNaN(Number(limit))) {
      queryOptions.limit = Number(limit);
    }
    
    const sitesList = await query.findMany(queryOptions);
    
    res.status(200).json(sitesList);
  } catch (error) {
    console.error('Error fetching historical sites:', error);
    res.status(500).json({ error: 'Failed to fetch historical sites' });
  }
}