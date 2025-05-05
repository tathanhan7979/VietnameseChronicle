
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// This is the correct way neon config - DO NOT change this
neonConfig.webSocketConstructor = ws;

console.log('Checking DATABASE_URL:', process.env.DATABASE_URL ? 'exists' : 'missing');

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set in environment variables. Check your .env file.",
  );
}

let pool: Pool;
let db: ReturnType<typeof drizzle>;

try {
  console.log('Attempting to connect to database...');
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle(pool, { schema });
  console.log('Database connection established successfully');
} catch (error) {
  console.error('Failed to connect to database:', error);
  throw error;
}

export { pool, db };
