import { Express, Request, Response } from "express";
import { storage } from "./storage";
import { isAuthenticated } from "./auth";
import { requireEmailVerified } from "./email-verification-routes";

function toStringArray(value: unknown): string[] {
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
}

function oneStringArray(value: unknown): string[] {
  const values = toStringArray(value);
  return values.length > 0 ? [values[0]] : [];
}

function getRegisteredEmail(req: Request): string {
  return String((req.user as any)?.email || "").trim().toLowerCase();
}

function normalizeProfilePayload(body: any, userId?: number, registeredEmail?: string) {
  const payload: any = {
    firstName: body?.firstName ?? null,
    lastName: body?.lastName ?? null,
    description: body?.description ?? null,
    services: oneStringArray(body?.services),
    customServices: body?.customServices ?? null,
    regions: toStringArray(body?.regions),
    phoneNumber: null,
    email: registeredEmail || null,
    socialMedia: null,
    availablePeriods: toStringArray(body?.availablePeriods),
    isAvailable: typeof body?.isAvailable === "boolean" ? body.isAvailable : true,
    profileImage: body?.profileImage ?? null,
  };

  if (typeof userId === "number") {
    payload.userId = userId;
  }

  return payload;
}

function responseProfile(profile: any, reviews?: any[]) {
  return {
    ...profile,
    services: oneStringArray(profile.services),
    regions: toStringArray(profile.regions),
    availablePeriods: toStringArray(profile.availablePeriods),
    ...(reviews ? { reviews } : {}),
  };
}

export function setupProfileRoutes(app: Express) {
  app.get("/api/my-profile", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const profile = await storage.getProfileByUserId(userId);

      if (!profile) {
        return res.status(404).json({ message: "Profil nicht gefunden" });
      }

      res.json(responseProfile(profile));
    } catch (error) {
      console.error("Fehler beim Abrufen des Profils:", error);
      res.status(500).json({ message: "Serverfehler beim Abrufen des Profils" });
    }
  });

  app.put("/api/my-profile", isAuthenticated, requireEmailVerified, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const registeredEmail = getRegisteredEmail(req);

      if (!registeredEmail) {
        return res.status(400).json({ message: "Keine registrierte E-Mail-Adresse im Benutzerkonto gefunden" });
      }

      const profileData = normalizeProfilePayload(req.body, userId, registeredEmail);

      if (!profileData.services || profileData.services.length !== 1) {
        return res.status(400).json({ message: "Pro Profil ist genau eine Dienstleistung erlaubt" });
      }

      const existingProfile = await storage.getProfileByUserId(userId);

      if (existingProfile) {
        const updatedProfile = await storage.updateProfile(existingProfile.id, profileData);

        if (!updatedProfile) {
          return res.status(500).json({ message: "Fehler beim Aktualisieren des Profils" });
        }

        return res.json(responseProfile(updatedProfile));
      }

      const newProfile = await storage.createProfile(profileData);
      return res.status(201).json(responseProfile(newProfile));
    } catch (error) {
      console.error("Fehler beim Speichern des Profils:", error);
      res.status(500).json({ message: "Serverfehler beim Speichern des Profils" });
    }
  });

  app.get("/api/profiles", async (req: Request, res: Response) => {
    try {
      const { service, region, name, sort, page, pageSize } = req.query;

      const result = await storage.searchProfiles({
        service: service as string,
        region: region as string,
        name: name as string,
        sort: sort as "rating" | "newest",
        page: page ? Number(page) : undefined,
        pageSize: pageSize ? Number(pageSize) : undefined,
      });

      const profilesWithReviews = await Promise.all(
        result.profiles.map(async (profile) => {
          const reviews = await storage.getReviewsByProfileId(profile.id);
          return responseProfile(profile, reviews || []);
        }),
      );

      res.json({ profiles: profilesWithReviews, total: result.total });
    } catch (error) {
      console.error("Fehler beim Abrufen der Profile:", error);
      res.status(500).json({ message: "Serverfehler beim Abrufen der Profile" });
    }
  });

  app.get("/api/profiles/:id", async (req: Request, res: Response) => {
    try {
      const profileId = Number(req.params.id);
      if (!Number.isFinite(profileId)) {
        return res.status(400).json({ message: "Ungültige Profil-ID" });
      }

      const profile = await storage.getProfile(profileId);
      if (!profile) {
        return res.status(404).json({ message: "Profil nicht gefunden" });
      }

      const reviews = await storage.getReviewsByProfileId(profileId);
      res.json(responseProfile(profile, reviews || []));
    } catch (error) {
      console.error("Fehler beim Abrufen des Profils:", error);
      res.status(500).json({ message: "Serverfehler beim Abrufen des Profils" });
    }
  });

  app.delete("/api/my-profile", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const profile = await storage.getProfileByUserId(userId);

      if (!profile) {
        return res.status(404).json({ message: "Profil nicht gefunden" });
      }

      const deleted = await storage.deleteProfile(profile.id);
      if (!deleted) {
        return res.status(500).json({ message: "Fehler beim Löschen des Profils" });
      }

      res.json({ message: "Profil erfolgreich gelöscht" });
    } catch (error) {
      console.error("Fehler beim Löschen des Profils:", error);
      res.status(500).json({ message: "Serverfehler beim Löschen des Profils" });
    }
  });

  app.get("/api/profiles/:id/reviews", async (req: Request, res: Response) => {
    try {
      const profileId = Number(req.params.id);
      if (!Number.isFinite(profileId)) {
        return res.status(400).json({ message: "Ungültige Profil-ID" });
      }

      const reviews = await storage.getReviewsByProfileId(profileId);
      res.json(reviews);
    } catch (error) {
      console.error("Fehler beim Abrufen der Bewertungen:", error);
      res.status(500).json({ message: "Serverfehler beim Abrufen der Bewertungen" });
    }
  });

  app.post("/api/profiles/:id/reviews", isAuthenticated, requireEmailVerified, async (req: Request, res: Response) => {
    try {
      const profileId = Number(req.params.id);
      if (!Number.isFinite(profileId)) {
        return res.status(400).json({ message: "Ungültige Profil-ID" });
      }

      const userId = req.user!.id;
      const rating = Number(req.body?.rating);
      const comment = String(req.body?.comment || "").trim();

      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Bewertung muss zwischen 1 und 5 Sternen liegen" });
      }

      if (comment.length < 10) {
        return res.status(400).json({ message: "Kommentar muss mindestens 10 Zeichen lang sein" });
      }

      const profile = await storage.getProfile(profileId);
      if (!profile) {
        return res.status(404).json({ message: "Profil nicht gefunden" });
      }

      if (profile.userId === userId) {
        return res.status(400).json({ message: "Sie können Ihr eigenes Profil nicht bewerten" });
      }

      const review = await storage.createReview({ userId, profileId, rating, comment });
      res.status(201).json(review);
    } catch (error) {
      console.error("Fehler beim Erstellen der Bewertung:", error);
      res.status(500).json({ message: "Serverfehler beim Erstellen der Bewertung" });
    }
  });

  app.put("/api/reviews/:id", isAuthenticated, requireEmailVerified, async (req: Request, res: Response) => {
    try {
      const reviewId = Number(req.params.id);
      if (!Number.isFinite(reviewId)) {
        return res.status(400).json({ message: "Ungültige Bewertungs-ID" });
      }

      const userId = req.user!.id;
      const existingReview = await storage.getReview(reviewId);
      if (!existingReview) {
        return res.status(404).json({ message: "Bewertung nicht gefunden" });
      }

      if (existingReview.userId !== userId && !req.user!.isAdmin) {
        return res.status(403).json({ message: "Sie haben keine Berechtigung zur Bearbeitung dieser Bewertung" });
      }

      const updates: any = {};
      if (req.body?.rating !== undefined) {
        const rating = Number(req.body.rating);
        if (!rating || rating < 1 || rating > 5) {
          return res.status(400).json({ message: "Bewertung muss zwischen 1 und 5 Sternen liegen" });
        }
        updates.rating = rating;
      }

      if (req.body?.comment !== undefined) {
        const comment = String(req.body.comment || "").trim();
        if (comment.length < 10) {
          return res.status(400).json({ message: "Kommentar muss mindestens 10 Zeichen lang sein" });
        }
        updates.comment = comment;
      }

      const updatedReview = await storage.updateReview(reviewId, updates);
      if (!updatedReview) {
        return res.status(500).json({ message: "Fehler beim Aktualisieren der Bewertung" });
      }

      res.json(updatedReview);
    } catch (error) {
      console.error("Fehler beim Bearbeiten der Bewertung:", error);
      res.status(500).json({ message: "Serverfehler beim Bearbeiten der Bewertung" });
    }
  });

  app.delete("/api/reviews/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const reviewId = Number(req.params.id);
      if (!Number.isFinite(reviewId)) {
        return res.status(400).json({ message: "Ungültige Bewertungs-ID" });
      }

      const userId = req.user!.id;
      const existingReview = await storage.getReview(reviewId);
      if (!existingReview) {
        return res.status(404).json({ message: "Bewertung nicht gefunden" });
      }

      if (existingReview.userId !== userId && !req.user!.isAdmin) {
        return res.status(403).json({ message: "Sie haben keine Berechtigung zum Löschen dieser Bewertung" });
      }

      const deleted = await storage.deleteReview(reviewId);
      if (!deleted) {
        return res.status(500).json({ message: "Fehler beim Löschen der Bewertung" });
      }

      res.json({ message: "Bewertung erfolgreich gelöscht" });
    } catch (error) {
      console.error("Fehler beim Löschen der Bewertung:", error);
      res.status(500).json({ message: "Serverfehler beim Löschen der Bewertung" });
    }
  });
}
