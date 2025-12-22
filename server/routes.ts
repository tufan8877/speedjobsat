import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupSqliteAuth } from "./sqlite-auth";
import { setupJobRoutes } from "./job-routes";
import { setupFavoritesRoutes } from "./favorites-routes";
import { setupProfileRoutes } from "./profile-routes";
import { setupAdmin } from "./admin";

export async function registerRoutes(app: Express): Promise<Server> {
  // SQLite Auth-System einrichten
  setupSqliteAuth(app);
  
  // Alle API-Routen einrichten
  setupJobRoutes(app);
  setupFavoritesRoutes(app);
  setupProfileRoutes(app);
  setupAdmin(app);

  const httpServer = createServer(app);
  return httpServer;
}