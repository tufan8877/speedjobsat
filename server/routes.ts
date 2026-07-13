import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { setupJobRoutes } from "./job-routes";
import { setupFavoritesRoutes } from "./favorites-routes";
import { setupProfileRoutes } from "./profile-routes";
import { setupProfileCountRoutes } from "./profile-count-routes";
import { setupProfileViewRoutes } from "./profile-view-routes";
import { setupProfileVerificationRoutes } from "./profile-verification-routes";
import { setupProfileGalleryRoutes } from "./profile-gallery-routes";
import { setupAdmin } from "./admin";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);
  setupJobRoutes(app);
  setupFavoritesRoutes(app);
  setupProfileRoutes(app);
  setupProfileCountRoutes(app);
  setupProfileViewRoutes(app);
  setupProfileVerificationRoutes(app);
  setupProfileGalleryRoutes(app);
  setupAdmin(app);

  const httpServer = createServer(app);
  return httpServer;
}
