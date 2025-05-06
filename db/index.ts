import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";
import dotenv from "dotenv";

// Load biến môi trường từ file .env
dotenv.config();

console.log(
  "Kiểm tra DATABASE_URL:",
  process.env.DATABASE_URL ? "tồn tại" : "không tồn tại",
);

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL chưa được cấu hình trong biến môi trường. Vui lòng kiểm tra file .env của bạn.",
  );
}

// Cấu hình kết nối database local PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false, // hoặc thêm { rejectUnauthorized: false } nếu cần cấu hình SSL riêng
});

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: false });
const db = drizzle(pool, { schema });

console.log("Đã cấu hình kết nối cơ sở dữ liệu");

export { pool, db };
