import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL muss gesetzt sein. Haben Sie vergessen, eine Datenbank bereitzustellen?",
  );
}

// Render Postgres (und viele andere Provider) verlangen in Produktion SSL.
// Render stellt die CA nicht als File bereit, daher: rejectUnauthorized=false.
// (Für lokale Entwicklung bleibt SSL aus.)
const ssl =
  process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl,
});

export const db = drizzle({ client: pool, schema });
