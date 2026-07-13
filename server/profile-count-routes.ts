import type { Express, Request, Response } from "express";
import { storage } from "./storage";
import { serviceCategories } from "@shared/schema";

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean);

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.map(String).map((item) => item.trim()).filter(Boolean);
      }
    } catch {
      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return [];
}

export function setupProfileCountRoutes(app: Express) {
  app.get("/api/profile-counts", async (_req: Request, res: Response) => {
    try {
      const profiles = await storage.getAllProfiles();
      const counts: Record<string, number> = Object.fromEntries(
        serviceCategories.map((service) => [service, 0]),
      );

      for (const profile of profiles) {
        const uniqueServices = new Set(toStringArray(profile.services));

        for (const service of uniqueServices) {
          if (Object.prototype.hasOwnProperty.call(counts, service)) {
            counts[service] += 1;
          }
        }
      }

      res.setHeader("Cache-Control", "no-store");
      res.json({ counts, totalProfiles: profiles.length });
    } catch (error) {
      console.error("Fehler beim Ermitteln der Profilanzahlen:", error);
      res.status(500).json({ message: "Profilanzahlen konnten nicht geladen werden" });
    }
  });
}
