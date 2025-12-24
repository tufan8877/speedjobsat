// server/db.ts
import pg from "pg";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";

const { Pool } = pg;

const isProd = process.env.NODE_ENV === "production";

/**
 * Postgres ist optional:
 * - Wenn DATABASE_URL gesetzt ist -> Postgres Pool + drizzle (node-postgres)
 * - Wenn nicht -> exportieren wir db = null und lassen den Rest deiner App SQLite nutzen.
 *
 * WICHTIG: Dein Code muss SQLite an anderer Stelle initialisieren (hast du laut Log).
 */
export const pool =
  process.env.DATABASE_URL
    ? new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: isProd ? { rejectUnauthorized: false } : undefined,
        max: Number(process.env.PG_POOL_MAX ?? 5),
      })
    : null;

export const db = pool ? drizzlePg(pool) : null;
