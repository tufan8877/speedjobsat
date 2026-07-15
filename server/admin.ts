import { Express } from "express";
import { storage } from "./storage";
import { isAdmin } from "./auth";

export function setupAdmin(app: Express) {
  app.get("/api/admin/users", isAdmin, async (_req, res, next) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users.map(({ password, ...safeUser }) => safeUser));
    } catch (error) {
      console.error("Fehler beim Abrufen der Admin-Benutzer:", error);
      next(error);
    }
  });

  app.get("/api/admin/profiles", isAdmin, async (_req, res, next) => {
    try {
      const profiles = await storage.getAllProfiles();
      res.json(profiles);
    } catch (error) {
      console.error("Fehler beim Abrufen der Admin-Profile:", error);
      next(error);
    }
  });

  app.get("/api/admin/jobs", isAdmin, async (_req, res, next) => {
    try {
      const jobs = await storage.getAllJobs();
      res.json(jobs);
    } catch (error) {
      console.error("Fehler beim Abrufen der Admin-Aufträge:", error);
      next(error);
    }
  });

  app.get("/api/admin/reviews", isAdmin, async (_req, res, next) => {
    try {
      const profiles = await storage.getAllProfiles();
      const allReviews = [];

      for (const profile of profiles) {
        const reviews = await storage.getReviewsByProfileId(profile.id);
        allReviews.push(...reviews);
      }

      res.json(allReviews);
    } catch (error) {
      console.error("Fehler beim Abrufen der Admin-Bewertungen:", error);
      next(error);
    }
  });

  app.get("/api/admin/banned-emails", isAdmin, async (_req, res, next) => {
    try {
      const bannedEmails = await storage.listBannedEmails();
      res.json(bannedEmails);
    } catch (error) {
      console.error("Fehler beim Abrufen der gesperrten E-Mails:", error);
      next(error);
    }
  });

  app.get("/api/admin/stats", isAdmin, async (_req, res, next) => {
    try {
      const [users, profiles, jobs, bannedEmails] = await Promise.all([
        storage.getAllUsers(),
        storage.getAllProfiles(),
        storage.getAllJobs(),
        storage.listBannedEmails(),
      ]);

      let reviewsCount = 0;
      for (const profile of profiles) {
        reviewsCount += (await storage.getReviewsByProfileId(profile.id)).length;
      }

      res.json({
        users: users.length,
        profiles: profiles.length,
        jobs: jobs.length,
        reviews: reviewsCount,
        bannedEmails: bannedEmails.length,
      });
    } catch (error) {
      console.error("Fehler beim Abrufen der Admin-Statistik:", error);
      next(error);
    }
  });

  app.post("/api/admin/users/:id/ban", isAdmin, async (req, res, next) => {
    try {
      const userId = Number(req.params.id);
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "Benutzer nicht gefunden" });
      }

      if (user.isAdmin) {
        return res.status(400).json({ message: "Admin-Benutzer kann nicht gesperrt werden" });
      }

      const updatedUser = await storage.updateUser(userId, { status: "suspended" });
      await storage.banEmail({
        email: user.email,
        reason: req.body?.reason || "Von Admin gesperrt",
      });

      res.json(updatedUser);
    } catch (error) {
      console.error("Fehler beim Sperren des Benutzers:", error);
      next(error);
    }
  });

  app.post("/api/admin/users/:id/unban", isAdmin, async (req, res, next) => {
    try {
      const userId = Number(req.params.id);
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "Benutzer nicht gefunden" });
      }

      const updatedUser = await storage.updateUser(userId, { status: "active" });
      await storage.unbanEmail(user.email);

      res.json(updatedUser);
    } catch (error) {
      console.error("Fehler beim Entsperren des Benutzers:", error);
      next(error);
    }
  });

  app.delete("/api/admin/users/:id", isAdmin, async (req, res, next) => {
    try {
      const userId = Number(req.params.id);
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "Benutzer nicht gefunden" });
      }

      if (user.isAdmin) {
        return res.status(400).json({ message: "Admin-Benutzer kann nicht gelöscht werden" });
      }

      await storage.updateUser(userId, { status: "deleted" });

      if (req.query.banEmail === "true") {
        await storage.banEmail({
          email: user.email,
          reason: req.body?.reason || "Konto gelöscht",
        });
      }

      const profile = await storage.getProfileByUserId(userId);
      if (profile) {
        await storage.deleteProfile(profile.id);
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Fehler beim Löschen des Benutzers:", error);
      next(error);
    }
  });

  app.delete("/api/admin/profiles/:id", isAdmin, async (req, res, next) => {
    try {
      const profileId = Number(req.params.id);
      const profile = await storage.getProfile(profileId);

      if (!profile) {
        return res.status(404).json({ message: "Profil nicht gefunden" });
      }

      const reviews = await storage.getReviewsByProfileId(profileId);
      for (const review of reviews) {
        await storage.deleteReview(review.id);
      }

      await storage.deleteProfile(profileId);
      res.json({ message: "Profil und zugehörige Bewertungen erfolgreich gelöscht" });
    } catch (error) {
      console.error("Fehler beim Löschen des Profils:", error);
      next(error);
    }
  });

  app.post("/api/admin/profiles/:id/suspend", isAdmin, async (req, res, next) => {
    try {
      const profileId = Number(req.params.id);
      const profile = await storage.getProfile(profileId);

      if (!profile) {
        return res.status(404).json({ message: "Profil nicht gefunden" });
      }

      const user = await storage.getUser(profile.userId);
      if (!user) {
        return res.status(404).json({ message: "Benutzer nicht gefunden" });
      }

      if (user.isAdmin) {
        return res.status(400).json({ message: "Admin-Benutzer kann nicht gesperrt werden" });
      }

      const updatedUser = await storage.updateUser(profile.userId, { status: "suspended" });
      res.json(updatedUser);
    } catch (error) {
      console.error("Fehler beim Sperren des Profil-Benutzers:", error);
      next(error);
    }
  });

  app.delete("/api/admin/jobs/:id", isAdmin, async (req, res, next) => {
    try {
      const jobId = Number(req.params.id);
      const success = await storage.deleteJob(jobId);

      if (!success) {
        return res.status(404).json({ message: "Auftrag nicht gefunden" });
      }

      res.json({ message: "Auftrag erfolgreich gelöscht" });
    } catch (error) {
      console.error("Fehler beim Löschen des Auftrags:", error);
      next(error);
    }
  });

  app.delete("/api/admin/reviews/:id", isAdmin, async (req, res, next) => {
    try {
      const reviewId = Number(req.params.id);
      const success = await storage.deleteReview(reviewId);

      if (!success) {
        return res.status(404).json({ message: "Bewertung nicht gefunden" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Fehler beim Löschen der Bewertung:", error);
      next(error);
    }
  });

  app.post("/api/admin/ban-email", isAdmin, async (req, res, next) => {
    try {
      const { email, reason } = req.body || {};

      if (!email) {
        return res.status(400).json({ message: "E-Mail-Adresse ist erforderlich" });
      }

      const bannedEmail = await storage.banEmail({
        email,
        reason: reason || "Von Admin gesperrt",
      });

      res.json(bannedEmail);
    } catch (error) {
      console.error("Fehler beim Sperren der E-Mail:", error);
      next(error);
    }
  });

  app.post("/api/admin/unban-email", isAdmin, async (req, res, next) => {
    try {
      const { email } = req.body || {};

      if (!email) {
        return res.status(400).json({ message: "E-Mail-Adresse ist erforderlich" });
      }

      const success = await storage.unbanEmail(email);

      if (!success) {
        return res.status(404).json({ message: "E-Mail-Adresse wurde nicht gefunden" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Fehler beim Entsperren der E-Mail:", error);
      next(error);
    }
  });
}
