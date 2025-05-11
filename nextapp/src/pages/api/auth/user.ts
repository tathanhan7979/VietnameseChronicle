import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../../db';
import { users } from '../../../../shared/schema';
import { eq } from 'drizzle-orm';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Kiểm tra nếu người dùng đã xác thực (dựa vào session từ API hiện tại)
  // Note: Cần phải cấu hình session và passport trong Next.js
  if (!req.session?.passport?.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = req.session.passport.user;

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Loại bỏ trường password từ phản hồi
    const { password, ...userWithoutPassword } = user;
    
    res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
}