import express, { Express, Request, Response, NextFunction } from "express";
import { isAuthenticated } from "./sqlite-auth";
import { sqliteDb } from "./sqlite-db";
import { jobListings } from "@shared/sqlite-schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { upload } from "./upload";
import { sqliteStorage } from "./sqlite-storage";
import path from "path";

export function setupJobRoutes(app: Express) {
  // Upload-Route für Auftragsbilder
  app.post("/api/jobs/upload", isAuthenticated, upload.array('images', 5), (req: Request, res: Response) => {
    try {
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        return res.status(400).json({ message: "Keine Dateien hochgeladen" });
      }

      const imagePaths = files.map(file => `/uploads/jobs/${file.filename}`);
      
      res.json({ 
        message: "Bilder erfolgreich hochgeladen",
        images: imagePaths 
      });
    } catch (error) {
      console.error("Fehler beim Hochladen der Bilder:", error);
      res.status(500).json({ message: "Fehler beim Hochladen der Bilder" });
    }
  });

  // Erstelle einen neuen Auftrag - Direkte Route ohne zusätzliche Middleware
  app.post("/api/jobs", isAuthenticated, async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Nicht authentifiziert" });
      }

      console.log("Raw req.body:", req.body);
      console.log("Type of req.body:", typeof req.body);
      
      // Validierung ob req.body leer ist
      if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: "Keine Daten empfangen" });
      }
      
      const { title, description, location, category, date, contactInfo, images } = req.body;
      
      console.log("Extracted fields:", { title, description, location, category, date, contactInfo });
      
      if (!title || !description || !location || !category) {
        return res.status(400).json({ 
          message: "Erforderliche Felder fehlen: Titel, Beschreibung, Ort und Kategorie sind Pflichtfelder"
        });
      }

      // FOREIGN KEY FIX: User-ID aus Token-Auth berücksichtigen
      const userId = req.user?.id || (req.user as any)?.id;
      if (!userId) {
        return res.status(401).json({ message: "Benutzer-ID nicht verfügbar" });
      }

      console.log('Creating job for user ID:', userId, 'User object:', req.user);

      // In Datenbank speichern mit sqlite-storage Methode
      const createdJob = await sqliteStorage.createJob({
        userId: parseInt(userId),
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        category: category,
        date: date || new Date().toISOString(),
        contactInfo: contactInfo?.trim() || "",
        images: images ? JSON.stringify(images) : null,
        status: "active"
      });
      
      res.status(201).json(createdJob);
    } catch (error) {
      console.error("Error creating job:", error);
      res.status(500).json({ message: "Fehler beim Erstellen des Auftrags" });
    }
  });
  
  // Alle Aufträge abrufen
  app.get("/api/jobs", async (req: Request, res: Response) => {
    try {
      const { category, location, status = "active" } = req.query;
      
      // Basisabfrage starten
      let query = sqliteDb.select().from(jobListings);
      
      // Filter hinzufügen
      const conditions = [];
      
      if (status) {
        conditions.push(eq(jobListings.status, status as string));
      }
      
      if (category) {
        conditions.push(eq(jobListings.category, category as string));
      }
      
      // Bei SQLite können wir für location keine erweiterte Suche direkt im Query machen,
      // daher holen wir alle Jobs und filtern manuell
      // Für Location setzen wir keinen Filter, sondern filtern später im Code
      
      // Abfrage mit Filtern ausführen
      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }
      
      // Nach Erstellungsdatum sortieren (neueste zuerst)
      query = query.orderBy(desc(jobListings.createdAt)) as any;
      
      const jobs = await query;
      
      // Manuelle Filterung nach Location, wenn angegeben
      let filteredJobs = jobs;
      if (location) {
        const locationStr = location as string;
        filteredJobs = jobs.filter(job => 
          job.location.toLowerCase().includes(locationStr.toLowerCase())
        );
      }
      
      res.json(filteredJobs);
    } catch (error) {
      console.error("Fehler beim Abrufen der Aufträge:", error);
      res.status(500).json({ message: "Fehler beim Abrufen der Aufträge" });
    }
  });
  
  // Einen bestimmten Auftrag abrufen
  app.get("/api/jobs/:id", async (req: Request, res: Response) => {
    try {
      const jobId = parseInt(req.params.id);
      
      if (isNaN(jobId)) {
        return res.status(400).json({ message: "Ungültige Auftrags-ID" });
      }
      
      console.log(`Auftrag mit ID ${jobId} wird abgerufen...`);
      
      const result = await sqliteDb
        .select()
        .from(jobListings)
        .where(eq(jobListings.id, jobId))
        .limit(1);
      
      // Array-Ergebnis in ein einzelnes Objekt umwandeln
      const job = result.length > 0 ? result[0] : null;
      
      if (!job) {
        console.log(`Auftrag mit ID ${jobId} wurde nicht gefunden`);
        return res.status(404).json({ message: "Auftrag nicht gefunden" });
      }
      
      console.log(`Auftrag mit ID ${jobId} erfolgreich gefunden:`, job);
      res.json(job);
    } catch (error) {
      console.error("Fehler beim Abrufen des Auftrags:", error);
      res.status(500).json({ message: "Fehler beim Abrufen des Auftrags" });
    }
  });
  
  // Meine Aufträge abrufen
  app.get("/api/my-jobs", isAuthenticated, async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Nicht authentifiziert" });
      }
      
      const myJobs = await sqliteDb
        .select()
        .from(jobListings)
        .where(eq(jobListings.userId, req.user.id))
        .orderBy(desc(jobListings.createdAt));
      
      res.json(myJobs);
    } catch (error) {
      console.error("Fehler beim Abrufen Ihrer Aufträge:", error);
      res.status(500).json({ message: "Fehler beim Abrufen Ihrer Aufträge" });
    }
  });
  
  // Auftrag aktualisieren
  app.put("/api/jobs/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Nicht authentifiziert" });
      }
      
      const jobId = parseInt(req.params.id);
      
      if (isNaN(jobId)) {
        return res.status(400).json({ message: "Ungültige Auftrags-ID" });
      }
      
      // Ersten den Auftrag finden
      const [existingJob] = await sqliteDb
        .select()
        .from(jobListings)
        .where(eq(jobListings.id, jobId));
      
      if (!existingJob) {
        return res.status(404).json({ message: "Auftrag nicht gefunden" });
      }
      
      // Prüfen, ob der Benutzer berechtigt ist (Eigentümer oder Admin)
      const isOwner = existingJob.userId === req.user.id;
      const isAdmin = req.user.isAdmin === true;
      
      if (!isOwner && !isAdmin) {
        return res.status(403).json({ 
          message: "Sie haben keine Berechtigung zur Bearbeitung dieses Auftrags" 
        });
      }
      
      // Auftrag aktualisieren
      const updatedData = {
        title: req.body.title,
        description: req.body.description,
        location: req.body.location,
        date: req.body.date,
        contactInfo: req.body.contactInfo,
        category: req.body.category,
        images: req.body.images ? JSON.stringify(req.body.images) : existingJob.images,
        status: req.body.status || existingJob.status,
      };
      
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
  
  // Auftrag löschen
  app.delete("/api/jobs/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Nicht authentifiziert" });
      }
      
      const jobId = parseInt(req.params.id);
      
      if (isNaN(jobId)) {
        return res.status(400).json({ message: "Ungültige Auftrags-ID" });
      }
      
      // Ersten den Auftrag finden
      const [existingJob] = await sqliteDb
        .select()
        .from(jobListings)
        .where(eq(jobListings.id, jobId));
      
      if (!existingJob) {
        return res.status(404).json({ message: "Auftrag nicht gefunden" });
      }
      
      // Prüfen, ob der Benutzer berechtigt ist (Eigentümer oder Admin)
      const isOwner = existingJob.userId === req.user.id;
      const isAdmin = req.user.isAdmin === true;
      
      if (!isOwner && !isAdmin) {
        return res.status(403).json({ 
          message: "Sie haben keine Berechtigung zum Löschen dieses Auftrags" 
        });
      }
      
      // Auftrag löschen
      await sqliteDb
        .delete(jobListings)
        .where(eq(jobListings.id, jobId));
      
      res.status(200).json({ message: "Auftrag erfolgreich gelöscht" });
    } catch (error) {
      console.error("Fehler beim Löschen des Auftrags:", error);
      res.status(500).json({ message: "Fehler beim Löschen des Auftrags" });
    }
  });
}