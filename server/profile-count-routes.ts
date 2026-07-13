import type { Express, Request, Response } from "express";
import { storage } from "./storage";
import { serviceCategories } from "@shared/schema";

export function setupProfileCountRoutes(app: Express) {
  app.get("/api/profile-counts", async (_req: Request, res: Response) => {
    try {
      const countEntries = await Promise.all(
        serviceCategories.map(async (service) => {
          const result = await storage.searchProfiles({
            service,
            page: 1,
            pageSize: 1,
          });

          return [service, result.total] as const;
        }),
      );

      const allProfiles = await storage.searchProfiles({
        page: 1,
        pageSize: 1,
      });

      const counts: Record<string, number> = Object.fromEntries(countEntries);

      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      res.json({
        counts,
        totalProfiles: allProfiles.total,
        generatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Fehler beim Ermitteln der Profilanzahlen:", error);
      res.status(500).json({ message: "Profilanzahlen konnten nicht geladen werden" });
    }
  });
}
