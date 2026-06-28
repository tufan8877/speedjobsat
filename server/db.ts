import pg from "pg";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL fehlt. SpeedJobs verwendet jetzt ausschließlich Postgres.");
}

const isProd = process.env.NODE_ENV === "production";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isProd ? { rejectUnauthorized: false } : undefined,
  max: Number(process.env.PG_POOL_MAX ?? 5),
});

export const db = drizzlePg(pool, { schema });
