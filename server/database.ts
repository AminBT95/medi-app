import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../shared/schema.js";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });

// Test database connection
export async function testConnection() {
  try {
    const client = await pool.connect();
    console.log("✅ Database connected successfully");
    client.release();
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    return false;
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  await pool.end();
  console.log("Database connection pool closed");
});

process.on('SIGINT', async () => {
  await pool.end();
  console.log("Database connection pool closed");
});