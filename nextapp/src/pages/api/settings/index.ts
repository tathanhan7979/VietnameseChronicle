import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../../db';
import { settings } from '../../../../shared/schema';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const settingsList = await db.query.settings.findMany();
    
    res.status(200).json(settingsList);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
}