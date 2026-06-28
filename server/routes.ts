import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { setupJobRoutes } from "./job-routes";
import { setupFavoritesRoutes } from "./favorites-routes";
import { setupProfileRoutes } from "./profile-routes";
import { setupAdmin } from "./admin";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);
  setupJobRoutes(app);
  setupFavoritesRoutes(app);
  setupProfileRoutes(app);
  setupAdmin(app);

  const httpServer = createServer(app);
  return httpServer;
}
