import type { Express, Request, Response } from "express";
import { pool } from "./db";
import { storage } from "./storage";
import { isAuthenticated } from "./auth";

const MAX_IMAGES = 6;
const MAX_DATA_URL_LENGTH = 2_800_000;

let galleryTableReady: Promise<void> | null = null;

function ensureGalleryTable() {
  if (!galleryTableReady) {
    galleryTableReady = pool.query(`
      CREATE TABLE IF NOT EXISTS profile_gallery_images (
        id SERIAL PRIMARY KEY,
        profile_id INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        image_data TEXT NOT NULL,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS profile_gallery_images_profile_id_idx
        ON profile_gallery_images(profile_id, sort_order, id);
    `).then(() => undefined);
  }
  return galleryTableReady;
}

function validImageDataUrl(value: unknown): value is string {
  if (typeof value !== "string" || value.length > MAX_DATA_URL_LENGTH) return false;
  return /^data:image\/(jpeg|jpg|png|webp);base64,[a-zA-Z0-9+/=]+$/.test(value);
}

export function setupProfileGalleryRoutes(app: Express) {
  app.get("/api/profiles/:id/gallery", async (req: Request, res: Response) => {
    try {
      await ensureGalleryTable();
      const profileId = Number(req.params.id);
      if (!Number.isFinite(profileId)) return res.status(400).json({ message: "Ungültige Profil-ID" });

      const profile = await storage.getProfile(profileId);
      if (!profile) return res.status(404).json({ message: "Profil nicht gefunden" });

      const result = await pool.query(
        `SELECT id, image_data AS "imageData", sort_order AS "sortOrder", created_at AS "createdAt"
         FROM profile_gallery_images
         WHERE profile_id = $1
         ORDER BY sort_order ASC, id ASC`,
        [profileId],
      );
      res.json(result.rows);
    } catch (error) {
      console.error("Fehler beim Laden der Profilgalerie:", error);
      res.status(500).json({ message: "Profilgalerie konnte nicht geladen werden" });
    }
  });

  app.get("/api/my-profile/gallery", isAuthenticated, async (req: Request, res: Response) => {
    try {
      await ensureGalleryTable();
      const profile = await storage.getProfileByUserId(req.user!.id);
      if (!profile) return res.json([]);

      const result = await pool.query(
        `SELECT id, image_data AS "imageData", sort_order AS "sortOrder", created_at AS "createdAt"
         FROM profile_gallery_images
         WHERE profile_id = $1
         ORDER BY sort_order ASC, id ASC`,
        [profile.id],
      );
      res.json(result.rows);
    } catch (error) {
      console.error("Fehler beim Laden der eigenen Profilgalerie:", error);
      res.status(500).json({ message: "Profilgalerie konnte nicht geladen werden" });
    }
  });

  app.post("/api/my-profile/gallery", isAuthenticated, async (req: Request, res: Response) => {
    try {
      await ensureGalleryTable();
      const profile = await storage.getProfileByUserId(req.user!.id);
      if (!profile) return res.status(404).json({ message: "Bitte speichern Sie zuerst Ihr Profil" });

      const imageData = req.body?.imageData;
      if (!validImageDataUrl(imageData)) {
        return res.status(400).json({ message: "Bitte laden Sie ein JPG-, PNG- oder WebP-Bild mit maximal 2 MB hoch" });
      }

      const countResult = await pool.query(
        "SELECT COUNT(*)::int AS count FROM profile_gallery_images WHERE profile_id = $1",
        [profile.id],
      );
      const count = Number(countResult.rows[0]?.count || 0);
      if (count >= MAX_IMAGES) {
        return res.status(400).json({ message: `Es sind maximal ${MAX_IMAGES} Galeriebilder erlaubt` });
      }

      const result = await pool.query(
        `INSERT INTO profile_gallery_images (profile_id, image_data, sort_order)
         VALUES ($1, $2, $3)
         RETURNING id, image_data AS "imageData", sort_order AS "sortOrder", created_at AS "createdAt"`,
        [profile.id, imageData, count],
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error("Fehler beim Hochladen eines Galeriebildes:", error);
      res.status(500).json({ message: "Bild konnte nicht gespeichert werden" });
    }
  });

  app.delete("/api/my-profile/gallery/:imageId", isAuthenticated, async (req: Request, res: Response) => {
    try {
      await ensureGalleryTable();
      const imageId = Number(req.params.imageId);
      if (!Number.isFinite(imageId)) return res.status(400).json({ message: "Ungültige Bild-ID" });

      const profile = await storage.getProfileByUserId(req.user!.id);
      if (!profile) return res.status(404).json({ message: "Profil nicht gefunden" });

      const result = await pool.query(
        "DELETE FROM profile_gallery_images WHERE id = $1 AND profile_id = $2 RETURNING id",
        [imageId, profile.id],
      );
      if (!result.rowCount) return res.status(404).json({ message: "Bild nicht gefunden" });
      res.json({ success: true });
    } catch (error) {
      console.error("Fehler beim Löschen eines Galeriebildes:", error);
      res.status(500).json({ message: "Bild konnte nicht gelöscht werden" });
    }
  });
}
