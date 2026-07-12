import type { Express, Request, Response } from "express";
import { pool } from "./db";
import { isAdmin } from "./auth";
import { storage } from "./storage";

let verificationTableReady: Promise<void> | null = null;

function ensureVerificationTable() {
  if (!verificationTableReady) {
    verificationTableReady = pool
      .query(`
        CREATE TABLE IF NOT EXISTS profile_verifications (
          profile_id INTEGER PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
          verified BOOLEAN NOT NULL DEFAULT FALSE,
          verified_at TIMESTAMPTZ,
          verified_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
          note TEXT
        )
      `)
      .then(() => undefined)
      .catch((error) => {
        verificationTableReady = null;
        throw error;
      });
  }

  return verificationTableReady;
}

export async function getProfileVerification(profileId: number) {
  await ensureVerificationTable();
  const result = await pool.query(
    `SELECT verified, verified_at AS "verifiedAt", note
     FROM profile_verifications
     WHERE profile_id = $1`,
    [profileId],
  );

  return result.rows[0] || { verified: false, verifiedAt: null, note: null };
}

export function setupProfileVerificationRoutes(app: Express) {
  app.get("/api/profiles/:id/verification", async (req: Request, res: Response) => {
    try {
      const profileId = Number(req.params.id);
      if (!Number.isFinite(profileId)) {
        return res.status(400).json({ message: "Ungültige Profil-ID" });
      }

      const profile = await storage.getProfile(profileId);
      if (!profile) {
        return res.status(404).json({ message: "Profil nicht gefunden" });
      }

      res.json(await getProfileVerification(profileId));
    } catch (error) {
      console.error("Fehler beim Abrufen der Profilverifizierung:", error);
      res.status(500).json({ message: "Verifizierungsstatus konnte nicht geladen werden" });
    }
  });

  app.get("/api/admin/profile-verifications", isAdmin, async (_req: Request, res: Response) => {
    try {
      await ensureVerificationTable();
      const result = await pool.query(`
        SELECT
          p.id,
          p.first_name AS "firstName",
          p.last_name AS "lastName",
          p.email,
          COALESCE(v.verified, FALSE) AS verified,
          v.verified_at AS "verifiedAt",
          v.note
        FROM profiles p
        LEFT JOIN profile_verifications v ON v.profile_id = p.id
        ORDER BY p.created_at DESC
      `);

      res.json(result.rows);
    } catch (error) {
      console.error("Fehler beim Abrufen der Verifizierungen:", error);
      res.status(500).json({ message: "Verifizierungen konnten nicht geladen werden" });
    }
  });

  app.post("/api/admin/profiles/:id/verify", isAdmin, async (req: Request, res: Response) => {
    try {
      const profileId = Number(req.params.id);
      if (!Number.isFinite(profileId)) {
        return res.status(400).json({ message: "Ungültige Profil-ID" });
      }

      const profile = await storage.getProfile(profileId);
      if (!profile) {
        return res.status(404).json({ message: "Profil nicht gefunden" });
      }

      await ensureVerificationTable();
      const adminId = Number((req.user as any)?.id) || null;
      const note = String(req.body?.note || "Vom Admin geprüft").trim().slice(0, 500);

      const result = await pool.query(
        `INSERT INTO profile_verifications (profile_id, verified, verified_at, verified_by, note)
         VALUES ($1, TRUE, NOW(), $2, $3)
         ON CONFLICT (profile_id)
         DO UPDATE SET verified = TRUE, verified_at = NOW(), verified_by = $2, note = $3
         RETURNING verified, verified_at AS "verifiedAt", note`,
        [profileId, adminId, note],
      );

      res.json(result.rows[0]);
    } catch (error) {
      console.error("Fehler beim Verifizieren des Profils:", error);
      res.status(500).json({ message: "Profil konnte nicht verifiziert werden" });
    }
  });

  app.post("/api/admin/profiles/:id/unverify", isAdmin, async (req: Request, res: Response) => {
    try {
      const profileId = Number(req.params.id);
      if (!Number.isFinite(profileId)) {
        return res.status(400).json({ message: "Ungültige Profil-ID" });
      }

      await ensureVerificationTable();
      await pool.query(
        `INSERT INTO profile_verifications (profile_id, verified, verified_at, verified_by, note)
         VALUES ($1, FALSE, NULL, NULL, NULL)
         ON CONFLICT (profile_id)
         DO UPDATE SET verified = FALSE, verified_at = NULL, verified_by = NULL, note = NULL`,
        [profileId],
      );

      res.json({ verified: false, verifiedAt: null, note: null });
    } catch (error) {
      console.error("Fehler beim Entfernen der Verifizierung:", error);
      res.status(500).json({ message: "Verifizierung konnte nicht entfernt werden" });
    }
  });
}
