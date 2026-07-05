import express, { Express, Request, Response } from "express";
import { isAuthenticated } from "./auth";
import { sqliteDb } from "./sqlite-db";
import { jobListings } from "@shared/sqlite-schema";
import { eq, and, desc } from "drizzle-orm";
import { upload } from "./upload";
import { sqliteStorage } from "./sqlite-storage";

function getUserEmail(req: Request): string {
  return String((req.user as any)?.email || "").trim().toLowerCase();
}

export function setupJobRoutes(app: Express) {
  app.post("/api/jobs/upload", isAuthenticated, upload.array("images", 5), (req: Request, res: Response) => {
    try {
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        return res.status(400).json({ message: "Keine Dateien hochgeladen" });
      }

      const imagePaths = files.map((file) => `/uploads/jobs/${file.filename}`);

      res.json({
        message: "Bilder erfolgreich hochgeladen",
        images: imagePaths,
      });
    } catch (error) {
      console.error("Fehler beim Hochladen der Bilder:", error);
      res.status(500).json({ message: "Fehler beim Hochladen der Bilder" });
    }
  });

  app.post("/api/jobs", isAuthenticated, async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Nicht authentifiziert" });
      }

      if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: "Keine Daten empfangen" });
      }

      const { title, description, location, category, date, images } = req.body;

      if (!title || !description || !location || !category) {
        return res.status(400).json({
          message: "Erforderliche Felder fehlen: Titel, Beschreibung, Ort und Kategorie sind Pflichtfelder",
        });
      }

      const userId = Number((req.user as any)?.id);
      if (!Number.isFinite(userId)) {
        return res.status(401).json({ message: "Benutzer-ID nicht verfügbar" });
      }

      const existingJobs = await sqliteDb
        .select()
        .from(jobListings)
        .where(eq(jobListings.userId, userId))
        .limit(1);

      if (existingJobs.length > 0) {
        return res.status(400).json({ message: "Pro Benutzer ist nur ein Auftrag erlaubt. Sie können Ihren bestehenden Auftrag bearbeiten." });
      }

      const contactEmail = getUserEmail(req);
      if (!contactEmail) {
        return res.status(400).json({ message: "Keine registrierte E-Mail-Adresse im Benutzerkonto gefunden" });
      }

      const createdJob = await sqliteStorage.createJob({
        userId,
        title: String(title).trim(),
        description: String(description).trim(),
        location: String(location).trim(),
        category: String(category),
        date: date || new Date().toISOString(),
        contactInfo: contactEmail,
        images: images ? JSON.stringify(images) : null,
        status: "active",
      });

      res.status(201).json(createdJob);
    } catch (error) {
      console.error("Error creating job:", error);
      res.status(500).json({ message: "Fehler beim Erstellen des Auftrags" });
    }
  });

  app.get("/api/jobs", async (req: Request, res: Response) => {
    try {
      const { category, location, status = "active" } = req.query;

      let query = sqliteDb.select().from(jobListings);
      const conditions = [];

      if (status) {
        conditions.push(eq(jobListings.status, status as string));
      }

      if (category) {
        conditions.push(eq(jobListings.category, category as string));
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }

      query = query.orderBy(desc(jobListings.createdAt)) as any;
      const jobs = await query;

      let filteredJobs = jobs;
      if (location) {
        const locationStr = String(location).toLowerCase();
        filteredJobs = jobs.filter((job) => job.location.toLowerCase().includes(locationStr));
      }

      res.json(filteredJobs);
    } catch (error) {
      console.error("Fehler beim Abrufen der Aufträge:", error);
      res.status(500).json({ message: "Fehler beim Abrufen der Aufträge" });
    }
  });

  app.get("/api/jobs/:id", async (req: Request, res: Response) => {
    try {
      const jobId = parseInt(req.params.id);

      if (isNaN(jobId)) {
        return res.status(400).json({ message: "Ungültige Auftrags-ID" });
      }

      const result = await sqliteDb
        .select()
        .from(jobListings)
        .where(eq(jobListings.id, jobId))
        .limit(1);

      const job = result.length > 0 ? result[0] : null;

      if (!job) {
        return res.status(404).json({ message: "Auftrag nicht gefunden" });
      }

      res.json(job);
    } catch (error) {
      console.error("Fehler beim Abrufen des Auftrags:", error);
      res.status(500).json({ message: "Fehler beim Abrufen des Auftrags" });
    }
  });

  app.get("/api/my-jobs", isAuthenticated, async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Nicht authentifiziert" });
      }

      const userId = Number((req.user as any).id);
      const contactEmail = getUserEmail(req);

      if (contactEmail) {
        await sqliteDb
          .update(jobListings)
          .set({ contactInfo: contactEmail })
          .where(eq(jobListings.userId, userId));
      }

      const myJobs = await sqliteDb
        .select()
        .from(jobListings)
        .where(eq(jobListings.userId, userId))
        .orderBy(desc(jobListings.createdAt));

      res.json(myJobs);
    } catch (error) {
      console.error("Fehler beim Abrufen Ihrer Aufträge:", error);
      res.status(500).json({ message: "Fehler beim Abrufen Ihrer Aufträge" });
    }
  });

  app.put("/api/jobs/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Nicht authentifiziert" });
      }

      const jobId = parseInt(req.params.id);

      if (isNaN(jobId)) {
        return res.status(400).json({ message: "Ungültige Auftrags-ID" });
      }

      const [existingJob] = await sqliteDb
        .select()
        .from(jobListings)
        .where(eq(jobListings.id, jobId));

      if (!existingJob) {
        return res.status(404).json({ message: "Auftrag nicht gefunden" });
      }

      const isOwner = existingJob.userId === (req.user as any).id;
      const isAdmin = (req.user as any).isAdmin === true;

      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          message: "Sie haben keine Berechtigung zur Bearbeitung dieses Auftrags",
        });
      }

      const contactEmail = getUserEmail(req);
      if (!contactEmail) {
        return res.status(400).json({ message: "Keine registrierte E-Mail-Adresse im Benutzerkonto gefunden" });
      }

      const updatedData = {
        title: String(req.body?.title || existingJob.title).trim(),
        description: String(req.body?.description || existingJob.description).trim(),
        location: String(req.body?.location || existingJob.location).trim(),
        date: req.body?.date || existingJob.date,
        contactInfo: contactEmail,
        category: String(req.body?.category || existingJob.category),
        images: req.body?.images ? JSON.stringify(req.body.images) : existingJob.images,
        status: req.body?.status || existingJob.status,
      };

      if (!updatedData.title || !updatedData.description || !updatedData.location || !updatedData.category) {
        return res.status(400).json({ message: "Titel, Beschreibung, Ort und Kategorie sind Pflichtfelder" });
      }

      const [updatedJob] = await sqliteDb
        .update(jobListings)
        .set(updatedData)
        .where(eq(jobListings.id, jobId))
        .returning();

      res.json(updatedJob);
    } catch (error) {
      console.error("Fehler beim Aktualisieren des Auftrags:", error);
      res.status(500).json({ message: "Fehler beim Aktualisieren des Auftrags" });
    }
  });

  app.delete("/api/jobs/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Nicht authentifiziert" });
      }

      const jobId = Number(req.params.id);

      if (!Number.isFinite(jobId)) {
        return res.status(400).json({ message: "Ungültige Auftrags-ID" });
      }

      const [existingJob] = await sqliteDb
        .select()
        .from(jobListings)
        .where(eq(jobListings.id, jobId))
        .limit(1);

      if (!existingJob) {
        return res.status(404).json({ message: "Auftrag nicht gefunden" });
      }

      const isOwner = Number(existingJob.userId) === Number((req.user as any).id);
      const isAdmin = (req.user as any).isAdmin === true;

      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          message: "Sie haben keine Berechtigung zum Löschen dieses Auftrags",
        });
      }

      const deletedJobs = await sqliteDb
        .delete(jobListings)
        .where(eq(jobListings.id, jobId))
        .returning();

      if (!deletedJobs.length) {
        return res.status(500).json({ message: "Auftrag konnte nicht gelöscht werden" });
      }

      res.status(200).json({
        success: true,
        message: "Auftrag erfolgreich gelöscht",
        deletedJob: deletedJobs[0],
      });
    } catch (error) {
      console.error("Fehler beim Löschen des Auftrags:", error);
      res.status(500).json({ message: "Fehler beim Löschen des Auftrags" });
    }
  });
}
