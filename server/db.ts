// server/db.ts
import pkg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

const { Pool } = pkg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not set. Set it in Render Environment Variables (Postgres connection string)."
  );
}

const isProd = process.env.NODE_ENV === "production";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isProd ? { rejectUnauthorized: false } : undefined,
  max: Number(process.env.PG_POOL_MAX ?? 5),
});

export const db = drizzle(pool);
