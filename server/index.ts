import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { storage } from "./storage";
import path from "path";
import session from "express-session";
import passport from "passport";
import connectPgSimple from "connect-pg-simple";
import { pool } from "@db";
import compression from "compression";

const app = express();

// Sử dụng middleware nén (compression) để giảm kích thước response
app.use(compression());

// Đảm bảo các file JavaScript module được phục vụ với MIME type đúng
app.use((req, res, next) => {
  const url = req.url;
  
  // Xử lý các file JavaScript modules
  if (url.includes('/src/') && 
      (url.endsWith('.js') || url.endsWith('.mjs') || url.match(/\.js\?v=.*$/))) {
    res.setHeader('Content-Type', 'text/javascript; charset=utf-8');
  }
  
  // Xử lý các file TypeScript và JSX/TSX
  if (url.includes('/src/') && 
      (url.endsWith('.ts') || url.endsWith('.tsx') || url.endsWith('.jsx') || 
      url.match(/\.tsx\?v=.*$/) || url.match(/\.ts\?v=.*$/))) {
    res.setHeader('Content-Type', 'text/javascript; charset=utf-8');
  }
  
  next();
});

// Middleware đếm lượt truy cập website
app.use(async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Bỏ qua các request từ admin, API, và các static assets
    if (
      req.path.startsWith('/api/') || 
      req.path.startsWith('/admin') || 
      req.path.includes('.') ||
      req.path.startsWith('/assets/')
    ) {
      return next();
    }
    
    // Chỉ đếm yêu cầu GET cho các trang chính
    if (req.method === 'GET') {
      // Lấy giá trị hiện tại từ cơ sở dữ liệu
      const totalViewsSetting = await storage.getSetting('total_views');
      if (totalViewsSetting) {
        // Tăng giá trị lên 1 và cập nhật vào cơ sở dữ liệu
        const currentCount = parseInt(totalViewsSetting.value || '0', 10);
        const newCount = currentCount + 1;
        await storage.updateSetting('total_views', newCount.toString());
      }
    }
  } catch (error) {
    console.error('Lỗi khi đếm lượt truy cập:', error);
  }
  
  next();
});

// Middleware để thêm cache control headers
app.use((req, res, next) => {
  // Không cache cho các route API yêu cầu xác thực
  if (req.path.startsWith("/api/auth") || req.path.includes("/admin")) {
    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate",
    );
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
  }
  // Cache cho các nội dung tĩnh và API công khai
  else if (req.path.startsWith("/api") || req.path.startsWith("/assets")) {
    // Cache trong 5 phút
    res.setHeader("Cache-Control", "public, max-age=300");
  }
  next();
});

// Tăng giới hạn kích thước của request lên 50MB
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: false, limit: "50mb" }));

// Cấu hình session store với PostgreSQL
const PgSessionStore = connectPgSimple(session);
const oneDay = 1000 * 60 * 60 * 24;

app.use(
  session({
    store: new PgSessionStore({
      pool,
      tableName: "session", // Bảng lưu trữ session
      createTableIfMissing: true, // Tự động tạo bảng nếu chưa có
    }),
    secret: process.env.SESSION_SECRET || "lichsuvietnam-session-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: oneDay,
    },
  }),
);

// Khởi tạo Passport.js
app.use(passport.initialize());
app.use(passport.session());

// Cấu hình Passport
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await storage.getUserById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Phục vụ thư mục uploads dưới dạng static files
//app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Khởi tạo các thiết lập mặc định
  try {
    log("Initializing default settings...");
    await storage.initializeDefaultSettings();
    log("Default settings initialized successfully!");
    
    // Kiểm tra cài đặt tự động cập nhật sitemap
    const autoUpdateSitemap = await storage.getSetting('sitemap_auto_update');
    if (autoUpdateSitemap?.value === 'true') {
      try {
        const { generateSitemap } = await import('./sitemap-generator');
        await generateSitemap();
        log("Sitemap.xml auto-generated at startup");
        
        // Cập nhật thời gian cập nhật sitemap
        await storage.updateSetting('last_sitemap_update', new Date().toISOString());
      } catch (sitemapError) {
        console.error("Error auto-generating sitemap:", sitemapError);
      }
    }
  } catch (error) {
    console.error("Error initializing default settings:", error);
  }

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();
