import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema';

// Kiểm tra xem biến môi trường DATABASE_URL có tồn tại không
if (!process.env.DATABASE_URL) {
  console.error('Lỗi: Biến môi trường DATABASE_URL không tồn tại');
  process.exit(1);
}

// Cấu hình kết nối cơ sở dữ liệu
const connectionString = process.env.DATABASE_URL;
const client = postgres(connectionString);
export const db = drizzle(client, { schema });

console.log('Đã cấu hình kết nối cơ sở dữ liệu trong Next.js');