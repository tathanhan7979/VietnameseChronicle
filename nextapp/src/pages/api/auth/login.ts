import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../../db';
import { users } from '../../../../shared/schema';
import { eq } from 'drizzle-orm';
import { comparePasswords } from '../../../../server/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.username, username),
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const passwordMatch = await comparePasswords(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Nếu sử dụng Passport.js với Next.js, cần phải thiết lập đúng cách
    if (req.login) {
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ error: 'Authentication failed' });
        }
        
        // Loại bỏ trường password từ phản hồi
        const { password, ...userWithoutPassword } = user;
        return res.status(200).json(userWithoutPassword);
      });
    } else {
      // Fallback nếu không có req.login (khi chưa thiết lập Passport.js hoàn chỉnh)
      // Trong trường hợp này, chúng ta chỉ trả về thông tin người dùng
      // Lưu ý: Phương pháp này không an toàn và chỉ là tạm thời
      const { password, ...userWithoutPassword } = user;
      return res.status(200).json(userWithoutPassword);
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}