import { NextApiRequest, NextApiResponse } from 'next';
import { User } from '../../../shared/schema';

// Mở rộng NextApiRequest để có thể sử dụng req.session
declare module 'next' {
  interface NextApiRequest {
    session?: {
      passport?: {
        user?: number;
      };
    };
    user?: User;
    login?: (user: User, callback: (err: any) => void) => void;
    logout?: (callback: (err: any) => void) => void;
    isAuthenticated?: () => boolean;
  }
}

/**
 * Middleware để kiểm tra xác thực người dùng
 */
export function withAuth(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    return handler(req, res);
  };
}

/**
 * Hàm này sẽ được sử dụng để lấy thông tin người dùng hiện tại từ session
 */
export async function getCurrentUser(req: NextApiRequest): Promise<User | null> {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return null;
  }
  
  return req.user || null;
}