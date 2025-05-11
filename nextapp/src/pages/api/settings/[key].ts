import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@db';
import { settings } from '@shared/schema';
import { eq } from 'drizzle-orm';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { key } = req.query;
  
  if (!key || typeof key !== 'string') {
    return res.status(400).json({ error: 'Setting key is required' });
  }

  try {
    const setting = await db.query.settings.findFirst({
      where: eq(settings.key, key),
    });
    
    if (!setting) {
      return res.status(404).json({ error: 'Setting not found' });
    }
    
    res.status(200).json(setting);
  } catch (error) {
    console.error(`Error fetching setting with key ${key}:`, error);
    res.status(500).json({ error: 'Failed to fetch setting' });
  }
}