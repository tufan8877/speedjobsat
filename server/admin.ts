import { Express } from "express";
import { storage } from "./storage";
import { isAdmin } from "./sqlite-auth";

export function setupAdmin(app: Express) {
  // Get all users
  app.get("/api/admin/users", isAdmin, async (req, res, next) => {
    try {
      const { sqliteStorage } = await import('./sqlite-storage');
      const users = await sqliteStorage.getAllUsers();
      console.log("Admin Benutzer abgerufen:", users);
      res.json(users);
    } catch (error) {
      console.error("Fehler beim Abrufen der Admin Benutzer:", error);
      next(error);
    }
  });

  // Get all profiles
  app.get("/api/admin/profiles", isAdmin, async (req, res, next) => {
    try {
      const { sqliteStorage } = await import('./sqlite-storage');
      const profiles = await sqliteStorage.getAllProfiles();
      console.log("Admin Profile abgerufen:", profiles);
      res.json(profiles);
    } catch (error) {
      console.error("Fehler beim Abrufen der Admin Profile:", error);
      next(error);
    }
  });

  // Ban a user
  app.post("/api/admin/users/:id/ban", isAdmin, async (req, res, next) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "Benutzer nicht gefunden" });
      }
      
      // Update user status to suspended
      const updatedUser = await storage.updateUser(userId, { status: "suspended" });
      
      // Add email to banned list
      await storage.banEmail({
        email: user.email,
        reason: req.body.reason || "Von Admin gesperrt"
      });
      
      res.json(updatedUser);
    } catch (error) {
      next(error);
    }
  });

  // Delete a user
  app.delete("/api/admin/users/:id", isAdmin, async (req, res, next) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "Benutzer nicht gefunden" });
      }
      
      // Update user status to deleted
      await storage.updateUser(userId, { status: "deleted" });
      
      // Add email to banned list if requested
      if (req.query.banEmail === "true") {
        await storage.banEmail({
          email: user.email,
          reason: req.body.reason || "Konto gelöscht"
        });
      }
      
      // Delete profile
      const profile = await storage.getProfileByUserId(userId);
      if (profile) {
        await storage.deleteProfile(profile.id);
      }
      
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  });

  // Delete a review
  app.delete("/api/admin/reviews/:id", isAdmin, async (req, res, next) => {
    try {
      const reviewId = parseInt(req.params.id);
      const success = await storage.deleteReview(reviewId);
      
      if (!success) {
        return res.status(404).json({ message: "Bewertung nicht gefunden" });
      }
      
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  });

  // Ban an email
  app.post("/api/admin/ban-email", isAdmin, async (req, res, next) => {
    try {
      const { email, reason } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "E-Mail-Adresse ist erforderlich" });
      }
      
      const bannedEmail = await storage.banEmail({
        email,
        reason: reason || "Von Admin gesperrt"
      });
      
      res.json(bannedEmail);
    } catch (error) {
      next(error);
    }
  });

  // Unban an email
  app.post("/api/admin/unban-email", isAdmin, async (req, res, next) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "E-Mail-Adresse ist erforderlich" });
      }
      
      const success = await storage.unbanEmail(email);
      
      if (!success) {
        return res.status(404).json({ message: "E-Mail-Adresse wurde nicht gefunden" });
      }
      
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  });

  // Get all banned emails
  app.get("/api/admin/banned-emails", isAdmin, async (req, res, next) => {
    try {
      const bannedEmails = await storage.listBannedEmails();
      res.json(bannedEmails);
    } catch (error) {
      next(error);
    }
  });

  // Admin: Get all jobs
  app.get("/api/admin/jobs", isAdmin, async (req, res, next) => {
    try {
      const { sqliteStorage } = await import('./sqlite-storage');
      const jobs = await sqliteStorage.getAllJobs();
      console.log("Admin Jobs abgerufen:", jobs);
      res.json(jobs);
    } catch (error) {
      console.error("Fehler beim Abrufen der Admin Jobs:", error);
      next(error);
    }
  });

  // Admin: Delete job
  app.delete("/api/admin/jobs/:id", isAdmin, async (req, res, next) => {
    try {
      const jobId = parseInt(req.params.id);
      const { sqliteStorage } = await import('./sqlite-storage');
      const success = await sqliteStorage.deleteJob(jobId);
      
      if (success) {
        res.json({ message: "Auftrag erfolgreich gelöscht" });
      } else {
        res.status(404).json({ message: "Auftrag nicht gefunden" });
      }
    } catch (error) {
      next(error);
    }
  });

  // Get all jobs/reviews for admin
  app.get("/api/admin/reviews", isAdmin, async (req, res, next) => {
    try {
      // Sammle alle Bewertungen von allen Profilen
      const profiles = await storage.getAllProfiles();
      const allReviews = [];
      
      for (const profile of profiles) {
        const reviews = await storage.getReviewsByProfileId(profile.id);
        allReviews.push(...reviews);
      }
      
      res.json(allReviews);
    } catch (error) {
      next(error);
    }
  });

  // Admin: Delete profile with reviews
  app.delete("/api/admin/profiles/:id", isAdmin, async (req, res, next) => {
    try {
      const profileId = parseInt(req.params.id);
      const { sqliteStorage } = await import('./sqlite-storage');
      
      // Erst alle Bewertungen des Profils löschen
      const reviews = await sqliteStorage.getReviewsByProfileId(profileId);
      for (const review of reviews) {
        await sqliteStorage.deleteReview(review.id);
      }
      
      // Dann das Profil löschen
      const success = await sqliteStorage.deleteProfile(profileId);
      
      if (success) {
        res.json({ message: "Profil und zugehörige Bewertungen erfolgreich gelöscht" });
      } else {
        res.status(404).json({ message: "Profil nicht gefunden" });
      }
    } catch (error) {
      console.error("Fehler beim Löschen des Profils:", error);
      res.status(500).json({ message: error.message || "Fehler beim Löschen des Profils" });
    }
  });

  // Admin: Suspend/Ban user
  app.post("/api/admin/profiles/:id/suspend", isAdmin, async (req, res, next) => {
    try {
      const profileId = parseInt(req.params.id);
      const { sqliteStorage } = await import('./sqlite-storage');
      
      // Profile abrufen um User ID zu bekommen
      const profile = await sqliteStorage.getProfile(profileId);
      if (!profile) {
        return res.status(404).json({ message: "Profil nicht gefunden" });
      }
      
      // Benutzer sperren
      const success = await sqliteStorage.updateUser(profile.userId, { status: "suspended" });
      
      if (success) {
        res.json({ message: "Benutzer erfolgreich gesperrt" });
      } else {
        res.status(404).json({ message: "Benutzer nicht gefunden" });
      }
    } catch (error) {
      console.error("Fehler beim Sperren des Benutzers:", error);
      res.status(500).json({ message: error.message || "Fehler beim Sperren des Benutzers" });
    }
  });
}
