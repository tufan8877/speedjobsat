// app/server/db.ts
import * as pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Please add it in Render Environment Variables.");
}

const isProd = process.env.NODE_ENV === "production";

// Render/Postgres (und viele Managed Postgres) brauchen in Production oft SSL.
// rejectUnauthorized:false ist üblich bei Managed DBs, die kein vollständiges CA-Bundle liefern.
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isProd ? { rejectUnauthorized: false } : undefined,
  max: Number(process.env.PG_POOL_MAX ?? 5),
});

export const db = drizzle(pool);
