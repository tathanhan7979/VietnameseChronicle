import express, {
  type Express,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  createInitialAdminUser,
  loginUser,
  registerUser,
  getUserFromToken,
  generateToken,
} from "./auth";
import { type User, periods, events, historicalSites } from "@shared/schema";
import { eq } from "drizzle-orm";
import { db } from "@db";
import multer from "multer";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";

// Thêm các định nghĩa type cho express-session
declare module "express-session" {
  interface SessionData {
    passport: { user: number };
  }
}

declare module "express" {
  interface Request {
    user?: User;
    isAuthenticated(): boolean;
    login(user: User, callback: (err: any) => void): void;
    logout(callback: (err: any) => void): void;
  }
}

// Middleware kiểm tra xác thực (hỗ trợ cả JWT token và session cookie)
const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
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
const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    let user: User | null = null;

    // Trường hợp sử dụng session
    if (req.isAuthenticated?.()) {
      user = req.user as User;
    } else {
      // Trường hợp sử dụng JWT token
      user = (req as any).user as User;
    }

    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: "Forbidden" });
    }

    next();
  } catch (error) {
    console.error("Authorization error:", error);
    res.status(403).json({ error: "Forbidden" });
  }
};

// Middleware kiểm tra quyền quản lý thời kỳ
const requirePeriodsPermission = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    let user: User | null = null;

    // Trường hợp sử dụng session
    if (req.isAuthenticated?.()) {
      user = req.user as User;
    } else {
      // Trường hợp sử dụng JWT token
      user = (req as any).user as User;
    }

    if (!user || (!user.isAdmin && !user.canManagePeriods)) {
      return res.status(403).json({ error: "Bạn không có quyền quản lý thời kỳ lịch sử" });
    }

    next();
  } catch (error) {
    console.error("Authorization error:", error);
    res.status(403).json({ error: "Forbidden" });
  }
};

// Middleware kiểm tra quyền quản lý sự kiện
const requireEventsPermission = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    let user: User | null = null;

    // Trường hợp sử dụng session
    if (req.isAuthenticated?.()) {
      user = req.user as User;
    } else {
      // Trường hợp sử dụng JWT token
      user = (req as any).user as User;
    }

    if (!user || (!user.isAdmin && !user.canManageEvents)) {
      return res.status(403).json({ error: "Bạn không có quyền quản lý sự kiện lịch sử" });
    }

    next();
  } catch (error) {
    console.error("Authorization error:", error);
    res.status(403).json({ error: "Forbidden" });
  }
};

// Middleware kiểm tra quyền quản lý nhân vật
const requireFiguresPermission = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    let user: User | null = null;

    // Trường hợp sử dụng session
    if (req.isAuthenticated?.()) {
      user = req.user as User;
    } else {
      // Trường hợp sử dụng JWT token
      user = (req as any).user as User;
    }

    if (!user || (!user.isAdmin && !user.canManageFigures)) {
      return res.status(403).json({ error: "Bạn không có quyền quản lý nhân vật lịch sử" });
    }

    next();
  } catch (error) {
    console.error("Authorization error:", error);
    res.status(403).json({ error: "Forbidden" });
  }
};

// Middleware kiểm tra quyền quản lý di tích
const requireSitesPermission = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    let user: User | null = null;

    // Trường hợp sử dụng session
    if (req.isAuthenticated?.()) {
      user = req.user as User;
    } else {
      // Trường hợp sử dụng JWT token
      user = (req as any).user as User;
    }

    if (!user || (!user.isAdmin && !user.canManageSites)) {
      return res.status(403).json({ error: "Bạn không có quyền quản lý địa danh lịch sử" });
    }

    next();
  } catch (error) {
    console.error("Authorization error:", error);
    res.status(403).json({ error: "Forbidden" });
  }
};

// Hàm xóa tập tin - chức năng chung
function deleteFile(filePath: string): boolean {
  try {
    if (!filePath) return false;
    if (filePath.startsWith("http")) return false; // Skip external URLs

    // Chuyển đổi đường dẫn URL thành đường dẫn hệ thống tập tin
    const systemPath = path.join(process.cwd(), filePath.replace(/^\//, ""));

    if (fs.existsSync(systemPath)) {
      fs.unlinkSync(systemPath);
      console.log(`Đã xóa tập tin thành công: ${systemPath}`);
      return true;
    } else {
      console.warn(`Tập tin không tồn tại: ${systemPath}`);
      return false;
    }
  } catch (error) {
    console.error(`Lỗi khi xóa tập tin ${filePath}:`, error);
    return false;
  }
}

// Cấu hình multer để lưu trữ tập tin
const uploadsDir = path.join(process.cwd(), "uploads");
const faviconStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(uploadsDir, "favicons");
    // Đảm bảo thư mục tồn tại
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    // Tạo tên file ngẫu nhiên với đuôi ban đầu
    const uniquePrefix = randomUUID();
    const ext = path.extname(file.originalname);
    cb(null, uniquePrefix + ext);
  },
});

const uploadFavicon = multer({
  storage: faviconStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // giới hạn 5MB
  },
  fileFilter: function (req, file, cb) {
    // Chỉ chấp nhận các định dạng hình ảnh phổ biến
    const filetypes = /jpeg|jpg|png|gif|svg|ico/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase(),
    );

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(
      new Error(
        "Chỉ chấp nhận tập tin hình ảnh (jpeg, jpg, png, gif, svg, ico)",
      ),
    );
  },
});

// Tạo một endpoint đặc biệt để hỗ trợ crawler (như Facebook Debugger) nhận diện meta tags
async function generateSocialShareHTML(
  req: Request,
  res: Response,
  urlParam?: string,
) {
  const url = urlParam || (req.query.url as string);
  if (!url) {
    return res.status(400).send("URL parameter is required");
  }

  let title = "Lịch Sử Việt Nam";
  let description =
    "Khám phá hành trình lịch sử Việt Nam qua các thời kỳ từ thời Vua Hùng đến hiện đại với những sự kiện, nhân vật và di tích lịch sử nổi bật.";
  let image = "https://lichsuviet.edu.vn/uploads/banner-image.png";
  let type = "website";

  // Parse URL để lấy phần đường dẫn
  const urlObj = new URL(url);
  const pathname = urlObj.pathname;

  // Nếu là trang sự kiện
  if (pathname.startsWith("/su-kien/")) {
    const eventIdMatch = pathname.match(/\/su-kien\/(\d+)/);
    if (eventIdMatch) {
      const eventId = parseInt(eventIdMatch[1]);
      try {
        const event = await storage.getEventById(eventId);

        if (event) {
          const period = event.periodId
            ? await storage.getPeriodById(event.periodId)
            : null;
          const periodName = period?.name || "";
          const eventTypes = await storage.getEventTypesForEvent(eventId);
          const eventTypeText =
            eventTypes && eventTypes.length > 0
              ? `[${eventTypes.map((t) => t.name).join(", ")}]`
              : "";

          title =
            `${event.title} ${event.year ? `(${event.year})` : ""} ${eventTypeText}`.trim();
          description =
            event.description ||
            `Thông tin chi tiết về sự kiện lịch sử ${event.title} ${periodName ? `trong thời kỳ ${periodName}` : "Việt Nam"}`;
          image =
            event.imageUrl ||
            "https://lichsuviet.edu.vn/uploads/banner-image.png";
          type = "article";
        }
      } catch (error) {
        console.error("Error fetching event for SEO:", error);
      }
    }
  }
  // Nếu là trang nhân vật lịch sử
  else if (pathname.startsWith("/nhan-vat/")) {
    const figureIdMatch = pathname.match(/\/nhan-vat\/(\d+)/);
    if (figureIdMatch) {
      const figureId = parseInt(figureIdMatch[1]);
      try {
        const figure = await storage.getHistoricalFigureById(figureId);
        if (figure) {
          const period = figure.periodId
            ? await storage.getPeriodById(figure.periodId)
            : null;
          const periodName = period?.name || "";

          title = `${figure.name} - Nhân vật lịch sử ${periodName ? `thời kỳ ${periodName}` : ""}`;
          description =
            figure.description ||
            `Thông tin chi tiết về nhân vật lịch sử ${figure.name} ${figure.lifespan ? `(${figure.lifespan})` : ""} ${periodName ? `trong thời kỳ ${periodName}` : ""}`;
          image =
            figure.imageUrl ||
            "https://lichsuviet.edu.vn/uploads/banner-image.png";
          type = "article";
        }
      } catch (error) {
        console.error("Error fetching historical figure for SEO:", error);
      }
    }
  }
  // Nếu là trang di tích lịch sử
  else if (pathname.startsWith("/di-tich/")) {
    const siteIdMatch = pathname.match(/\/di-tich\/(\d+)/);
    if (siteIdMatch) {
      const siteId = parseInt(siteIdMatch[1]);
      try {
        const site = await storage.getHistoricalSiteById(siteId);

        if (site) {
          const period = site.periodId
            ? await storage.getPeriodById(site.periodId)
            : null;
          const periodName = period?.name || "";

          title = `${site.name} - Di tích lịch sử ${periodName ? `thời kỳ ${periodName}` : "Việt Nam"}`;
          description =
            site.description ||
            `Thông tin chi tiết về di tích lịch sử ${site.name} ${site.location ? `tại ${site.location}` : ""} ${periodName ? `thuộc thời kỳ ${periodName}` : ""}`;
          image =
            site.imageUrl ||
            "https://lichsuviet.edu.vn/uploads/banner-image.png";
          type = "article";
        }
      } catch (error) {
        console.error("Error fetching historical site for SEO:", error);
      }
    }
  }
  // Nếu là trang thời kỳ lịch sử
  else if (pathname.startsWith("/thoi-ky/")) {
    const periodSlugMatch = pathname.match(/\/thoi-ky\/([\w-]+)/);
    if (periodSlugMatch) {
      const periodSlug = periodSlugMatch[1];
      try {
        const period = await storage.getPeriodBySlug(periodSlug);

        if (period) {
          const events = await storage.getEventsByPeriod(period.id);
          const figures = await storage.getHistoricalFiguresByPeriod(period.id);
          const sites = await storage.getHistoricalSitesByPeriod(period.id);

          title = `${period.name} - Thời kỳ lịch sử Việt Nam ${period.timeframe || ""}`;
          description =
            period.description ||
            `Khám phá thời kỳ ${period.name} ${period.timeframe ? `(${period.timeframe})` : ""} với ${events.length} sự kiện, ${figures.length} nhân vật và ${sites.length} di tích lịch sử nổi bật.`;
          type = "article";
        }
      } catch (error) {
        console.error("Error fetching period for SEO:", error);
      }
    }
  }

  // Tạo HTML với meta tags phù hợp
  const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1" />

  <!-- Primary Meta Tags -->
  <title>${title}</title>
  <meta name="title" content="${title}" />
  <meta name="description" content="${description}" />
  <meta name="keywords" content="lịch sử Việt Nam, thời kỳ lịch sử, Vua Hùng, nhân vật lịch sử, di tích lịch sử, văn hóa Việt Nam" />
  <meta name="author" content="lichsuviet.edu.vn" />
  <meta name="robots" content="index, follow" />
  <meta name="language" content="Vietnamese" />

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="${type}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${image}" />
  <meta property="og:site_name" content="Lịch Sử Việt Nam" />
  <meta property="og:locale" content="vi_VN" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />

  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:url" content="${url}" />
  <meta property="twitter:title" content="${title}" />
  <meta property="twitter:description" content="${description}" />
  <meta property="twitter:image" content="${image}" />

  <!-- Canonical URL -->
  <link rel="canonical" href="${url}" />
</head>
<body>
  <script>
    // Chuyển hướng người dùng đến trang web chính
    window.location.href = "${url}";
  </script>

  <h1>${title}</h1>
  <p>${description}</p>
  <p>Đang chuyển hướng đến trang chi tiết...</p>

  <a href="${url}">Nhấn vào đây nếu không được chuyển hướng tự động</a>
</body>
</html>`;

  res.setHeader("Content-Type", "text/html");
  res.send(html);
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Tạo tài khoản admin mặc định khi khởi động
  await createInitialAdminUser();
  // API prefix
  const apiPrefix = "/api";

  // Phục vụ thư mục uploads qua URL /uploads
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
  
  // Middleware để đếm lượt truy cập
  app.use(async (req, res, next) => {
    // Chỉ đếm cho các yêu cầu trang web, không đếm các yêu cầu API hoặc tài nguyên tĩnh
    if (!req.path.startsWith('/api') && 
        !req.path.startsWith('/uploads') && 
        !req.path.includes('.') && 
        req.method === 'GET') {
      try {
        await storage.incrementVisitCount();
      } catch (error) {
        console.error('Error incrementing visit count:', error);
      }
    }
    next();
  });

  // Sử dụng hàm deleteFile đã được định nghĩa ở trên

  // Get all periods
  app.get(`${apiPrefix}/periods`, async (req, res) => {
    try {
      // Nếu có query parameter ?visible=true thì chỉ lấy thời kỳ có isShow=true
      if (req.query.visible === "true") {
        const periods = await storage.getVisiblePeriods();
        return res.json(periods);
      }

      // Nếu không có parameter, lấy tất cả thời kỳ
      const periods = await storage.getAllPeriods();
      res.json(periods);
    } catch (error) {
      console.error("Error fetching periods:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get period by ID
  app.get(`${apiPrefix}/periods/:id`, async (req, res) => {
    try {
      const period = await storage.getPeriodById(parseInt(req.params.id));
      if (!period) {
        return res.status(404).json({ error: "Period not found" });
      }
      res.json(period);
    } catch (error) {
      console.error("Error fetching period:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get period by slug
  app.get(`${apiPrefix}/periods/slug/:slug`, async (req, res) => {
    try {
      const period = await storage.getPeriodBySlug(req.params.slug);
      if (!period) {
        return res.status(404).json({ error: "Period not found" });
      }
      res.json(period);
    } catch (error) {
      console.error("Error fetching period by slug:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // API endpoint cho quan hệ giữa sự kiện và loại sự kiện
  app.get(`${apiPrefix}/event-to-event-type`, async (req, res) => {
    try {
      const relationships = await storage.getAllEventToEventTypes();
      res.json(relationships);
    } catch (error) {
      console.error("Error fetching event to event type relationships:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get all events
  app.get(`${apiPrefix}/events`, async (req, res) => {
    try {
      const events = await storage.getAllEvents();
      res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get events by period (using slug) - đặt route này trước route có pattern /:id
  app.get(`${apiPrefix}/events/period-slug/:slug`, async (req, res) => {
    try {
      const events = await storage.getEventsByPeriodSlug(req.params.slug);
      res.json(events);
    } catch (error) {
      console.error("Error fetching events by period slug:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get events by period (using ID)
  app.get(`${apiPrefix}/events/period/:periodId`, async (req, res) => {
    try {
      const events = await storage.getEventsByPeriod(
        parseInt(req.params.periodId),
      );
      res.json(events);
    } catch (error) {
      console.error("Error fetching events by period ID:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get event by ID - đặt cuối cùng vì có pattern chung chung nhất
  app.get(`${apiPrefix}/events/:id([0-9]+)`, async (req, res) => {
    try {
      const event = await storage.getEventById(parseInt(req.params.id));
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      console.error("Error fetching event:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get all historical figures
  app.get(`${apiPrefix}/historical-figures`, async (req, res) => {
    try {
      const figures = await storage.getAllHistoricalFigures();
      res.json(figures);
    } catch (error) {
      console.error("Error fetching historical figures:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get historical figures by period ID
  app.get(
    `${apiPrefix}/historical-figures/period/:periodId`,
    async (req, res) => {
      try {
        const figures = await storage.getHistoricalFiguresByPeriod(
          parseInt(req.params.periodId),
        );
        res.json(figures);
      } catch (error) {
        console.error("Error fetching historical figures by period ID:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    },
  );

  // Get historical figures by period slug
  app.get(
    `${apiPrefix}/historical-figures/period-slug/:slug`,
    async (req, res) => {
      try {
        const figures = await storage.getHistoricalFiguresByPeriodSlug(
          req.params.slug,
        );
        res.json(figures);
      } catch (error) {
        console.error(
          "Error fetching historical figures by period slug:",
          error,
        );
        res.status(500).json({ error: "Internal server error" });
      }
    },
  );

  // Get historical figure by ID - dùng pattern để đảm bảo route này không bị các route trên che khuất
  app.get(`${apiPrefix}/historical-figures/:id([0-9]+)`, async (req, res) => {
    try {
      const figure = await storage.getHistoricalFigureById(
        parseInt(req.params.id),
      );
      if (!figure) {
        return res.status(404).json({ error: "Historical figure not found" });
      }
      res.json(figure);
    } catch (error) {
      console.error("Error fetching historical figure:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get all event types
  app.get(`${apiPrefix}/event-types`, async (req, res) => {
    try {
      const types = await storage.getAllEventTypes();
      res.json(types);
    } catch (error) {
      console.error("Error fetching event types:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get events by event type
  app.get(`${apiPrefix}/events/type/:typeSlug`, async (req, res) => {
    try {
      const events = await storage.getEventsByType(req.params.typeSlug);
      res.json(events);
    } catch (error) {
      console.error("Error fetching events by type:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Search API
  app.get(`${apiPrefix}/search`, async (req, res) => {
    try {
      const { term, period, eventType } = req.query;

      // Bỏ yêu cầu phải có ít nhất một trong các tham số
      // để cho phép tìm kiếm chỉ với bộ lọc hoặc không có điều kiện

      // Tăng số lượt tìm kiếm
      await storage.incrementSearchCount();

      const results = await storage.search(
        term ? String(term) : undefined,
        period ? String(period) : undefined,
        eventType ? String(eventType) : undefined,
      );

      res.json(results);
    } catch (error) {
      console.error("Error searching:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // API endpoint để nhận feedback
  app.post(`${apiPrefix}/feedback`, async (req, res) => {
    try {
      const { name, phone, email, content } = req.body;

      // Kiểm tra dữ liệu đầu vào
      if (!name || !phone || !email || !content) {
        return res.status(400).json({
          success: false,
          error: "Thiếu thông tin. Vui lòng điền đầy đủ các trường.",
        });
      }

      // Lưu feedback vào database
      const feedback = await storage.createFeedback({
        name,
        phone,
        email,
        content,
      });

      // Gửi thông báo Telegram
      try {
        const botToken = await storage.getSetting("telegram_bot_token");
        const chatId = await storage.getSetting("telegram_chat_id");

        if (botToken?.value && chatId?.value) {
          const message = `🔔 Góp ý mới!\n\nTừ: ${name}\nSĐT: ${phone}\nEmail: ${email}\n\nNội dung:\n${content}`;

          await fetch(
            `https://api.telegram.org/bot${botToken.value}/sendMessage`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                chat_id: chatId.value,
                text: message,
                parse_mode: "HTML",
              }),
            },
          );
        }
      } catch (error) {
        console.error("Lỗi gửi thông báo Telegram:", error);
      }

      res.status(201).json({
        success: true,
        message: "Góp ý của bạn đã được gửi thành công!",
        data: feedback,
      });
    } catch (error) {
      console.error("Error submitting feedback:", error);
      res.status(500).json({
        success: false,
        error: "Có lỗi xảy ra khi gửi góp ý. Vui lòng thử lại sau.",
      });
    }
  });

  // Historical sites API routes
  // Get all historical sites
  app.get(`${apiPrefix}/historical-sites`, async (req, res) => {
    try {
      const sites = await storage.getAllHistoricalSites();
      res.json(sites);
    } catch (error) {
      console.error("Error fetching historical sites:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get historical site by ID
  app.get(`${apiPrefix}/historical-sites/:id`, async (req, res) => {
    try {
      const site = await storage.getHistoricalSiteById(parseInt(req.params.id));
      if (!site) {
        return res.status(404).json({ error: "Historical site not found" });
      }
      res.json(site);
    } catch (error) {
      console.error("Error fetching historical site:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get historical sites by period ID
  app.get(
    `${apiPrefix}/periods/:periodId/historical-sites`,
    async (req, res) => {
      try {
        const sites = await storage.getHistoricalSitesByPeriod(
          parseInt(req.params.periodId),
        );
        res.json(sites);
      } catch (error) {
        console.error("Error fetching historical sites by period ID:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    },
  );

  // Get historical sites by period slug
  app.get(
    `${apiPrefix}/periods-slug/:slug/historical-sites`,
    async (req, res) => {
      try {
        const sites = await storage.getHistoricalSitesByPeriodSlug(
          req.params.slug,
        );
        res.json(sites);
      } catch (error) {
        console.error("Error fetching historical sites by period slug:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    },
  );

  // Settings API routes
  // Get a setting by key
  app.get(`${apiPrefix}/settings/:key`, async (req, res) => {
    try {
      const setting = await storage.getSetting(req.params.key);
      if (!setting) {
        return res.status(404).json({ error: "Thiết lập không tồn tại" });
      }
      res.json(setting);
    } catch (error) {
      console.error("Error fetching setting:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get all settings
  app.get(`${apiPrefix}/settings`, async (req, res) => {
    try {
      const allSettings = await storage.getAllSettings();
      res.json(allSettings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  // API để lấy số liệu thống kê cơ bản
  app.get(`${apiPrefix}/stats`, async (req, res) => {
    try {
      const visitCount = await storage.getVisitCount();
      const searchCount = await storage.getSearchCount();
      
      res.json({
        visitCount,
        searchCount
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  // API để lấy số liệu thống kê cho bảng điều khiển admin
  app.get(`${apiPrefix}/admin/dashboard-stats`, requireAuth, async (req, res) => {
    try {
      // Lấy số lượng visit và search
      const visitCount = await storage.getVisitCount();
      const searchCount = await storage.getSearchCount();
      
      // Lấy số lượng các loại nội dung
      const periodsCount = await storage.getPeriodsCount();
      const eventsCount = await storage.getEventsCount();
      const figuresCount = await storage.getHistoricalFiguresCount();
      const sitesCount = await storage.getHistoricalSitesCount();
      const feedbackCount = await storage.getFeedbackCount();
      const usersCount = await storage.getUsersCount();
      
      // Trả về tổng hợp số liệu
      res.json({
        visitCount,
        searchCount,
        periodsCount,
        eventsCount,
        figuresCount,
        sitesCount,
        feedbackCount,
        usersCount,
        lastUpdated: new Date()
      });
    } catch (error) {
      console.error("Error fetching admin dashboard stats:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Cấu hình lưu trữ cho tập tin ảnh
  const imageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      // Xác định thư mục dựa trên loại tập tin
      let dir = "./uploads/images";

      if (req.path.includes("/favicon")) {
        dir = "./uploads/favicons";
      } else if (req.path.includes("/backgrounds")) {
        dir = "./uploads/backgrounds";
      } else if (req.path.includes("/events")) {
        dir = "./uploads/events";
      } else if (req.path.includes("/figures")) {
        dir = "./uploads/figures";
      } else if (req.path.includes("/sites")) {
        dir = "./uploads/sites";
      }

      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      cb(null, dir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = randomUUID();
      let prefix = "image";

      if (req.path.includes("/favicon")) {
        prefix = "favicon";
      } else if (req.path.includes("/backgrounds")) {
        prefix = "bg";
      } else if (req.path.includes("/events")) {
        prefix = "event";
      } else if (req.path.includes("/figures")) {
        prefix = "figure";
      } else if (req.path.includes("/sites")) {
        prefix = "site";
      }

      cb(null, prefix + "-" + uniqueSuffix + path.extname(file.originalname));
    },
  });

  const uploadImage = multer({
    storage: imageStorage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  });

  // Đồng bộ với công cụ tải lên cũ
  const uploadFavicon = uploadImage;

  // Upload favicon
  app.post(
    `${apiPrefix}/upload/favicon`,
    uploadImage.single("file"),
    async (req, res) => {
      try {
        if (!req.file) {
          return res
            .status(400)
            .json({ success: false, error: "Không có tập tin được tải lên" });
        }

        // Tạo URL cho tập tin
        const fileUrl = `/uploads/favicons/${req.file.filename}`;

        // Cập nhật setting site_favicon với URL của tập tin
        const updated = await storage.updateSetting("site_favicon", fileUrl);

        res.status(200).json({
          success: true,
          url: fileUrl,
          setting: updated,
        });
      } catch (error) {
        console.error("Error uploading favicon:", error);
        res
          .status(500)
          .json({ success: false, error: "Lỗi khi tải lên favicon" });
      }
    },
  );

  // Upload background image
  app.post(
    `${apiPrefix}/upload/backgrounds`,
    uploadImage.single("file"),
    async (req, res) => {
      try {
        if (!req.file) {
          return res
            .status(400)
            .json({ success: false, error: "Không có tập tin được tải lên" });
        }

        // Tạo URL cho tập tin
        const fileUrl = `/uploads/backgrounds/${req.file.filename}`;

        // Cập nhật setting home_background_url với URL của tập tin
        const updated = await storage.updateSetting(
          "home_background_url",
          fileUrl,
        );

        res.status(200).json({
          success: true,
          url: fileUrl,
          setting: updated,
        });
      } catch (error) {
        console.error("Error uploading background image:", error);
        res
          .status(500)
          .json({ success: false, error: "Lỗi khi tải lên hình nền" });
      }
    },
  );

  // Upload hình ảnh cho sự kiện
  app.post(
    `${apiPrefix}/upload/events`,
    uploadImage.single("file"),
    async (req, res) => {
      try {
        if (!req.file) {
          return res
            .status(400)
            .json({ success: false, error: "Không có tập tin được tải lên" });
        }

        // Tạo URL cho tập tin
        const fileUrl = `/uploads/events/${req.file.filename}`;

        res.status(200).json({
          success: true,
          url: fileUrl,
        });
      } catch (error) {
        console.error("Error uploading event image:", error);
        res
          .status(500)
          .json({ success: false, error: "Lỗi khi tải lên hình ảnh sự kiện" });
      }
    },
  );

  // Upload hình ảnh cho nhân vật lịch sử
  app.post(
    `${apiPrefix}/upload/figures`,
    uploadImage.single("file"),
    async (req, res) => {
      try {
        if (!req.file) {
          return res
            .status(400)
            .json({ success: false, error: "Không có tập tin được tải lên" });
        }

        // Tạo URL cho tập tin
        const fileUrl = `/uploads/figures/${req.file.filename}`;

        res.status(200).json({
          success: true,
          url: fileUrl,
        });
      } catch (error) {
        console.error("Error uploading figure image:", error);
        res
          .status(500)
          .json({ success: false, error: "Lỗi khi tải lên hình ảnh nhân vật" });
      }
    },
  );

  // Upload hình ảnh cho di tích lịch sử
  app.post(
    `${apiPrefix}/upload/sites`,
    uploadImage.single("file"),
    async (req, res) => {
      try {
        if (!req.file) {
          return res
            .status(400)
            .json({ success: false, error: "Không có tập tin được tải lên" });
        }

        // Tạo URL cho tập tin
        const fileUrl = `/uploads/sites/${req.file.filename}`;

        res.status(200).json({
          success: true,
          url: fileUrl,
        });
      } catch (error) {
        console.error("Error uploading site image:", error);
        res
          .status(500)
          .json({ success: false, error: "Lỗi khi tải lên hình ảnh di tích" });
      }
    },
  );

  // Update a setting
  app.put(
    `${apiPrefix}/settings/:key`,
    requireAuth,
    requireAdmin,
    async (req, res) => {
      try {
        const { value } = req.body;

        if (value === undefined) {
          return res.status(400).json({ error: "Thiếu giá trị thiết lập" });
        }

        const updated = await storage.updateSetting(req.params.key, value);
        if (!updated) {
          return res
            .status(404)
            .json({ error: "Không thể cập nhật thiết lập" });
        }

        res.json(updated);
      } catch (error) {
        console.error("Error updating setting:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    },
  );

  // Initialize default settings
  app.post(
    `${apiPrefix}/settings/initialize`,
    requireAuth,
    requireAdmin,
    async (req, res) => {
      try {
        await storage.initializeDefaultSettings();
        const allSettings = await storage.getAllSettings();
        res.json({
          success: true,
          message: "Các thiết lập mặc định đã được khởi tạo",
          settings: allSettings,
        });
      } catch (error) {
        console.error("Error initializing settings:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    },
  );

  // Auth API routes
  // Đăng nhập
  app.post(`${apiPrefix}/auth/login`, async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: "Vui lòng nhập tên đăng nhập và mật khẩu",
        });
      }

      const result = await loginUser(username, password);

      if (!result.success) {
        return res.status(401).json(result);
      }

      // Tạo token cho phiên đăng nhập
      const token = generateToken(result.user!);

      // Tiến hành đăng nhập vào session
      if (req.login) {
        req.login(result.user!, (err) => {
          if (err) {
            console.error("Session login error:", err);
            return res.status(500).json({
              success: false,
              message: "Lỗi đăng nhập session",
            });
          }

          res.json({
            success: true,
            message: "Đăng nhập thành công",
            user: result.user,
            token,
          });
        });
      } else {
        res.json({
          success: true,
          message: "Đăng nhập thành công (chế độ JWT)",
          user: result.user,
          token,
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi đăng nhập",
      });
    }
  });

  // Lấy thông tin người dùng hiện tại
  app.get(`${apiPrefix}/auth/user`, async (req, res) => {
    // Phương pháp 1: Kiểm tra sessions passport.js
    if (req.isAuthenticated?.()) {
      return res.json(req.user);
    }

    // Phương pháp 2: Kiểm tra JWT token (d �ng cho API calls)
    const authToken = req.headers.authorization?.split(" ")[1];

    if (authToken) {
      try {
        const user = await getUserFromToken(authToken);
        if (user) {
          return res.json(user);
        }
      } catch (error) {
        console.error("Error getting user from token:", error);
      }
    }

    // Nếu không có xác thực nào hợp lệ
    return res.status(401).json({ error: "Unauthorized" });
  });

  // API Stats - yêu cầu quyền Admin
  app.get(
    `${apiPrefix}/admin/stats`,
    requireAuth,
    async (req, res) => {
      try {
        // Đếm tổng số các mục
        const periodsCount = (await storage.getAllPeriods()).length;
        const eventsCount = (await storage.getAllEvents()).length;
        const figuresCount = (await storage.getAllHistoricalFigures()).length;
        const sitesCount = (await storage.getAllHistoricalSites()).length;
        const eventTypesCount = (await storage.getAllEventTypes()).length;

        // Feedback chưa được xử lý
        const pendingFeedbackCount = await storage.getPendingFeedbackCount();

        res.json({
          periodsCount,
          eventsCount,
          figuresCount,
          sitesCount,
          eventTypesCount,
          pendingFeedbackCount,
          // Số liệu thống kê thực tế từ cơ sở dữ liệu
          visitsCount: await storage.getVisitCount(),
          searchCount: await storage.getSearchCount(),
        });
      } catch (error) {
        console.error("Error fetching admin stats:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    },
  );

  // API Quản lý thời kỳ
  app.get(
    `${apiPrefix}/admin/periods`,
    requireAuth,
    requirePeriodsPermission,
    async (req, res) => {
      try {
        const periods = await storage.getAllPeriods();
        res.json(periods);
      } catch (error) {
        console.error("Error fetching periods for admin:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    },
  );

  app.post(
    `${apiPrefix}/admin/periods`,
    requireAuth,
    requirePeriodsPermission,
    async (req, res) => {
      try {
        const periodData = req.body;

        // Kiểm tra dữ liệu đầu vào
        if (
          !periodData ||
          !periodData.name ||
          !periodData.timeframe ||
          !periodData.description
        ) {
          return res.status(400).json({
            success: false,
            message: "Thiếu thông tin. Vui lòng điền đầy đủ các trường.",
          });
        }

        // Tạo slug từ tên nếu chưa có
        if (!periodData.slug) {
          periodData.slug = periodData.name
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^\w\s-]/g, "")
            .replace(/[\s_-]+/g, "-")
            .replace(/^-+|-+$/g, "");
        }

        // Lấy vị trí sắp xếp cuối cùng (+1)
        const periods = await storage.getAllPeriods();
        const maxSortOrder =
          periods.length > 0
            ? Math.max(...periods.map((p) => p.sortOrder))
            : -1;
        periodData.sortOrder = maxSortOrder + 1;

        // Lưu vào database
        const newPeriod = await storage.createPeriod(periodData);

        res.status(201).json({
          success: true,
          message: "Thêm thời kỳ thành công",
          period: newPeriod,
        });
      } catch (error) {
        console.error("Error creating period:", error);
        res.status(500).json({
          success: false,
          message: "Lỗi khi tạo thời kỳ mới",
        });
      }
    },
  );

  app.put(
    `${apiPrefix}/admin/periods/:id`,
    requireAuth,
    requirePeriodsPermission,
    async (req, res) => {
      try {
        const periodId = parseInt(req.params.id);
        const periodData = req.body;

        // Kiểm tra dữ liệu đầu vào
        if (
          !periodData ||
          !periodData.name ||
          !periodData.timeframe ||
          !periodData.description
        ) {
          return res.status(400).json({
            success: false,
            message: "Thiếu thông tin. Vui lòng điền đầy đủ các trường.",
          });
        }

        // Cập nhật slug nếu cần
        if (!periodData.slug) {
          periodData.slug = periodData.name
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^\w\s-]/g, "")
            .replace(/[\s_-]+/g, "-")
            .replace(/^-+|-+$/g, "");
        }

        // Cập nhật vào database
        const updatedPeriod = await storage.updatePeriod(periodId, periodData);

        if (!updatedPeriod) {
          return res.status(404).json({
            success: false,
            message: "Không tìm thấy thời kỳ",
          });
        }

        res.json({
          success: true,
          message: "Cập nhật thời kỳ thành công",
          period: updatedPeriod,
        });
      } catch (error) {
        console.error("Error updating period:", error);
        res.status(500).json({
          success: false,
          message: "Lỗi khi cập nhật thời kỳ",
        });
      }
    },
  );

  // API để lấy danh sách các thực thể liên quan đến thời kỳ
  app.get(
    `${apiPrefix}/admin/periods/:id/related-entities`,
    requireAuth,
    requirePeriodsPermission,
    async (req, res) => {
      try {
        const periodId = parseInt(req.params.id);

        // Kiểm tra thời kỳ có tồn tại không
        const period = await storage.getPeriodById(periodId);
        if (!period) {
          return res.status(404).json({
            success: false,
            message: "Không tìm thấy thời kỳ",
          });
        }

        // Lấy tất cả các thực thể liên quan
        const relatedEntities =
          await storage.getPeriodRelatedEntities(periodId);

        // Lấy danh sách các thời kỳ khác để lựa chọn
        const allPeriods = await storage.getAllPeriods();
        const otherPeriods = allPeriods.filter((p) => p.id !== periodId);

        res.json({
          success: true,
          data: {
            periodName: period.name,
            events: relatedEntities.events,
            figures: relatedEntities.figures,
            sites: relatedEntities.sites,
            availablePeriods: otherPeriods,
          },
        });
      } catch (error) {
        console.error("Error getting related entities:", error);
        res.status(500).json({
          success: false,
          message: "Lỗi khi lấy dữ liệu liên quan",
        });
      }
    },
  );

  // API để cập nhật thời kỳ cho các thực thể
  app.post(
    `${apiPrefix}/admin/periods/reassign-entities`,
    requireAuth,
    requirePeriodsPermission,
    async (req, res) => {
      try {
        const { newPeriodId, eventIds, figureIds, siteIds } = req.body;

        if (
          !newPeriodId ||
          ((!eventIds || eventIds.length === 0) &&
            (!figureIds || figureIds.length === 0) &&
            (!siteIds || siteIds.length === 0))
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Dữ liệu không hợp lệ. Cần cung cấp ID thời kỳ mới và ít nhất một danh sách ID thực thể.",
          });
        }

        // Kiểm tra thời kỳ mới có tồn tại không
        const newPeriod = await storage.getPeriodById(newPeriodId);
        if (!newPeriod) {
          return res.status(404).json({
            success: false,
            message: "Không tìm thấy thời kỳ mới",
          });
        }

        // Cập nhật thời kỳ cho từng loại thực thể
        const results = {
          events: false,
          figures: false,
          sites: false,
        };

        if (eventIds && eventIds.length > 0) {
          results.events = await storage.updateEventsPeriod(
            eventIds,
            newPeriodId,
          );
        }

        if (figureIds && figureIds.length > 0) {
          results.figures = await storage.updateHistoricalFiguresPeriod(
            figureIds,
            newPeriodId,
          );
        }

        if (siteIds && siteIds.length > 0) {
          results.sites = await storage.updateHistoricalSitesPeriod(
            siteIds,
            newPeriodId,
          );
        }

        res.json({
          success: true,
          message: "Cập nhật thời kỳ cho các thực thể thành công",
          results,
        });
      } catch (error) {
        console.error("Error reassigning entities:", error);
        res.status(500).json({
          success: false,
          message: "Lỗi khi cập nhật thời kỳ cho các thực thể",
        });
      }
    },
  );

  app.delete(
    `${apiPrefix}/admin/periods/:id`,
    requireAuth,
    requirePeriodsPermission,
    async (req, res) => {
      try {
        const periodId = parseInt(req.params.id);
        const defaultPeriodId = 17; // ID của thời kỳ "Không rõ"

        // Kiểm tra thời kỳ có tồn tại không
        const period = await storage.getPeriodById(periodId);
        if (!period) {
          return res.status(404).json({
            success: false,
            message: "Không tìm thấy thời kỳ",
          });
        }

        // Không cho phép xóa thời kỳ "Không rõ"
        if (period.slug === "khong-ro") {
          return res.status(400).json({
            success: false,
            message: 'Không thể xóa thời kỳ mặc định "Không rõ"',
          });
        }

        // Kiểm tra có thực thể nào liên quan đến thời kỳ này không
        const relatedEntities =
          await storage.getPeriodRelatedEntities(periodId);
        const hasRelatedEntities =
          relatedEntities.events.length > 0 ||
          relatedEntities.figures.length > 0 ||
          relatedEntities.sites.length > 0;

        // Nếu có thực thể liên quan, tự động chuyển sang thời kỳ "Không rõ"
        if (hasRelatedEntities) {
          // Chuyển các sự kiện
          if (relatedEntities.events.length > 0) {
            const eventIds = relatedEntities.events.map((event) => event.id);
            await storage.updateEventsPeriod(eventIds, defaultPeriodId);
          }

          // Chuyển các nhân vật lịch sử
          if (relatedEntities.figures.length > 0) {
            const figureIds = relatedEntities.figures.map(
              (figure) => figure.id,
            );
            await storage.updateHistoricalFiguresPeriod(
              figureIds,
              defaultPeriodId,
            );
          }

          // Chuyển các địa danh lịch sử
          if (relatedEntities.sites.length > 0) {
            const siteIds = relatedEntities.sites.map((site) => site.id);
            await storage.updateHistoricalSitesPeriod(siteIds, defaultPeriodId);
          }
        }

        // Xóa thời kỳ sau khi đã chuyển các thực thể liên quan
        const deleted = await storage.deletePeriod(periodId);

        if (!deleted) {
          return res.status(500).json({
            success: false,
            message: "Lỗi khi xóa thời kỳ",
          });
        }

        res.json({
          success: true,
          message:
            "Xóa thời kỳ thành công" +
            (hasRelatedEntities
              ? ', các nội dung liên quan đã được chuyển sang thời kỳ "Không rõ"'
              : ""),
        });
      } catch (error) {
        console.error("Error deleting period:", error);
        res.status(500).json({
          success: false,
          message: "Lỗi khi xóa thời kỳ",
        });
      }
    },
  );

  // API để gán lại các sự kiện và di tích từ thời kỳ này sang thời kỳ khác
  app.post(
    `${apiPrefix}/admin/periods/:id/reassign`,
    requireAuth,
    requireAdmin,
    async (req, res) => {
      try {
        const sourceId = parseInt(req.params.id);
        const { targetPeriodId } = req.body;

        if (!targetPeriodId) {
          return res.status(400).json({
            success: false,
            message: "Thiếu ID thời kỳ đích",
          });
        }

        // Kiểm tra thời kỳ nguồn có tồn tại không
        const sourcePeriod = await db.query.periods.findFirst({
          where: eq(periods.id, sourceId),
        });

        if (!sourcePeriod) {
          return res.status(404).json({
            success: false,
            message: "Không tìm thấy thời kỳ nguồn",
          });
        }

        // Kiểm tra thời kỳ đích có tồn tại không
        const targetPeriod = await db.query.periods.findFirst({
          where: eq(periods.id, targetPeriodId),
        });

        if (!targetPeriod) {
          return res.status(404).json({
            success: false,
            message: "Không tìm thấy thời kỳ đích",
          });
        }

        // Cập nhật các sự kiện
        await db
          .update(events)
          .set({ periodId: targetPeriodId })
          .where(eq(events.periodId, sourceId));

        // Cập nhật các nhân vật lịch sử
        // Lấy thông tin thời kỳ đích để cập nhật cả periodText
        await db
          .update(historicalFigures)
          .set({
            periodId: targetPeriodId,
            periodText: targetPeriod.name, // Cập nhật cả periodText để tương thích ngược
          })
          .where(eq(historicalFigures.periodId, sourceId));

        // Cập nhật các di tích
        await db
          .update(historicalSites)
          .set({ periodId: targetPeriodId })
          .where(eq(historicalSites.periodId, sourceId));

        res.json({
          success: true,
          message: `Đã chuyển tất cả sự kiện, nhân vật và di tích từ "${sourcePeriod.name}" sang "${targetPeriod.name}"`,
        });
      } catch (error) {
        console.error("Error reassigning items:", error);
        res.status(500).json({
          success: false,
          message: "Lỗi khi gán lại các mục liên kết",
        });
      }
    },
  );

  // API để xóa tất cả các sự kiện và di tích liên kết với một thời kỳ
  app.post(
    `${apiPrefix}/admin/periods/:id/delete-content`,
    requireAuth,
    requireAdmin,
    async (req, res) => {
      try {
        const periodId = parseInt(req.params.id);

        // Kiểm tra thời kỳ có tồn tại không
        const period = await db.query.periods.findFirst({
          where: eq(periods.id, periodId),
        });

        if (!period) {
          return res.status(404).json({
            success: false,
            message: "Không tìm thấy thời kỳ",
          });
        }

        // Xóa các sự kiện
        const eventsResult = await db
          .delete(events)
          .where(eq(events.periodId, periodId));

        // Xóa các nhân vật lịch sử
        const figuresResult = await db
          .delete(historicalFigures)
          .where(eq(historicalFigures.periodId, periodId));

        // Xóa các di tích
        const sitesResult = await db
          .delete(historicalSites)
          .where(eq(historicalSites.periodId, periodId));

        res.json({
          success: true,
          message: `Đã xóa tất cả sự kiện, nhân vật và di tích liên kết với thời kỳ "${period.name}"`,
        });
      } catch (error) {
        console.error("Error deleting related items:", error);
        res.status(500).json({
          success: false,
          message: "Lỗi khi xóa các mục liên kết",
        });
      }
    },
  );

  // API Reorder Periods - tạo mới hoàn toàn, tiếp cận đơn giản hơn
  app.post(
    `${apiPrefix}/periods/sort`,
    requireAuth,
    requirePeriodsPermission,
    async (req, res) => {
      try {
        console.log("PERIOD SORT REQUEST:", req.body);

        // Kiểm tra dữ liệu đầu vào là mảng
        if (!Array.isArray(req.body)) {
          return res.status(400).json({
            success: false,
            message: "Yêu cầu dữ liệu là mảng các ID",
          });
        }

        // Biến mảng ID thành số nguyên
        const periodIds = req.body.map((id) =>
          typeof id === "string" ? parseInt(id, 10) : Number(id),
        );

        console.log("Processed IDs for sorting:", periodIds);

        // Kiểm tra có ID hợp lệ không
        if (periodIds.some((id) => isNaN(id) || id <= 0)) {
          return res.status(400).json({
            success: false,
            message: "Danh sách chứa ID không hợp lệ",
          });
        }

        // Cập nhật từng period một
        for (let i = 0; i < periodIds.length; i++) {
          await db
            .update(periods)
            .set({ sortOrder: i })
            .where(eq(periods.id, periodIds[i]));

          console.log(`Updated period ${periodIds[i]} with sortOrder ${i}`);
        }

        // Luôn trả về định dạng JSON hợp lệ
        return res.json({
          success: true,
          message: "Cập nhật thứ tự thành công",
        });
      } catch (error) {
        console.error("Error sorting periods:", error);
        return res.status(500).json({
          success: false,
          message: "Lỗi khi sắp xếp thời kỳ.",
        });
      }
    },
  );

  // API Quản lý loại sự kiện
  app.get(
    `${apiPrefix}/admin/event-types`,
    requireAuth,
    requireEventsPermission,
    async (req, res) => {
      try {
        const eventTypes = await storage.getAllEventTypes();
        res.json(eventTypes);
      } catch (error) {
        console.error("Error fetching event types for admin:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    },
  );

  app.post(
    `${apiPrefix}/admin/event-types`,
    requireAuth,
    requireEventsPermission,
    async (req, res) => {
      try {
        const typeData = req.body;

        // Kiểm tra dữ liệu đầu vào
        if (!typeData || !typeData.name) {
          return res.status(400).json({
            success: false,
            message: "Thiếu tên loại sự kiện",
          });
        }

        // Tạo slug từ tên nếu chưa có
        if (!typeData.slug) {
          typeData.slug = typeData.name
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^\w\s-]/g, "")
            .replace(/[\s_-]+/g, "-")
            .replace(/^-+|-+$/g, "");
        }

        // Lấy vị trí sắp xếp cuối cùng (+1)
        const types = await storage.getAllEventTypes();
        const maxSortOrder =
          types.length > 0 ? Math.max(...types.map((t) => t.sortOrder)) : -1;
        typeData.sortOrder = maxSortOrder + 1;

        // Lưu vào database
        const newType = await storage.createEventType(typeData);

        res.status(201).json({
          success: true,
          message: "Thêm loại sự kiện thành công",
          eventType: newType,
        });
      } catch (error) {
        console.error("Error creating event type:", error);
        res.status(500).json({
          success: false,
          message: "Lỗi khi tạo loại sự kiện mới",
        });
      }
    },
  );

  app.put(
    `${apiPrefix}/admin/event-types/:id`,
    requireAuth,
    requireEventsPermission,
    async (req, res) => {
      try {
        const typeId = parseInt(req.params.id);
        const typeData = req.body;

        // Kiểm tra dữ liệu đầu vào
        if (!typeData || !typeData.name) {
          return res.status(400).json({
            success: false,
            message: "Thiếu tên loại sự kiện",
          });
        }

        // Cập nhật slug nếu cần
        if (!typeData.slug) {
          typeData.slug = typeData.name
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^\w\s-]/g, "")
            .replace(/[\s_-]+/g, "-")
            .replace(/^-+|-+$/g, "");
        }

        // Cập nhật vào database
        const updatedType = await storage.updateEventType(typeId, typeData);

        if (!updatedType) {
          return res.status(404).json({
            success: false,
            message: "Không tìm thấy loại sự kiện",
          });
        }

        res.json({
          success: true,
          message: "Cập nhật loại sự kiện thành công",
          eventType: updatedType,
        });
      } catch (error) {
        console.error("Error updating event type:", error);
        res.status(500).json({
          success: false,
          message: "Lỗi khi cập nhật loại sự kiện",
        });
      }
    },
  );

  app.delete(
    `${apiPrefix}/admin/event-types/:id`,
    requireAuth,
    requireEventsPermission,
    async (req, res) => {
      try {
        const typeId = parseInt(req.params.id);

        // Kiểm tra xem có sự kiện nào sử dụng loại này không
        const relatedEvents = await storage.getEventsUsingEventType(typeId);

        // Tự động gỡ bỏ các liên kết trước khi xóa loại sự kiện
        if (relatedEvents.length > 0) {
          console.log(
            `Xóa tự động ${relatedEvents.length} liên kết cho loại sự kiện ID ${typeId}`,
          );
          await storage.removeEventTypeAssociationsByType(typeId);
        }

        // Xóa loại sự kiện
        const deleted = await storage.deleteEventType(typeId);

        if (!deleted) {
          return res.status(404).json({
            success: false,
            message: "Không tìm thấy loại sự kiện",
          });
        }

        res.json({
          success: true,
          message:
            relatedEvents.length > 0
              ? `Xóa loại sự kiện thành công (đã gỡ bỏ ${relatedEvents.length} liên kết)`
              : "Xóa loại sự kiện thành công",
        });
      } catch (error) {
        console.error("Error deleting event type:", error);
        res.status(500).json({
          success: false,
          message: "Lỗi khi xóa loại sự kiện",
        });
      }
    },
  );

  app.put(
    `${apiPrefix}/admin/event-types/reorder`,
    requireAuth,
    requireAdmin,
    async (req, res) => {
      try {
        const { orderedIds } = req.body;

        if (!Array.isArray(orderedIds)) {
          return res.status(400).json({
            success: false,
            message: "Sai định dạng dữ liệu. Cần cung cấp mảng ID.",
          });
        }

        const success = await storage.reorderEventTypes(orderedIds);

        if (!success) {
          return res.status(400).json({
            success: false,
            message: "Không thể sắp xếp lại thứ tự.",
          });
        }

        res.json({
          success: true,
          message: "Cập nhật thứ tự thành công",
        });
      } catch (error) {
        console.error("Error reordering event types:", error);
        res.status(500).json({
          success: false,
          message: "Lỗi khi sắp xếp lại thứ tự",
        });
      }
    },
  );

  // API quản lý sự kiện cho admin
  app.get(
    `${apiPrefix}/admin/events`,
    requireAuth,
    requireEventsPermission,
    async (req, res) => {
      try {
        // Lấy danh sách sự kiện kèm theo thông tin loại sự kiện
        const allEvents = await storage.getAllEventsWithTypes();
        res.json(allEvents);
      } catch (error) {
        console.error("Error fetching events for admin:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    },
  );

  app.post(
    `${apiPrefix}/admin/events`,
    requireAuth,
    requireEventsPermission,
    async (req, res) => {
      try {
        const eventData = req.body;

        // Kiểm tra dữ liệu đầu vào
        if (!eventData || !eventData.title || !eventData.periodId) {
          return res.status(400).json({
            success: false,
            message: "Dữ liệu không hợp lệ",
          });
        }

        // Xử lý eventTypes từ mảng ID thành mảng đối tượng liên kết
        const eventTypeIds = eventData.eventTypes || [];
        delete eventData.eventTypes; // Xóa trường eventTypes khỏi dữ liệu chính

        // Tạo slug từ title nếu chưa có
        if (!eventData.slug) {
          eventData.slug = eventData.title
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^\w\s-]/g, "")
            .replace(/[\s_-]+/g, "-")
            .replace(/^-+|-+$/g, "");
        }

        // Lấy vị trí sắp xếp cuối cùng (+1) cho sự kiện trong cùng thời kỳ
        const eventsInPeriod = await storage.getEventsByPeriod(
          parseInt(eventData.periodId.toString()),
        );
        const maxSortOrder =
          eventsInPeriod.length > 0
            ? Math.max(...eventsInPeriod.map((e) => e.sortOrder || 0))
            : -1;
        eventData.sortOrder = maxSortOrder + 1;

        // Xử lý hình ảnh base64 nếu có
        if (eventData.imageUrl && eventData.imageUrl.startsWith("data:image")) {
          // Xử lý upload hình ảnh base64 - đoạn này nên có logic lưu hình ảnh vào server
          // Giữ nguyên chuỗi base64 cho demo
        }

        // Lưu sự kiện vào database
        const newEvent = await storage.createEvent(eventData);

        // Lưu các liên kết với loại sự kiện
        if (eventTypeIds.length > 0) {
          await storage.associateEventWithTypes(newEvent.id, eventTypeIds);
        }

        res.status(201).json({
          success: true,
          message: "Thêm sự kiện thành công",
          event: newEvent,
        });
      } catch (error) {
        console.error("Error creating event:", error);
        res.status(500).json({
          success: false,
          message: "Lỗi khi tạo sự kiện mới",
        });
      }
    },
  );

  app.put(
    `${apiPrefix}/admin/events/:id`,
    requireAuth,
    requireEventsPermission,
    async (req, res) => {
      try {
        const eventId = parseInt(req.params.id);
        const eventData = req.body;

        // Kiểm tra dữ liệu đầu vào
        if (!eventData || !eventData.title || !eventData.periodId) {
          return res.status(400).json({
            success: false,
            message: "Dữ liệu không hợp lệ",
          });
        }

        // Lấy thông tin sự kiện cũ để kiểm tra hình ảnh
        const oldEvent = await storage.getEventById(eventId);
        let oldImageUrl = oldEvent?.imageUrl;

        // Xử lý eventTypes từ mảng ID thành mảng đối tượng liên kết
        const eventTypeIds = eventData.eventTypes || [];
        delete eventData.eventTypes; // Xóa trường eventTypes khỏi dữ liệu chính

        // Cập nhật slug từ title nếu cần
        if (!eventData.slug) {
          eventData.slug = eventData.title
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^\w\s-]/g, "")
            .replace(/[\s_-]+/g, "-")
            .replace(/^-+|-+$/g, "");
        }

        // Xử lý hình ảnh base64 nếu có
        if (eventData.imageUrl && eventData.imageUrl.startsWith("data:image")) {
          // Xử lý upload hình ảnh base64 - đoạn này nên có logic lưu hình ảnh vào server
          // Giữ nguyên chuỗi base64 cho demo
        }

        // Cập nhật sự kiện trong database
        // Xóa hình ảnh cũ nếu có hình ảnh mới và khác với hình ảnh cũ
        if (
          eventData.imageUrl &&
          oldImageUrl &&
          eventData.imageUrl !== oldImageUrl
        ) {
          // Bỏ qua URL bên ngoài (không phải /uploads/)
          if (oldImageUrl.startsWith("/uploads/")) {
            deleteFile(oldImageUrl);
            console.log(`Xóa hình ảnh cũ của sự kiện: ${oldImageUrl}`);
          }
        }

        const updatedEvent = await storage.updateEvent(eventId, eventData);

        if (!updatedEvent) {
          return res.status(404).json({
            success: false,
            message: "Không tìm thấy sự kiện",
          });
        }

        // Cập nhật các liên kết với loại sự kiện
        await storage.removeEventTypeAssociations(eventId); // Xóa liên kết hiện tại
        if (eventTypeIds.length > 0) {
          await storage.associateEventWithTypes(eventId, eventTypeIds); // Thêm liên kết mới
        }

        res.json({
          success: true,
          message: "Cập nhật sự kiện thành công",
          event: updatedEvent,
        });
      } catch (error) {
        console.error("Error updating event:", error);
        res.status(500).json({
          success: false,
          message: "Lỗi khi cập nhật sự kiện",
        });
      }
    },
  );

  app.delete(
    `${apiPrefix}/admin/events/:id`,
    requireAuth,
    requireEventsPermission,
    async (req, res) => {
      try {
        const eventId = parseInt(req.params.id);

        // Lấy thông tin sự kiện trước khi xóa để có đường dẫn hình ảnh nếu có
        const event = await storage.getEventById(eventId);
        const oldImageUrl = event?.imageUrl;

        // Xóa các liên kết với loại sự kiện trước
        await storage.removeEventTypeAssociations(eventId);

        // Xóa sự kiện
        const deleted = await storage.deleteEvent(eventId);

        if (!deleted) {
          return res.status(404).json({
            success: false,
            message: "Không tìm thấy sự kiện",
          });
        }

        // Xóa hình ảnh nếu có
        if (oldImageUrl && oldImageUrl.startsWith("/uploads/")) {
          deleteFile(oldImageUrl);
          console.log(`Xóa hình ảnh của sự kiện: ${oldImageUrl}`);
        }

        res.json({
          success: true,
          message: "Xóa sự kiện thành công",
        });
      } catch (error) {
        console.error("Error deleting event:", error);
        res.status(500).json({
          success: false,
          message: "Lỗi khi xóa sự kiện",
        });
      }
    },
  );

  app.post(
    `${apiPrefix}/admin/events/reorder`,
    requireAuth,
    requireEventsPermission,
    async (req, res) => {
      try {
        const { orderedIds } = req.body;

        if (!Array.isArray(orderedIds)) {
          return res.status(400).json({
            success: false,
            message: "Sai định dạng dữ liệu. Cần cung cấp mảng ID.",
          });
        }

        const success = await storage.reorderEvents(orderedIds);

        if (!success) {
          return res.status(400).json({
            success: false,
            message: "Không thể sắp xếp lại thứ tự.",
          });
        }

        res.json({
          success: true,
          message: "Cập nhật thứ tự thành công",
        });
      } catch (error) {
        console.error("Error reordering events:", error);
        res.status(500).json({
          success: false,
          message: "Lỗi khi sắp xếp lại thứ tự",
        });
      }
    },
  );

  // API Quản lý nhân vật lịch sử
  app.get(
    `${apiPrefix}/admin/historical-figures`,
    requireAuth,
    requireFiguresPermission,
    async (req, res) => {
      try {
        const figures = await storage.getAllHistoricalFigures();
        res.json(figures);
      } catch (error) {
        console.error("Error fetching historical figures for admin:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    },
  );

  app.post(
    `${apiPrefix}/admin/historical-figures`,
    requireAuth,
    requireFiguresPermission,
    async (req, res) => {
      try {
        const figureData = req.body;

        // Kiểm tra dữ liệu đầu vào
        if (
          !figureData ||
          !figureData.name ||
          (!figureData.periodId && !figureData.period)
        ) {
          return res.status(400).json({
            success: false,
            message: "Thiếu thông tin bắt buộc",
          });
        }

        // Đảm bảo tương thích ngược
        if (figureData.periodId) {
          // Nếu có periodId, tìm tên period và lưu vào periodText
          const period = await storage.getPeriodById(figureData.periodId);
          if (period) {
            figureData.periodText = period.name;
          } else {
            figureData.periodText = figureData.period || "Không xác định";
          }
        } else if (figureData.period) {
          // Nếu không có periodId nhưng có period text
          figureData.periodText = figureData.period;
        }

        const newFigure = await storage.createHistoricalFigure(figureData);

        if (!newFigure) {
          return res.status(500).json({
            success: false,
            message: "Không thể tạo nhân vật",
          });
        }

        res.status(201).json({
          success: true,
          message: "Tạo nhân vật lịch sử thành công",
          figure: newFigure,
        });
      } catch (error) {
        console.error("Error creating historical figure:", error);
        res.status(500).json({
          success: false,
          message: "Lỗi khi tạo nhân vật lịch sử",
        });
      }
    },
  );

  app.put(
    `${apiPrefix}/admin/historical-figures/:id`,
    requireAuth,
    requireFiguresPermission,
    async (req, res) => {
      try {
        const figureId = parseInt(req.params.id);
        const figureData = req.body;

        // Kiểm tra dữ liệu đầu vào
        if (!figureData) {
          return res.status(400).json({
            success: false,
            message: "Thiếu dữ liệu cập nhật",
          });
        }

        // Lấy thông tin cũ của nhân vật để lấy hình ảnh cũ (nếu có)
        const oldFigure = await storage.getHistoricalFigureById(figureId);
        const oldImageUrl = oldFigure?.imageUrl;

        // Đảm bảo tương thích ngược
        if (figureData.periodId) {
          // Nếu có periodId, tìm tên period và lưu vào periodText
          const period = await storage.getPeriodById(figureData.periodId);
          if (period) {
            figureData.periodText = period.name;
          } else {
            figureData.periodText = figureData.period || "Không xác định";
          }
        } else if (figureData.period) {
          // Nếu không có periodId nhưng có period text
          figureData.periodText = figureData.period;
        }

        // Xóa hình ảnh cũ nếu có hình ảnh mới và khác với hình ảnh cũ
        if (
          figureData.imageUrl &&
          oldImageUrl &&
          figureData.imageUrl !== oldImageUrl
        ) {
          // Bỏ qua URL bên ngoài (không phải /uploads/)
          if (oldImageUrl.startsWith("/uploads/")) {
            deleteFile(oldImageUrl);
            console.log(`Xóa hình ảnh cũ của nhân vật: ${oldImageUrl}`);
          }
        }

        const updatedFigure = await storage.updateHistoricalFigure(
          figureId,
          figureData,
        );

        if (!updatedFigure) {
          return res.status(404).json({
            success: false,
            message: "Không tìm thấy nhân vật lịch sử",
          });
        }

        res.json({
          success: true,
          message: "Cập nhật nhân vật lịch sử thành công",
          figure: updatedFigure,
        });
      } catch (error) {
        console.error("Error updating historical figure:", error);
        res.status(500).json({
          success: false,
          message: "Lỗi khi cập nhật nhân vật lịch sử",
        });
      }
    },
  );

  app.delete(
    `${apiPrefix}/admin/historical-figures/:id`,
    requireAuth,
    requireFiguresPermission,
    async (req, res) => {
      try {
        const figureId = parseInt(req.params.id);

        // Lấy thông tin nhân vật để kiểm tra hình ảnh
        const figure = await storage.getHistoricalFigureById(figureId);
        const oldImageUrl = figure?.imageUrl;

        const deleted = await storage.deleteHistoricalFigure(figureId);

        if (!deleted) {
          return res.status(404).json({
            success: false,
            message: "Không tìm thấy nhân vật lịch sử",
          });
        }

        // Xóa hình ảnh nếu có
        if (oldImageUrl && oldImageUrl.startsWith("/uploads/")) {
          deleteFile(oldImageUrl);
          console.log(`Xóa hình ảnh của nhân vật: ${oldImageUrl}`);
        }

        res.json({
          success: true,
          message: "Xóa nhân vật lịch sử thành công",
        });
      } catch (error) {
        console.error("Error deleting historical figure:", error);
        res.status(500).json({
          success: false,
          message: "Lỗi khi xóa nhân vật lịch sử",
        });
      }
    },
  );

  app.post(
    `${apiPrefix}/admin/historical-figures/reorder`,
    requireAuth,
    requireFiguresPermission,
    async (req, res) => {
      try {
        const { orderedIds } = req.body;

        if (!Array.isArray(orderedIds)) {
          return res.status(400).json({
            success: false,
            message: "Sai định dạng dữ liệu. Cần cung cấp mảng ID.",
          });
        }

        const success = await storage.reorderHistoricalFigures(orderedIds);

        if (!success) {
          return res.status(400).json({
            success: false,
            message: "Không thể sắp xếp lại thứ tự.",
          });
        }

        res.json({
          success: true,
          message: "Cập nhật thứ tự thành công",
        });
      } catch (error) {
        console.error("Error reordering historical figures:", error);
        res.status(500).json({
          success: false,
          message: "Lỗi khi sắp xếp lại thứ tự",
        });
      }
    },
  );

  // === API Quản lý địa danh lịch sử ===

  // Lấy tất cả địa danh lịch sử (cho admin)
  app.get(
    `${apiPrefix}/admin/historical-sites`,
    requireAuth,
    requireAdmin,
    async (req, res) => {
      try {
        const sites = await storage.getAllHistoricalSites();
        return res.status(200).json(sites);
      } catch (error) {
        console.error("Error fetching historical sites:", error);
        return res.status(500).json({
          success: false,
          message: "Lỗi khi lấy danh sách địa danh lịch sử.",
        });
      }
    },
  );

  // Thêm địa danh lịch sử mới
  app.post(
    `${apiPrefix}/admin/historical-sites`,
    requireAuth,
    requireSitesPermission,
    async (req, res) => {
      try {
        const siteData = req.body;

        // Kiểm tra dữ liệu đầu vào
        if (
          !siteData ||
          !siteData.name ||
          !siteData.location ||
          !siteData.description
        ) {
          return res.status(400).json({
            success: false,
            message: "Thiếu thông tin. Vui lòng điền đầy đủ các trường.",
          });
        }

        // Lấy số lượng địa danh hiện tại để làm sortOrder mặc định
        const allSites = await storage.getAllHistoricalSites();
        siteData.sortOrder = allSites.length;

        const newSite = await storage.createHistoricalSite(siteData);

        return res.status(201).json({
          success: true,
          message: "Thêm địa danh lịch sử thành công.",
          data: newSite,
        });
      } catch (error) {
        console.error("Error creating historical site:", error);
        return res.status(500).json({
          success: false,
          message: "Lỗi khi thêm địa danh lịch sử.",
        });
      }
    },
  );

  // Cập nhật địa danh lịch sử
  app.put(
    `${apiPrefix}/admin/historical-sites/:id`,
    requireAuth,
    requireSitesPermission,
    async (req, res) => {
      try {
        const { id } = req.params;
        const siteData = req.body;

        // Kiểm tra dữ liệu đầu vào
        if (
          !siteData ||
          (!siteData.name &&
            !siteData.location &&
            !siteData.description &&
            !siteData.imageUrl &&
            !siteData.periodId &&
            !siteData.detailedDescription &&
            !siteData.mapUrl &&
            !siteData.address &&
            !siteData.yearBuilt &&
            !siteData.relatedEventId)
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Thiếu thông tin. Vui lòng cung cấp ít nhất một trường cần cập nhật.",
          });
        }

        // Kiểm tra địa danh có tồn tại không
        const existingSite = await storage.getHistoricalSiteById(parseInt(id));
        if (!existingSite) {
          return res.status(404).json({
            success: false,
            message: "Không tìm thấy địa danh lịch sử.",
          });
        }

        // Kiểm tra hình ảnh cũ
        const oldImageUrl = existingSite.imageUrl;

        // Xóa hình ảnh cũ nếu có hình ảnh mới và khác với hình ảnh cũ
        if (
          siteData.imageUrl &&
          oldImageUrl &&
          siteData.imageUrl !== oldImageUrl
        ) {
          // Bỏ qua URL bên ngoài (không phải /uploads/)
          if (oldImageUrl.startsWith("/uploads/")) {
            deleteFile(oldImageUrl);
            console.log(`Xóa hình ảnh cũ của địa danh: ${oldImageUrl}`);
          }
        }

        const updatedSite = await storage.updateHistoricalSite(
          parseInt(id),
          siteData,
        );

        return res.status(200).json({
          success: true,
          message: "Cập nhật địa danh lịch sử thành công.",
          data: updatedSite,
        });
      } catch (error) {
        console.error("Error updating historical site:", error);
        return res.status(500).json({
          success: false,
          message: "Lỗi khi cập nhật địa danh lịch sử.",
        });
      }
    },
  );

  // Xóa địa danh lịch sử
  app.delete(
    `${apiPrefix}/admin/historical-sites/:id`,
    requireAuth,
    requireSitesPermission,
    async (req, res) => {
      try {
        const { id } = req.params;

        // Kiểm tra địa danh có tồn tại không
        const existingSite = await storage.getHistoricalSiteById(parseInt(id));
        if (!existingSite) {
          return res.status(404).json({
            success: false,
            message: "Không tìm thấy địa danh lịch sử.",
          });
        }

        // Lấy đường dẫn hình ảnh nếu có
        const oldImageUrl = existingSite.imageUrl;

        await storage.deleteHistoricalSite(parseInt(id));

        // Xóa hình ảnh nếu có
        if (oldImageUrl && oldImageUrl.startsWith("/uploads/")) {
          deleteFile(oldImageUrl);
          console.log(`Xóa hình ảnh của địa danh: ${oldImageUrl}`);
        }

        return res.status(200).json({
          success: true,
          message: "Xóa địa danh lịch sử thành công.",
        });
      } catch (error) {
        console.error("Error deleting historical site:", error);
        return res.status(500).json({
          success: false,
          message: "Lỗi khi xóa địa danh lịch sử.",
        });
      }
    },
  );

  // Sắp xếp lại thứ tự địa danh lịch sử
  app.post(
    `${apiPrefix}/admin/historical-sites/reorder`,
    requireAuth,
    requireSitesPermission,
    async (req, res) => {
      try {
        const { orderedIds } = req.body;

        if (!Array.isArray(orderedIds)) {
          return res.status(400).json({
            success: false,
            message: "Sai định dạng dữ liệu. Cần cung cấp mảng ID.",
          });
        }

        const success = await storage.reorderHistoricalSites(orderedIds);

        if (!success) {
          return res.status(400).json({
            success: false,
            message: "Không thể sắp xếp lại thứ tự.",
          });
        }

        return res.status(200).json({
          success: true,
          message: "Cập nhật thứ tự hiển thị thành công.",
        });
      } catch (error) {
        console.error("Error reordering historical sites:", error);
        return res.status(500).json({
          success: false,
          message: "Lỗi khi cập nhật thứ tự hiển thị.",
        });
      }
    },
  );

  // API upload hình ảnh
  // Cấu hình lưu trữ cho hình ảnh sự kiện
  const eventImageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      const dir = path.join(uploadsDir, "events");
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      cb(null, dir);
    },
    filename: function (req, file, cb) {
      const uniquePrefix = randomUUID();
      const ext = path.extname(file.originalname);
      cb(null, uniquePrefix + ext);
    },
  });

  const uploadEventImage = multer({
    storage: eventImageStorage,
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB
    },
    fileFilter: function (req, file, cb) {
      const filetypes = /jpeg|jpg|png|gif|webp/;
      const mimetype = filetypes.test(file.mimetype);
      const extname = filetypes.test(
        path.extname(file.originalname).toLowerCase(),
      );

      if (mimetype && extname) {
        return cb(null, true);
      }
      cb(
        new Error("Chỉ chấp nhận tập tin hình ảnh (jpeg, jpg, png, gif, webp)"),
      );
    },
  });

  // Cấu hình lưu trữ cho hình ảnh nhân vật
  const figureImageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      const dir = path.join(uploadsDir, "figures");
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      cb(null, dir);
    },
    filename: function (req, file, cb) {
      const uniquePrefix = randomUUID();
      const ext = path.extname(file.originalname);
      cb(null, uniquePrefix + ext);
    },
  });

  const uploadFigureImage = multer({
    storage: figureImageStorage,
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB
    },
    fileFilter: function (req, file, cb) {
      const filetypes = /jpeg|jpg|png|gif|webp/;
      const mimetype = filetypes.test(file.mimetype);
      const extname = filetypes.test(
        path.extname(file.originalname).toLowerCase(),
      );

      if (mimetype && extname) {
        return cb(null, true);
      }
      cb(
        new Error("Chỉ chấp nhận tập tin hình ảnh (jpeg, jpg, png, gif, webp)"),
      );
    },
  });

  // Cấu hình lưu trữ cho hình ảnh địa danh
  const siteImageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      const dir = path.join(uploadsDir, "sites");
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      cb(null, dir);
    },
    filename: function (req, file, cb) {
      const uniquePrefix = randomUUID();
      const ext = path.extname(file.originalname);
      cb(null, uniquePrefix + ext);
    },
  });

  const uploadSiteImage = multer({
    storage: siteImageStorage,
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB
    },
    fileFilter: function (req, file, cb) {
      const filetypes = /jpeg|jpg|png|gif|webp/;
      const mimetype = filetypes.test(file.mimetype);
      const extname = filetypes.test(
        path.extname(file.originalname).toLowerCase(),
      );

      if (mimetype && extname) {
        return cb(null, true);
      }
      cb(
        new Error("Chỉ chấp nhận tập tin hình ảnh (jpeg, jpg, png, gif, webp)"),
      );
    },
  });

  // Cấu hình lưu trữ cho hình ảnh nền
  const backgroundImageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      const dir = path.join(uploadsDir, "backgrounds");
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      cb(null, dir);
    },
    filename: function (req, file, cb) {
      const uniquePrefix = randomUUID();
      const ext = path.extname(file.originalname);
      cb(null, uniquePrefix + ext);
    },
  });

  const uploadBackgroundImage = multer({
    storage: backgroundImageStorage,
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB
    },
    fileFilter: function (req, file, cb) {
      const filetypes = /jpeg|jpg|png|gif|webp/;
      const mimetype = filetypes.test(file.mimetype);
      const extname = filetypes.test(
        path.extname(file.originalname).toLowerCase(),
      );

      if (mimetype && extname) {
        return cb(null, true);
      }
      cb(
        new Error("Chỉ chấp nhận tập tin hình ảnh (jpeg, jpg, png, gif, webp)"),
      );
    },
  });

  // API endpoint tải lên hình ảnh sự kiện
  app.post(
    `${apiPrefix}/upload/events`,
    uploadEventImage.single("file"),
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
        console.error("Error uploading event image:", error);
        res.status(500).json({
          success: false,
          message: "Lỗi khi tải lên hình ảnh",
        });
      }
    },
  );

  // API endpoint tải lên hình ảnh nhân vật
  app.post(
    `${apiPrefix}/upload/figures`,
    uploadFigureImage.single("file"),
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
        console.error("Error uploading figure image:", error);
        res.status(500).json({
          success: false,
          message: "Lỗi khi tải lên hình ảnh",
        });
      }
    },
  );

  // API endpoint tải lên hình ảnh địa danh
  app.post(
    `${apiPrefix}/upload/sites`,
    uploadSiteImage.single("file"),
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
        console.error("Error uploading site image:", error);
        res.status(500).json({
          success: false,
          message: "Lỗi khi tải lên hình ảnh",
        });
      }
    },
  );

  // API endpoint tải lên hình ảnh nền
  app.post(
    `${apiPrefix}/upload/backgrounds`,
    uploadBackgroundImage.single("file"),
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
        console.error("Error uploading background image:", error);
        res.status(500).json({
          success: false,
          message: "Lỗi khi tải lên hình ảnh",
        });
      }
    },
  );

  // API quản lý người dùng
  app.get(
    `${apiPrefix}/admin/users`,
    requireAuth,
    requireAdmin,
    async (req, res) => {
      try {
        const users = await storage.getAllUsers();
        res.json(users);
      } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ success: false, message: "Lỗi khi lấy danh sách người dùng" });
      }
    }
  );
  
  app.post(
    `${apiPrefix}/admin/users`,
    requireAuth,
    async (req, res) => {
      // Check if user is admin
      if (!req.user?.isAdmin) {
        return res.status(403).json({ error: "Chỉ quản trị viên mới có thể thêm người dùng mới" });
      }
      try {
        const { 
          username, 
          password, 
          fullName, 
          email, 
          isAdmin, 
          isActive,
          canManagePeriods,
          canManageEvents,
          canManageFigures,
          canManageSites 
        } = req.body;
        
        // Kiểm tra xem username đã tồn tại hay chưa
        const existingUser = await storage.getUserByUsername(username);
        if (existingUser) {
          return res.status(400).json({ 
            success: false, 
            message: "Tên người dùng đã tồn tại" 
          });
        }
        
        // Mã hóa mật khẩu
        const hashedPassword = await storage.hashPassword(password);
        
        // Tạo người dùng mới
        const newUser = await storage.createUser({
          username,
          password: hashedPassword,
          fullName,
          email,
          isAdmin: Boolean(isAdmin),
          isActive: Boolean(isActive),
          canManagePeriods: Boolean(canManagePeriods),
          canManageEvents: Boolean(canManageEvents),
          canManageFigures: Boolean(canManageFigures),
          canManageSites: Boolean(canManageSites)
        });
        
        // Gán vai trò
        if (isAdmin) {
          await storage.assignUserRole(newUser.id, 1); // Admin role
        } else {
          await storage.assignUserRole(newUser.id, 2); // Editor role
        }
        
        res.status(201).json({ 
          success: true, 
          message: "Tạo người dùng thành công", 
          user: newUser 
        });
      } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ success: false, message: "Lỗi khi tạo người dùng mới" });
      }
    }
  );
  
  app.put(
    `${apiPrefix}/admin/users/:id`,
    requireAuth,
    requireAdmin,
    async (req, res) => {
      try {
        const userId = parseInt(req.params.id);
        const { 
          fullName, 
          email, 
          isAdmin, 
          isActive,
          canManagePeriods,
          canManageEvents,
          canManageFigures,
          canManageSites 
        } = req.body;
        
        // Kiểm tra xem người dùng có tồn tại không
        const existingUser = await storage.getUserById(userId);
        if (!existingUser) {
          return res.status(404).json({ 
            success: false, 
            message: "Không tìm thấy người dùng" 
          });
        }
        
        // Cập nhật thông tin người dùng
        const updatedUser = await storage.updateUser(userId, {
          fullName,
          email,
          isAdmin: Boolean(isAdmin),
          isActive: Boolean(isActive),
          canManagePeriods: Boolean(canManagePeriods),
          canManageEvents: Boolean(canManageEvents),
          canManageFigures: Boolean(canManageFigures),
          canManageSites: Boolean(canManageSites)
        });
        
        // Cập nhật vai trò
        if (isAdmin !== existingUser.isAdmin) {
          if (isAdmin) {
            await storage.assignUserRole(userId, 1); // Admin role
          } else {
            await storage.assignUserRole(userId, 2); // Editor role
          }
        }
        
        res.json({ 
          success: true, 
          message: "Cập nhật người dùng thành công", 
          user: updatedUser 
        });
      } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ success: false, message: "Lỗi khi cập nhật người dùng" });
      }
    }
  );
  
  app.delete(
    `${apiPrefix}/admin/users/:id`,
    requireAuth,
    requireAdmin,
    async (req, res) => {
      try {
        const userId = parseInt(req.params.id);
        
        // Kiểm tra xem người dùng có tồn tại không
        const existingUser = await storage.getUserById(userId);
        if (!existingUser) {
          return res.status(404).json({ 
            success: false, 
            message: "Không tìm thấy người dùng" 
          });
        }
        
        // Ngăn chặn xóa tài khoản admin chính
        if (userId === 1) {
          return res.status(403).json({ 
            success: false, 
            message: "Không thể xóa tài khoản admin chính" 
          });
        }
        
        // Xóa người dùng
        await storage.deleteUser(userId);
        
        res.json({ 
          success: true, 
          message: "Xóa người dùng thành công" 
        });
      } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ success: false, message: "Lỗi khi xóa người dùng" });
      }
    }
  );
  
  app.post(
    `${apiPrefix}/admin/users/:id/reset-password`,
    requireAuth,
    requireAdmin,
    async (req, res) => {
      try {
        const userId = parseInt(req.params.id);
        const { newPassword } = req.body;
        
        if (!newPassword || newPassword.length < 6) {
          return res.status(400).json({ 
            success: false, 
            message: "Mật khẩu phải có ít nhất 6 ký tự" 
          });
        }
        
        // Kiểm tra xem người dùng có tồn tại không
        const existingUser = await storage.getUserById(userId);
        if (!existingUser) {
          return res.status(404).json({ 
            success: false, 
            message: "Không tìm thấy người dùng" 
          });
        }
        
        // Mã hóa mật khẩu mới
        const hashedPassword = await storage.hashPassword(newPassword);
        
        // Cập nhật mật khẩu
        await storage.updateUserPassword(userId, hashedPassword);
        
        res.json({ 
          success: true, 
          message: "Đặt lại mật khẩu thành công" 
        });
      } catch (error) {
        console.error("Error resetting password:", error);
        res.status(500).json({ success: false, message: "Lỗi khi đặt lại mật khẩu" });
      }
    }
  );
  
  // API quản lý feedback
  app.get(
    `${apiPrefix}/admin/feedback`,
    requireAuth,
    requireAdmin,
    async (req, res) => {
      try {
        const feedbacks = await storage.getAllFeedback();
        res.json(feedbacks);
      } catch (error) {
        console.error("Error fetching feedback for admin:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    },
  );

  app.put(
    `${apiPrefix}/admin/feedback/:id`,
    requireAuth,
    requireAdmin,
    async (req, res) => {
      try {
        const feedbackId = parseInt(req.params.id);
        const { resolved, response } = req.body;

        if (resolved === undefined) {
          return res.status(400).json({
            success: false,
            message: "Thiếu trạng thái xử lý",
          });
        }

        const updatedFeedback = await storage.updateFeedbackStatus(
          feedbackId,
          resolved,
          response,
        );

        if (!updatedFeedback) {
          return res.status(404).json({
            success: false,
            message: "Không tìm thấy phản hồi",
          });
        }

        res.json({
          success: true,
          message: "Cập nhật trạng thái phản hồi thành công",
          feedback: updatedFeedback,
        });
      } catch (error) {
        console.error("Error updating feedback status:", error);
        res.status(500).json({
          success: false,
          message: "Lỗi khi cập nhật trạng thái phản hồi",
        });
      }
    },
  );

  // Thêm middleware để phát hiện crawler/bot và phục vụ đúng nội dung SEO
  app.use((req, res, next) => {
    const userAgent = req.headers["user-agent"] || "";
    const url = req.originalUrl;

    // Kiểm tra nếu là bot của Facebook, Google, Twitter, hoặc các crawler khác
    const isCrawler =
      /facebookexternalhit|Facebot|Twitterbot|Pinterest|Google.*snippet|Googlebot|bingbot|linkedinbot|WhatsApp|preview/i.test(
        userAgent,
      );

    // Kiểm tra các đường dẫn chi tiết cần phục vụ SEO
    const needsSeoContent =
      url.startsWith("/su-kien/") ||
      url.startsWith("/nhan-vat/") ||
      url.startsWith("/di-tich/") ||
      url.startsWith("/thoi-ky/");

    if (isCrawler && needsSeoContent) {
      // Sử dụng hàm generateSocialShareHTML đã tạo trước đó
      const fullUrl = `https://${req.get("host")}${url}`;
      return generateSocialShareHTML(req, res, fullUrl);
    }

    next();
  });

  // Giữ lại endpoint riêng cho các công cụ testing
  app.get(`/seo-preview`, (req, res) =>
    generateSocialShareHTML(req, res, req.query.url as string),
  );

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
