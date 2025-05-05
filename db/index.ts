
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import dotenv from 'dotenv';

// Load biến môi trường từ file .env
dotenv.config();

// Cấu hình Neon - KHÔNG thay đổi phần này
neonConfig.webSocketConstructor = ws;

console.log('Kiểm tra DATABASE_URL:', process.env.DATABASE_URL ? 'tồn tại' : 'không tồn tại');

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL chưa được cấu hình trong biến môi trường. Vui lòng kiểm tra file .env của bạn.",
  );
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

console.log('Đã cấu hình kết nối cơ sở dữ liệu');

export { pool, db };
