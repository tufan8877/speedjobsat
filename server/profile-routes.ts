import express, { Express, Request, Response, NextFunction } from "express";
import { sqliteStorage } from "./sqlite-storage";
import { isAuthenticated } from "./sqlite-auth";

export function setupProfileRoutes(app: Express) {
  // Profil des aktuellen Benutzers abrufen
  app.get("/api/my-profile", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const profile = await sqliteStorage.getProfileByUserId(userId);
      
      if (!profile) {
        return res.status(404).json({ message: "Profil nicht gefunden" });
      }
      
      // JSON-Strings zurück zu Arrays konvertieren für Response
      const responseProfile = {
        ...profile,
        services: JSON.parse(profile.services || "[]"),
        regions: JSON.parse(profile.regions || "[]"),
        availablePeriods: JSON.parse(profile.availablePeriods || "[]"),
      };
      
      res.json(responseProfile);
    } catch (error) {
      console.error("Fehler beim Abrufen des Profils:", error);
      res.status(500).json({ message: "Serverfehler beim Abrufen des Profils" });
    }
  });

  // Profil des aktuellen Benutzers erstellen/aktualisieren
  app.put("/api/my-profile", isAuthenticated, (req: Request, res: Response, next: NextFunction) => {
    // Custom Body Parser für Profile
    if (!req.headers['content-type']) {
      req.headers['content-type'] = 'application/json';
    }
    express.json()(req, res, async () => {
    try {
      const userId = req.user!.id;
      const profileData = req.body;
      

      
      // Array-Felder zu JSON-Strings konvertieren
      const processedData = {
        ...profileData,
        services: Array.isArray(profileData.services) ? JSON.stringify(profileData.services) : profileData.services,
        regions: Array.isArray(profileData.regions) ? JSON.stringify(profileData.regions) : profileData.regions,
        availablePeriods: Array.isArray(profileData.availablePeriods) ? JSON.stringify(profileData.availablePeriods) : profileData.availablePeriods,
      };
      
      // Überprüfen, ob bereits ein Profil existiert
      const existingProfile = await sqliteStorage.getProfileByUserId(userId);
      
      if (existingProfile) {
        // Profil aktualisieren
        const updatedProfile = await sqliteStorage.updateProfile(existingProfile.id, processedData);
        if (!updatedProfile) {
          return res.status(500).json({ message: "Fehler beim Aktualisieren des Profils" });
        }
        
        // JSON-Strings zurück zu Arrays konvertieren für Response
        const responseProfile = {
          ...updatedProfile,
          services: JSON.parse(updatedProfile.services || "[]"),
          regions: JSON.parse(updatedProfile.regions || "[]"),
          availablePeriods: JSON.parse(updatedProfile.availablePeriods || "[]"),
        };
        
        res.json(responseProfile);
      } else {
        // Neues Profil erstellen
        const newProfile = await sqliteStorage.createProfile({
          userId,
          ...processedData
        });
        
        // JSON-Strings zurück zu Arrays konvertieren für Response
        const responseProfile = {
          ...newProfile,
          services: JSON.parse(newProfile.services || "[]"),
          regions: JSON.parse(newProfile.regions || "[]"),
          availablePeriods: JSON.parse(newProfile.availablePeriods || "[]"),
        };
        
        res.status(201).json(responseProfile);
      }
    } catch (error) {
      console.error("Fehler beim Speichern des Profils:", error);
      res.status(500).json({ message: "Serverfehler beim Speichern des Profils" });
    }
    });
  });

  // Alle Profile abrufen (öffentlich)
  app.get("/api/profiles", async (req: Request, res: Response) => {
    try {
      const { service, region, name, sort, page, pageSize } = req.query;
      
      const result = await sqliteStorage.searchProfiles({
        service: service as string,
        region: region as string,
        name: name as string,
        sort: sort as 'rating' | 'newest',
        page: page ? parseInt(page as string) : undefined,
        pageSize: pageSize ? parseInt(pageSize as string) : undefined
      });
      
      // JSON-Strings zurück zu Arrays konvertieren für alle Profile und Bewertungen laden
      const profilesWithArrays = await Promise.all(result.profiles.map(async (profile) => {
        const reviews = await sqliteStorage.getReviewsByProfileId(profile.id);
        return {
          ...profile,
          services: JSON.parse(profile.services || "[]"),
          regions: JSON.parse(profile.regions || "[]"),
          availablePeriods: JSON.parse(profile.availablePeriods || "[]"),
          reviews: reviews || [],
        };
      }));
      
      res.json({
        profiles: profilesWithArrays,
        total: result.total
      });
    } catch (error) {
      console.error("Fehler beim Abrufen der Profile:", error);
      res.status(500).json({ message: "Serverfehler beim Abrufen der Profile" });
    }
  });

  // Einzelnes Profil abrufen (öffentlich)
  app.get("/api/profiles/:id", async (req: Request, res: Response) => {
    try {
      const profileId = parseInt(req.params.id);
      if (isNaN(profileId)) {
        return res.status(400).json({ message: "Ungültige Profil-ID" });
      }
      
      const profile = await sqliteStorage.getProfile(profileId);
      
      if (!profile) {
        return res.status(404).json({ message: "Profil nicht gefunden" });
      }
      
      // Bewertungen für das Profil laden
      const reviews = await sqliteStorage.getReviewsByProfileId(profileId);
      
      // JSON-Strings zurück zu Arrays konvertieren für Response
      const responseProfile = {
        ...profile,
        services: JSON.parse(profile.services || "[]"),
        regions: JSON.parse(profile.regions || "[]"),
        availablePeriods: JSON.parse(profile.availablePeriods || "[]"),
        reviews: reviews || [],
      };
      
      res.json(responseProfile);
    } catch (error) {
      console.error("Fehler beim Abrufen des Profils:", error);
      res.status(500).json({ message: "Serverfehler beim Abrufen des Profils" });
    }
  });

  // Profil löschen (nur eigenes Profil)
  app.delete("/api/my-profile", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const profile = await sqliteStorage.getProfileByUserId(userId);
      
      if (!profile) {
        return res.status(404).json({ message: "Profil nicht gefunden" });
      }
      
      const deleted = await sqliteStorage.deleteProfile(profile.id);
      
      if (!deleted) {
        return res.status(500).json({ message: "Fehler beim Löschen des Profils" });
      }
      
      res.json({ message: "Profil erfolgreich gelöscht" });
    } catch (error) {
      console.error("Fehler beim Löschen des Profils:", error);
      res.status(500).json({ message: "Serverfehler beim Löschen des Profils" });
    }
  });

  // Bewertungen für ein Profil abrufen
  app.get("/api/profiles/:id/reviews", async (req: Request, res: Response) => {
    try {
      const profileId = parseInt(req.params.id);
      if (isNaN(profileId)) {
        return res.status(400).json({ message: "Ungültige Profil-ID" });
      }

      const reviews = await sqliteStorage.getReviewsByProfileId(profileId);
      res.json(reviews);
    } catch (error) {
      console.error("Fehler beim Abrufen der Bewertungen:", error);
      res.status(500).json({ message: "Serverfehler beim Abrufen der Bewertungen" });
    }
  });

  // Bewertung für ein Profil erstellen
  app.post("/api/profiles/:id/reviews", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const profileId = parseInt(req.params.id);
      if (isNaN(profileId)) {
        return res.status(400).json({ message: "Ungültige Profil-ID" });
      }

      const userId = req.user!.id;
      const { rating, comment } = req.body;

      // Validierung
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Bewertung muss zwischen 1 und 5 Sternen liegen" });
      }

      if (!comment || comment.trim().length < 10) {
        return res.status(400).json({ message: "Kommentar muss mindestens 10 Zeichen lang sein" });
      }

      // Prüfen, ob Profil existiert
      const profile = await sqliteStorage.getProfile(profileId);
      if (!profile) {
        return res.status(404).json({ message: "Profil nicht gefunden" });
      }

      // Prüfen, ob Benutzer sein eigenes Profil bewerten will
      if (profile.userId === userId) {
        return res.status(400).json({ message: "Sie können Ihr eigenes Profil nicht bewerten" });
      }

      const review = await sqliteStorage.createReview({
        userId,
        profileId,
        rating: parseInt(rating),
        comment: comment.trim()
      });

      res.status(201).json(review);
    } catch (error) {
      console.error("Fehler beim Erstellen der Bewertung:", error);
      res.status(500).json({ message: "Serverfehler beim Erstellen der Bewertung" });
    }
  });

  // Eigene Bewertung bearbeiten
  app.put("/api/reviews/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const reviewId = parseInt(req.params.id);
      if (isNaN(reviewId)) {
        return res.status(400).json({ message: "Ungültige Bewertungs-ID" });
      }

      const userId = req.user!.id;
      const { rating, comment } = req.body;

      // Bewertung abrufen und Berechtigung prüfen
      const existingReview = await sqliteStorage.getReview(reviewId);
      if (!existingReview) {
        return res.status(404).json({ message: "Bewertung nicht gefunden" });
      }

      if (existingReview.userId !== userId && !req.user!.isAdmin) {
        return res.status(403).json({ message: "Sie haben keine Berechtigung zur Bearbeitung dieser Bewertung" });
      }

      // Validierung
      if (rating && (rating < 1 || rating > 5)) {
        return res.status(400).json({ message: "Bewertung muss zwischen 1 und 5 Sternen liegen" });
      }

      if (comment && comment.trim().length < 10) {
        return res.status(400).json({ message: "Kommentar muss mindestens 10 Zeichen lang sein" });
      }

      const updatedReview = await sqliteStorage.updateReview(reviewId, {
        rating: rating ? parseInt(rating) : undefined,
        comment: comment ? comment.trim() : undefined
      });

      if (!updatedReview) {
        return res.status(500).json({ message: "Fehler beim Aktualisieren der Bewertung" });
      }

      res.json(updatedReview);
    } catch (error) {
      console.error("Fehler beim Bearbeiten der Bewertung:", error);
      res.status(500).json({ message: "Serverfehler beim Bearbeiten der Bewertung" });
    }
  });

  // Bewertung löschen
  app.delete("/api/reviews/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const reviewId = parseInt(req.params.id);
      if (isNaN(reviewId)) {
        return res.status(400).json({ message: "Ungültige Bewertungs-ID" });
      }

      const userId = req.user!.id;

      // Bewertung abrufen und Berechtigung prüfen
      const existingReview = await sqliteStorage.getReview(reviewId);
      if (!existingReview) {
        return res.status(404).json({ message: "Bewertung nicht gefunden" });
      }

      if (existingReview.userId !== userId && !req.user!.isAdmin) {
        return res.status(403).json({ message: "Sie haben keine Berechtigung zum Löschen dieser Bewertung" });
      }

      const deleted = await sqliteStorage.deleteReview(reviewId);
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