import { Express, Request, Response, NextFunction } from "express";
import { requireAuth, requireNewsPermission } from "./middlewares";
import { newsController } from "./news-methods";
import { stringify } from "querystring";
import { updateSitemapIfEnabled } from "./sitemap-helper";
import multer from "multer";
import path from "path";
import fs from "fs";

// Cấu hình multer lưu trữ uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), "uploads");
    // Tạo thư mục uploads nếu chưa tồn tại
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Tạo tên file duy nhất với timestamp
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `news-${uniqueSuffix}${ext}`);
  },
});

// Lọc file chỉ cho phép hình ảnh
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Chỉ chấp nhận file hình ảnh"));
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Giới hạn 5MB
  },
  fileFilter,
});

export function registerNewsRoutes(app: Express) {
  // ===== API ROUTES CHO ADMIN =====

  // Lấy danh sách tin tức có phân trang (cho admin)
  app.get("/api/admin/news", requireAuth, requireNewsPermission, async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = (req.query.status as string) || "all";
      const searchQuery = (req.query.search as string) || "";

      const result = await newsController.getNewsPaginated(page, limit, status, searchQuery);
      res.json(result);
    } catch (error) {
      console.error("Error getting news list:", error);
      res.status(500).json({ error: "Không thể lấy danh sách tin tức" });
    }
  });

  // Lấy tin tức theo ID (cho admin)
  app.get("/api/admin/news/:id", requireAuth, requireNewsPermission, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID không hợp lệ" });
      }

      const news = await newsController.getNewsById(id);
      if (!news) {
        return res.status(404).json({ error: "Không tìm thấy tin tức" });
      }

      res.json(news);
    } catch (error) {
      console.error(`Error getting news ${req.params.id}:`, error);
      res.status(500).json({ error: "Không thể lấy chi tiết tin tức" });
    }
  });

  // Tạo tin tức mới
  app.post("/api/admin/news", requireAuth, requireNewsPermission, async (req: Request, res: Response) => {
    try {
      const data = req.body;
      
      // Validate dữ liệu
      if (!data.title) {
        return res.status(400).json({ error: "Tiêu đề không được để trống" });
      }
      
      if (!data.content) {
        return res.status(400).json({ error: "Nội dung không được để trống" });
      }
      
      // Tạo tin tức mới
      const newNews = await newsController.createNews(data);
      
      // Cập nhật sitemap
      updateSitemapIfEnabled();
      
      res.status(201).json(newNews);
    } catch (error) {
      console.error("Error creating news:", error);
      res.status(500).json({ error: "Không thể tạo tin tức mới" });
    }
  });

  // Cập nhật tin tức
  app.put("/api/admin/news/:id", requireAuth, requireNewsPermission, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID không hợp lệ" });
      }

      const data = req.body;
      
      // Validate dữ liệu
      if (!data.title) {
        return res.status(400).json({ error: "Tiêu đề không được để trống" });
      }
      
      if (!data.content) {
        return res.status(400).json({ error: "Nội dung không được để trống" });
      }
      
      // Kiểm tra tin tức tồn tại
      const existingNews = await newsController.getNewsById(id);
      if (!existingNews) {
        return res.status(404).json({ error: "Không tìm thấy tin tức" });
      }
      
      // Cập nhật tin tức
      const updatedNews = await newsController.updateNews(id, data);
      
      // Cập nhật sitemap
      updateSitemapIfEnabled();
      
      res.json(updatedNews);
    } catch (error) {
      console.error(`Error updating news ${req.params.id}:`, error);
      res.status(500).json({ error: "Không thể cập nhật tin tức" });
    }
  });

  // Xóa tin tức
  app.delete("/api/admin/news/:id", requireAuth, requireNewsPermission, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID không hợp lệ" });
      }

      // Kiểm tra tin tức tồn tại
      const existingNews = await newsController.getNewsById(id);
      if (!existingNews) {
        return res.status(404).json({ error: "Không tìm thấy tin tức" });
      }
      
      // Xóa tin tức
      const deletedNews = await newsController.deleteNews(id);
      
      // Cập nhật sitemap
      updateSitemapIfEnabled();
      
      res.json(deletedNews);
    } catch (error) {
      console.error(`Error deleting news ${req.params.id}:`, error);
      res.status(500).json({ error: "Không thể xóa tin tức" });
    }
  });

  // Upload hình ảnh cho tin tức
  app.post("/api/admin/news/upload", requireAuth, requireNewsPermission, upload.single("image"), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Không có file được upload" });
      }
      
      // Trả về URL của file đã upload
      const fileUrl = `/uploads/${req.file.filename}`;
      res.json({ url: fileUrl });
    } catch (error) {
      console.error("Error uploading image:", error);
      res.status(500).json({ error: "Không thể upload hình ảnh" });
    }
  });

  // ===== API ROUTES CHO FRONTEND =====

  // Lấy tin tức nổi bật
  app.get("/api/news/featured", async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const featuredNews = await newsController.getFeaturedNews(limit);
      res.json(featuredNews);
    } catch (error) {
      console.error("Error getting featured news:", error);
      res.status(500).json({ error: "Không thể lấy tin tức nổi bật" });
    }
  });

  // Lấy tin tức mới nhất
  app.get("/api/news/latest", async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const latestNews = await newsController.getLatestNews(limit);
      res.json(latestNews);
    } catch (error) {
      console.error("Error getting latest news:", error);
      res.status(500).json({ error: "Không thể lấy tin tức mới nhất" });
    }
  });

  // Lấy tin tức phổ biến
  app.get("/api/news/popular", async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const popularNews = await newsController.getPopularNews(limit);
      res.json(popularNews);
    } catch (error) {
      console.error("Error getting popular news:", error);
      res.status(500).json({ error: "Không thể lấy tin tức phổ biến" });
    }
  });

  // Lấy danh sách tin tức có phân trang (cho frontend)
  app.get("/api/news", async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const searchQuery = (req.query.search as string) || "";

      // Chỉ lấy tin tức đã xuất bản cho frontend
      const result = await newsController.getNewsPaginated(page, limit, "published", searchQuery);
      res.json(result);
    } catch (error) {
      console.error("Error getting public news list:", error);
      res.status(500).json({ error: "Không thể lấy danh sách tin tức" });
    }
  });

  // Lấy chi tiết tin tức theo ID
  app.get("/api/news/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        // Nếu không phải số, thử lấy theo slug
        const news = await newsController.getNewsBySlug(req.params.id);
        
        if (!news) {
          return res.status(404).json({ error: "Không tìm thấy tin tức" });
        }
        
        if (!news.published) {
          return res.status(404).json({ error: "Tin tức chưa được xuất bản" });
        }
        
        return res.json(news);
      }
      
      const news = await newsController.getNewsById(id);
      
      if (!news) {
        return res.status(404).json({ error: "Không tìm thấy tin tức" });
      }
      
      if (!news.published) {
        return res.status(404).json({ error: "Tin tức chưa được xuất bản" });
      }
      
      // Tăng lượt xem
      await newsController.incrementViewCount(news.id);
      
      // Lấy tin tức liên quan
      const relatedNews = await newsController.getRelatedNews(news.id, 5);
      
      res.json({
        news,
        relatedNews
      });
    } catch (error) {
      console.error(`Error getting news with slug ${req.params.slug}:`, error);
      res.status(500).json({ error: "Không thể lấy chi tiết tin tức" });
    }
  });

  // Lấy tin tức theo thời kỳ
  app.get("/api/news/period/:periodId", async (req: Request, res: Response) => {
    try {
      const periodId = parseInt(req.params.periodId);
      if (isNaN(periodId)) {
        return res.status(400).json({ error: "ID thời kỳ không hợp lệ" });
      }
      
      const limit = parseInt(req.query.limit as string) || 10;
      const news = await newsController.getNewsByPeriod(periodId, limit);
      res.json(news);
    } catch (error) {
      console.error(`Error getting news for period ${req.params.periodId}:`, error);
      res.status(500).json({ error: "Không thể lấy tin tức theo thời kỳ" });
    }
  });

  // Lấy tin tức theo sự kiện
  app.get("/api/news/event/:eventId", async (req: Request, res: Response) => {
    try {
      const eventId = parseInt(req.params.eventId);
      if (isNaN(eventId)) {
        return res.status(400).json({ error: "ID sự kiện không hợp lệ" });
      }
      
      const limit = parseInt(req.query.limit as string) || 10;
      const news = await newsController.getNewsByEvent(eventId, limit);
      res.json(news);
    } catch (error) {
      console.error(`Error getting news for event ${req.params.eventId}:`, error);
      res.status(500).json({ error: "Không thể lấy tin tức theo sự kiện" });
    }
  });

  // Lấy tin tức theo nhân vật
  app.get("/api/news/figure/:figureId", async (req: Request, res: Response) => {
    try {
      const figureId = parseInt(req.params.figureId);
      if (isNaN(figureId)) {
        return res.status(400).json({ error: "ID nhân vật không hợp lệ" });
      }
      
      const limit = parseInt(req.query.limit as string) || 10;
      const news = await newsController.getNewsByFigure(figureId, limit);
      res.json(news);
    } catch (error) {
      console.error(`Error getting news for figure ${req.params.figureId}:`, error);
      res.status(500).json({ error: "Không thể lấy tin tức theo nhân vật" });
    }
  });

  // Lấy tin tức theo di tích
  app.get("/api/news/site/:siteId", async (req: Request, res: Response) => {
    try {
      const siteId = parseInt(req.params.siteId);
      if (isNaN(siteId)) {
        return res.status(400).json({ error: "ID di tích không hợp lệ" });
      }
      
      const limit = parseInt(req.query.limit as string) || 10;
      const news = await newsController.getNewsBySite(siteId, limit);
      res.json(news);
    } catch (error) {
      console.error(`Error getting news for site ${req.params.siteId}:`, error);
      res.status(500).json({ error: "Không thể lấy tin tức theo di tích" });
    }
  });
}