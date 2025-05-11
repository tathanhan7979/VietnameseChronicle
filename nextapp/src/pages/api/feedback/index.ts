import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@db';
import { feedback, insertFeedbackSchema } from '@shared/schema';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Xử lý POST - Gửi phản hồi mới
  if (req.method === 'POST') {
    try {
      const validatedData = insertFeedbackSchema.parse(req.body);
      
      // Loại bỏ createdAt từ validatedData vì nó được tự động thêm bởi schema
      const { name, email, phone, content } = validatedData;
      
      const [newFeedback] = await db.insert(feedback)
        .values({
          name,
          email,
          phone,
          content,
          status: 'pending',
        })
        .returning();
        
      return res.status(201).json(newFeedback);
    } catch (error) {
      console.error('Error creating feedback:', error);
      return res.status(500).json({ error: 'Failed to create feedback' });
    }
  }
  
  // Xử lý GET - Lấy danh sách phản hồi (cho admin)
  if (req.method === 'GET') {
    // Kiểm tra xác thực (chỉ admin mới có thể xem phản hồi)
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    try {
      const feedbackList = await db.query.feedback.findMany({
        orderBy: (feedback, { desc }) => [desc(feedback.createdAt)],
      });
      
      return res.status(200).json(feedbackList);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      return res.status(500).json({ error: 'Failed to fetch feedback' });
    }
  }
  
  // Phương thức không được hỗ trợ
  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}