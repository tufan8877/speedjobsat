// server/db.ts
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not set. Please set it in Render Environment Variables (Postgres connection string)."
  );
}

const isProd = process.env.NODE_ENV === "production";

// Pool für Render/Postgres (SSL in Prod oft nötig)
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isProd ? { rejectUnauthorized: false } : undefined,
  max: Number(process.env.PG_POOL_MAX ?? 5),
});

export const db = drizzle(pool);
