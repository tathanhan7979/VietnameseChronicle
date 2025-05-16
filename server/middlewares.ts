import { Request, Response, NextFunction } from "express";
import { User } from "@shared/schema";
import { getUserFromToken } from "./auth";

// Lấy user từ request để sử dụng trong middleware kiểm tra quyền
export const getUserFromRequest = (req: Request): User | null => {
  if (req.isAuthenticated?.()) {
    return req.user as User;
  } else {
    return (req as any).user as User;
  }
};

// Middleware kiểm tra xác thực (hỗ trợ cả JWT token và session cookie)
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Kiểm tra nếu user đã được xác thực thông qua session (express-session)
    if (req.isAuthenticated?.()) {
      return next();
    }

    // Nếu không có session, thử kiểm tra JWT token
    const authToken = req.headers.authorization?.split(" ")[1];

    if (!authToken) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await getUserFromToken(authToken);

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Lưu thông tin user vào req để sử dụng ở các route handler
    (req as any).user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ error: "Unauthorized" });
  }
};

// Middleware kiểm tra quyền admin
export const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = getUserFromRequest(req);

    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: "Forbidden - Admin only" });
    }

    next();
  } catch (error) {
    console.error("Authorization error:", error);
    res.status(403).json({ error: "Forbidden" });
  }
};

// Middleware kiểm tra quyền quản lý thời kỳ lịch sử
export const requirePeriodsPermission = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = getUserFromRequest(req);

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (user.isAdmin || user.can_manage_periods) {
      return next();
    }

    return res.status(403).json({ 
      error: "Forbidden", 
      message: "Bạn không có quyền quản lý thời kỳ lịch sử" 
    });
  } catch (error) {
    console.error("Authorization error:", error);
    res.status(403).json({ error: "Forbidden" });
  }
};

// Middleware kiểm tra quyền quản lý sự kiện lịch sử
export const requireEventsPermission = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = getUserFromRequest(req);

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (user.isAdmin || user.can_manage_events) {
      return next();
    }

    return res.status(403).json({ 
      error: "Forbidden", 
      message: "Bạn không có quyền quản lý sự kiện lịch sử" 
    });
  } catch (error) {
    console.error("Authorization error:", error);
    res.status(403).json({ error: "Forbidden" });
  }
};

// Middleware kiểm tra quyền quản lý nhân vật lịch sử
export const requireFiguresPermission = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = getUserFromRequest(req);

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (user.isAdmin || user.can_manage_figures) {
      return next();
    }

    return res.status(403).json({ 
      error: "Forbidden", 
      message: "Bạn không có quyền quản lý nhân vật lịch sử" 
    });
  } catch (error) {
    console.error("Authorization error:", error);
    res.status(403).json({ error: "Forbidden" });
  }
};

// Middleware kiểm tra quyền quản lý di tích lịch sử
export const requireSitesPermission = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = getUserFromRequest(req);

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (user.isAdmin || user.can_manage_sites) {
      return next();
    }

    return res.status(403).json({ 
      error: "Forbidden", 
      message: "Bạn không có quyền quản lý di tích lịch sử" 
    });
  } catch (error) {
    console.error("Authorization error:", error);
    res.status(403).json({ error: "Forbidden" });
  }
};

// Middleware kiểm tra quyền quản lý tin tức
export const requireNewsPermission = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = getUserFromRequest(req);

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (user.isAdmin || user.can_manage_news) {
      return next();
    }

    return res.status(403).json({ 
      error: "Forbidden", 
      message: "Bạn không có quyền quản lý tin tức" 
    });
  } catch (error) {
    console.error("Authorization error:", error);
    res.status(403).json({ error: "Forbidden" });
  }
};