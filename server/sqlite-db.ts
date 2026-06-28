// Kompatibilität für alte Imports.
// SpeedJobs verwendet jetzt ausschließlich Postgres über server/db.ts.
export { db as sqliteDb } from "./db";

export async function initializeSqliteDb() {
  // Absichtlich leer: Tabellen werden über Drizzle/Postgres verwaltet.
}
