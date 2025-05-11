import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@db';
import { historicalFigures } from '@shared/schema';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { limit, periodId } = req.query;
  
  try {
    let query = db.query.historicalFigures;
    let queryOptions: any = {
      orderBy: (historicalFigures, { asc }) => [asc(historicalFigures.id)],
      with: {
        period: true,
      },
    };
    
    // Thêm điều kiện lọc theo periodId nếu được chỉ định
    if (periodId && !isNaN(Number(periodId))) {
      queryOptions.where = (historicalFigures, { eq }) => eq(historicalFigures.periodId, Number(periodId));
    }
    
    // Giới hạn số lượng kết quả nếu được chỉ định
    if (limit && !isNaN(Number(limit))) {
      queryOptions.limit = Number(limit);
    }
    
    const figuresList = await query.findMany(queryOptions);
    
    res.status(200).json(figuresList);
  } catch (error) {
    console.error('Error fetching historical figures:', error);
    res.status(500).json({ error: 'Failed to fetch historical figures' });
  }
}