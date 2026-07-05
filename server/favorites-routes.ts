import { Express, Request, Response } from "express";
import { isAuthenticated } from "./auth";
import { storage } from "./storage";

function normalizeProfile(profile: any) {
  const toArray = (value: unknown): string[] => {
    if (Array.isArray(value)) return value.map(String).filter(Boolean);
    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
      } catch {
        return value
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
      }
    }
    return [];
  };

  return {
    ...profile,
    services: toArray(profile.services),
    regions: toArray(profile.regions),
    availablePeriods: toArray(profile.availablePeriods),
  };
}

export function setupFavoritesRoutes(app: Express) {
  app.post("/api/favorites", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const profileId = Number(req.body?.profileId);

      if (!Number.isFinite(profileId)) {
        return res.status(400).json({ message: "Ungültige Profil-ID" });
      }

      const profile = await storage.getProfile(profileId);
      if (!profile) {
        return res.status(404).json({ message: "Profil nicht gefunden" });
      }

      const existingFavorite = await storage.getFavorite(userId, profileId);
      if (existingFavorite) {
        return res.status(200).json({
          success: true,
          favorite: existingFavorite,
          message: "Dieses Profil ist bereits in Ihren Favoriten",
        });
      }

      const createdFavorite = await storage.createFavorite({ userId, profileId });
      return res.status(201).json({
        success: true,
        favorite: createdFavorite,
        message: "Profil wurde zu Ihren Favoriten hinzugefügt",
      });
    } catch (error) {
      console.error("Fehler beim Hinzufügen des Favoriten:", error);
      res.status(500).json({ message: "Fehler beim Hinzufügen des Favoriten" });
    }
  });

  app.delete("/api/favorites/:profileId", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const profileId = Number(req.params.profileId);

      if (!Number.isFinite(profileId)) {
        return res.status(400).json({ message: "Ungültige Profil-ID" });
      }

      await storage.deleteFavorite(userId, profileId);
      return res.status(200).json({
        success: true,
        message: "Favorit erfolgreich entfernt",
      });
    } catch (error) {
      console.error("Fehler beim Entfernen des Favoriten:", error);
      res.status(500).json({ message: "Fehler beim Entfernen des Favoriten" });
    }
  });

  app.get("/api/favorites", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const userFavorites = await storage.getFavoritesByUserId(userId);

      if (userFavorites.length === 0) {
        return res.json([]);
      }

      const profiles = await Promise.all(
        userFavorites.map(async (favorite) => {
          const profile = await storage.getProfile(favorite.profileId);
          return profile ? normalizeProfile(profile) : null;
        }),
      );

      return res.json(profiles.filter(Boolean));
    } catch (error) {
      console.error("Fehler beim Abrufen der Favoriten:", error);
      res.status(500).json({ message: "Fehler beim Abrufen der Favoriten" });
    }
  });

  app.get("/api/favorites/:profileId", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const profileId = Number(req.params.profileId);

      if (!Number.isFinite(profileId)) {
        return res.status(400).json({ message: "Ungültige Profil-ID" });
      }

      const favorite = await storage.getFavorite(userId, profileId);
      res.json({ isFavorite: !!favorite });
    } catch (error) {
      console.error("Fehler beim Prüfen des Favoriten-Status:", error);
      res.status(500).json({ message: "Fehler beim Prüfen des Favoriten-Status" });
    }
  });
}
