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
import { generateSitemap } from "./sitemap-generator";

const app = express();

// Sử dụng middleware nén (compression) để giảm kích thước response
app.use(compression());

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

// Middleware để đếm lượt truy cập
app.use(async (req, res, next) => {
  // Chỉ đếm cho các request GET không phải API và không phải assets/static files
  if (
    req.method === 'GET' && 
    !req.path.startsWith('/api') && 
    !req.path.startsWith('/assets') && 
    !req.path.startsWith('/uploads') && 
    !req.path.includes('.') && 
    req.path !== '/favicon.ico' &&
    !req.path.startsWith('/admin')
  ) {
    // Kiểm tra xem session đã có visit_counted chưa để tránh đếm trùng
    const session = req.session as any;
    const now = new Date();
    
    // Nếu chưa đếm hoặc đã quá 30 phút kể từ lần đếm trước đó
    if (!session.visit_counted || 
        (now.getTime() - new Date(session.visit_counted).getTime() > 30 * 60 * 1000)) {
      await storage.incrementVisitCount();
      session.visit_counted = now;
    }
  }
  next();
});

// Middleware để ghi log và bắt response
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
  // Sẽ xử lý lỗi ở từng route cụ thể thay vì dùng middleware chung

  try {
    log("Initializing default settings...");
    await storage.initializeDefaultSettings();
    log("Default settings initialized successfully!");
    
    // Tạo sitemap và robots.txt
    log("Generating sitemap and robots.txt...");
    await generateSitemap();
    log("Sitemap and robots.txt generated successfully!");
  } catch (error) {
    console.error("Error in initialization:", error);
  }

  const server = await registerRoutes(app);

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  // Luôn chạy ở chế độ development trên Replit
  await setupVite(app, server);

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
