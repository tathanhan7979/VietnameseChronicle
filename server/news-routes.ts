import { Express, Request, Response } from "express";
import { requireAuth, requireAdmin } from "./middlewares";
import { newsController } from "./news-methods";
import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// Cấu hình storage cho upload hình ảnh tin tức
const newsImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), "uploads/news"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${uuidv4()}`;
    const fileExtension = path.extname(file.originalname);
    cb(null, `news-image-${uniqueSuffix}${fileExtension}`);
  },
});

// Tạo middleware upload với các cài đặt từ storage
const uploadNewsImage = multer({
  storage: newsImageStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Giới hạn kích thước file 5MB
  },
  fileFilter: (req, file, cb) => {
    // Kiểm tra loại file
    const allowedFileTypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = allowedFileTypes.test(file.mimetype);
    const extname = allowedFileTypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(
      new Error(
        "Lỗi: Chỉ chấp nhận file hình ảnh (jpeg, jpg, png, gif, webp)!"
      )
    );
  },
});

export function registerNewsRoutes(app: Express) {
  const apiPrefix = "/api";

  // Lấy danh sách tin tức (public)
  app.get(`${apiPrefix}/news`, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const publishedOnly = req.query.publishedOnly === "true";
      const periodId = req.query.periodId ? parseInt(req.query.periodId as string) : undefined;
      const eventId = req.query.eventId ? parseInt(req.query.eventId as string) : undefined;
      const historicalFigureId = req.query.historicalFigureId 
        ? parseInt(req.query.historicalFigureId as string) 
        : undefined;
      const historicalSiteId = req.query.historicalSiteId
        ? parseInt(req.query.historicalSiteId as string)
        : undefined;
      const eventTypeId = req.query.eventTypeId
        ? parseInt(req.query.eventTypeId as string)
        : undefined;

      const result = await newsController.getNewsList({
        limit,
        page,
        publishedOnly,
        periodId,
        eventId,
        historicalFigureId,
        historicalSiteId,
        eventTypeId,
      });

      return res.json(result);
    } catch (error) {
      console.error("Error fetching news:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi lấy danh sách tin tức.",
      });
    }
  });

  // Lấy tin tức theo slug (public)
  app.get(`${apiPrefix}/news/:slug`, async (req, res) => {
    try {
      const { slug } = req.params;

      const news = await newsController.getNewsBySlug(slug);
      if (!news) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy tin tức.",
        });
      }

      // Tăng số lượt xem
      await newsController.incrementNewsViewCount(news.id);

      return res.json({
        success: true,
        data: news,
      });
    } catch (error) {
      console.error("Error fetching news by slug:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi lấy thông tin tin tức.",
      });
    }
  });

  // Lấy danh sách tin tức liên quan
  app.get(`${apiPrefix}/news/:id/related`, async (req, res) => {
    try {
      const { id } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 4;

      const relatedNews = await newsController.getRelatedNews(parseInt(id), limit);

      return res.json({
        success: true,
        data: relatedNews,
      });
    } catch (error) {
      console.error("Error fetching related news:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi lấy tin tức liên quan.",
      });
    }
  });

  // API Admin - Lấy danh sách tất cả tin tức
  app.get(
    `${apiPrefix}/admin/news`,
    requireAuth,
    requireAdmin,
    async (req, res) => {
      try {
        const allNews = await newsController.getAllNews();
        return res.json(allNews);
      } catch (error) {
        console.error("Error fetching all news:", error);
        return res.status(500).json({
          success: false,
          message: "Lỗi khi lấy danh sách tin tức.",
        });
      }
    }
  );

  // API Admin - Lấy chi tiết tin tức theo ID
  app.get(
    `${apiPrefix}/admin/news/:id`,
    requireAuth,
    requireAdmin,
    async (req, res) => {
      try {
        const { id } = req.params;
        const news = await newsController.getNewsById(parseInt(id));

        if (!news) {
          return res.status(404).json({
            success: false,
            message: "Không tìm thấy tin tức.",
          });
        }

        return res.json(news);
      } catch (error) {
        console.error("Error fetching news by id:", error);
        return res.status(500).json({
          success: false,
          message: "Lỗi khi lấy thông tin tin tức.",
        });
      }
    }
  );

  // API Admin - Thêm tin tức mới
  app.post(
    `${apiPrefix}/admin/news`,
    requireAuth,
    requireAdmin,
    uploadNewsImage.single("image"),
    async (req, res) => {
      try {
        const newsData = {
          title: req.body.title,
          content: req.body.content,
          summary: req.body.summary,
          imageUrl: req.file ? `/${req.file.path.replace(/\\/g, "/").split("/").slice(1).join("/")}` : req.body.imageUrl,
          published: req.body.published === "true" || req.body.published === true,
          periodId: req.body.periodId ? parseInt(req.body.periodId) : undefined,
          eventId: req.body.eventId ? parseInt(req.body.eventId) : undefined,
          historicalFigureId: req.body.historicalFigureId ? parseInt(req.body.historicalFigureId) : undefined,
          historicalSiteId: req.body.historicalSiteId ? parseInt(req.body.historicalSiteId) : undefined,
          eventTypeId: req.body.eventTypeId ? parseInt(req.body.eventTypeId) : undefined,
        };

        const news = await newsController.createNews(newsData);

        // Cập nhật sitemap nếu tính năng tự động cập nhật được bật
        try {
          const { updateSitemapIfEnabled } = await import('./sitemap-helper');
          await updateSitemapIfEnabled();
        } catch (sitemapError) {
          console.error("Error updating sitemap after creating news:", sitemapError);
        }

        return res.status(201).json({
          success: true,
          message: "Thêm tin tức thành công.",
          data: news,
        });
      } catch (error) {
        console.error("Error creating news:", error);
        return res.status(500).json({
          success: false,
          message: "Lỗi khi thêm tin tức mới.",
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  );

  // API Admin - Cập nhật tin tức
  app.put(
    `${apiPrefix}/admin/news/:id`,
    requireAuth,
    requireAdmin,
    uploadNewsImage.single("image"),
    async (req, res) => {
      try {
        const { id } = req.params;
        
        const newsData = {
          title: req.body.title,
          content: req.body.content,
          summary: req.body.summary,
          imageUrl: req.file ? `/${req.file.path.replace(/\\/g, "/").split("/").slice(1).join("/")}` : req.body.imageUrl,
          published: req.body.published === "true" || req.body.published === true,
          periodId: req.body.periodId ? parseInt(req.body.periodId) : null,
          eventId: req.body.eventId ? parseInt(req.body.eventId) : null,
          historicalFigureId: req.body.historicalFigureId ? parseInt(req.body.historicalFigureId) : null,
          historicalSiteId: req.body.historicalSiteId ? parseInt(req.body.historicalSiteId) : null,
          eventTypeId: req.body.eventTypeId ? parseInt(req.body.eventTypeId) : null,
        };

        const updatedNews = await newsController.updateNews(parseInt(id), newsData);

        if (!updatedNews) {
          return res.status(404).json({
            success: false,
            message: "Không tìm thấy tin tức cần cập nhật.",
          });
        }

        // Cập nhật sitemap nếu tính năng tự động cập nhật được bật
        try {
          const { updateSitemapIfEnabled } = await import('./sitemap-helper');
          await updateSitemapIfEnabled();
        } catch (sitemapError) {
          console.error("Error updating sitemap after updating news:", sitemapError);
        }

        return res.json({
          success: true,
          message: "Cập nhật tin tức thành công.",
          data: updatedNews,
        });
      } catch (error) {
        console.error("Error updating news:", error);
        return res.status(500).json({
          success: false,
          message: "Lỗi khi cập nhật tin tức.",
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  );

  // API Admin - Xóa tin tức
  app.delete(
    `${apiPrefix}/admin/news/:id`,
    requireAuth,
    requireAdmin,
    async (req, res) => {
      try {
        const { id } = req.params;

        // Kiểm tra tin tức có tồn tại không
        const existingNews = await newsController.getNewsById(parseInt(id));
        if (!existingNews) {
          return res.status(404).json({
            success: false,
            message: "Không tìm thấy tin tức.",
          });
        }

        await newsController.deleteNews(parseInt(id));

        // Cập nhật sitemap nếu tính năng tự động cập nhật được bật
        try {
          const { updateSitemapIfEnabled } = await import('./sitemap-helper');
          await updateSitemapIfEnabled();
        } catch (sitemapError) {
          console.error("Error updating sitemap after deleting news:", sitemapError);
        }

        return res.status(200).json({
          success: true,
          message: "Xóa tin tức thành công.",
        });
      } catch (error) {
        console.error("Error deleting news:", error);
        return res.status(500).json({
          success: false,
          message: "Lỗi khi xóa tin tức.",
        });
      }
    }
  );

  // API upload hình ảnh tin tức
  app.post(
    `${apiPrefix}/upload/news-image`,
    requireAuth,
    requireAdmin,
    uploadNewsImage.single("file"),
    (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({
            success: false,
            message: "Không có tập tin được tải lên",
          });
        }

        const filePath = req.file.path.replace(/\\/g, "/");
        const urlPath = "/" + filePath.split("/").slice(1).join("/");

        res.json({
          success: true,
          url: urlPath,
          message: "Tải lên hình ảnh thành công",
        });
      } catch (error) {
        console.error("Error uploading news image:", error);
        res.status(500).json({
          success: false,
          message: "Lỗi khi tải lên hình ảnh",
        });
      }
    }
  );
}