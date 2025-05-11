import pkg from "pg";
const { Pool } = pkg;
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";
import dotenv from "dotenv";

dotenv.config();

console.log(
  "Kiểm tra DATABASE_URL:",
  process.env.DATABASE_URL ? "tồn tại" : "không tồn tại"
);

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL chưa được cấu hình trong biến môi trường.");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // CHẤP NHẬN chứng chỉ tự ký
  },
});

const db = drizzle(pool, { schema });
console.log("Đã cấu hình kết nối cơ sở dữ liệu");

export { pool, db };

