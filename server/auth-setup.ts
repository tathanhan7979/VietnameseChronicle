import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pool } from "@db";
import { comparePasswords, hashPassword } from "./auth";
import { db } from "@db";
import { users, type User } from "@shared/schema";
import { eq } from "drizzle-orm";

declare global {
  namespace Express {
    interface User extends User {}
  }
}

const PostgresSessionStore = connectPgSimple(session);

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "lichsuvietnam-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 ngày
      secure: process.env.NODE_ENV === "production",
    },
    store: new PostgresSessionStore({ 
      pool,
      createTableIfMissing: true,
      tableName: 'session'
    }),
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await db.query.users.findFirst({
          where: eq(users.username, username)
        });
        
        if (!user) {
          return done(null, false, { message: "Tên đăng nhập không tồn tại" });
        }
        
        const isPasswordValid = await comparePasswords(password, user.password);
        if (!isPasswordValid) {
          return done(null, false, { message: "Mật khẩu không chính xác" });
        }
        
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.id, id)
      });
      done(null, user || undefined);
    } catch (error) {
      done(error);
    }
  });

  // API cho việc đăng nhập
  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: Error, user: User, info: { message: string }) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ success: false, message: info.message });
      
      req.login(user, (err) => {
        if (err) return next(err);
        return res.status(200).json({ success: true, user });
      });
    })(req, res, next);
  });

  // API cho việc đăng ký
  app.post("/api/register", async (req, res, next) => {
    try {
      const { username, password, fullName, email } = req.body;
      
      // Kiểm tra username đã tồn tại chưa
      const existingUser = await db.query.users.findFirst({
        where: eq(users.username, username)
      });
      
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          message: "Tên đăng nhập đã tồn tại" 
        });
      }

      // Mã hóa mật khẩu
      const hashedPassword = await hashPassword(password);
      
      // Tạo người dùng mới
      const [newUser] = await db.insert(users).values({
        username,
        password: hashedPassword,
        email,
        fullName,
        role: "user", // Mặc định là người dùng thường
        isActive: true
      }).returning();
      
      // Tự động đăng nhập sau khi đăng ký
      req.login(newUser, (err) => {
        if (err) return next(err);
        return res.status(201).json({ success: true, user: newUser });
      });
    } catch (error) {
      next(error);
    }
  });

  // API cho việc đăng xuất
  app.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) return res.status(500).json({ success: false, message: "Lỗi khi đăng xuất" });
      return res.status(200).json({ success: true, message: "Đăng xuất thành công" });
    });
  });

  // API lấy thông tin người dùng hiện tại
  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ success: false, message: "Chưa đăng nhập" });
    }
    return res.status(200).json(req.user);
  });
}