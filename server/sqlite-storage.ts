// Kompatibilität für alte Imports.
// SpeedJobs verwendet jetzt ausschließlich Postgres über server/storage.ts.
export { storage as sqliteStorage } from "./storage";
export type { IStorage } from "./storage";
