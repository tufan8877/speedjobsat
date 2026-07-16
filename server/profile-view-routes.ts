import { createHash } from "crypto";
import type { Express, Request, Response } from "express";
import { pool } from "./db";
import { storage } from "./storage";
import { isAuthenticated } from "./auth";

let profileViewsTableReady: Promise<void> | null = null;

function ensureProfileViewsTable() {
  if (!profileViewsTableReady) {
    profileViewsTableReady = (async () => {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS profile_views (
          id BIGSERIAL PRIMARY KEY,
          profile_id INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
          visitor_key TEXT NOT NULL,
          viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);
      await pool.query(`
        CREATE INDEX IF NOT EXISTS profile_views_profile_date_idx
        ON profile_views (profile_id, viewed_at DESC)
      `);
      await pool.query(`
        CREATE INDEX IF NOT EXISTS profile_views_dedup_idx
        ON profile_views (profile_id, visitor_key, viewed_at DESC)
      `);
    })().catch((error) => {
      profileViewsTableReady = null;
      throw error;
    });
  }

  return profileViewsTableReady;
}

function visitorKey(req: Request) {
  const userId = (req.user as any)?.id;
  const source = userId
    ? `user:${userId}`
    : `guest:${req.sessionID || ""}:${req.ip || ""}:${req.get("user-agent") || ""}`;
  const salt = process.env.SESSION_SECRET || "speedjob-profile-views";
  return createHash("sha256").update(`${salt}:${source}`).digest("hex");
}

function normalizeSearchText(value: unknown): string {
  return String(value || "").trim().toLocaleLowerCase("de-AT");
}

async function enrichProfiles(profiles: any[]) {
  return Promise.all(
    profiles.map(async (profile) => {
      const reviews = await storage.getReviewsByProfileId(profile.id);
      const averageRating = reviews.length
        ? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length
        : 0;

      return {
        ...profile,
        reviews,
        reviewCount: reviews.length,
        averageRating,
      };
    }),
  );
}

async function getViewCounts() {
  await ensureProfileViewsTable();
  const result = await pool.query(`
    SELECT profile_id, COUNT(*)::int AS view_count
    FROM profile_views
    GROUP BY profile_id
  `);

  return new Map<number, number>(
    result.rows.map((row) => [Number(row.profile_id), Number(row.view_count || 0)]),
  );
}

export function setupProfileViewRoutes(app: Express) {
  app.post("/api/profiles/:id/view", async (req: Request, res: Response) => {
    try {
      const profileId = Number(req.params.id);
      if (!Number.isFinite(profileId)) {
        return res.status(400).json({ message: "Ungültige Profil-ID" });
      }

      const profile = await storage.getProfile(profileId);
      if (!profile) {
        return res.status(404).json({ message: "Profil nicht gefunden" });
      }

      const currentUserId = Number((req.user as any)?.id || 0);
      if (currentUserId && currentUserId === profile.userId) {
        return res.json({ counted: false, reason: "own-profile" });
      }

      await ensureProfileViewsTable();
      const key = visitorKey(req);

      const duplicate = await pool.query(
        `SELECT 1
         FROM profile_views
         WHERE profile_id = $1
           AND visitor_key = $2
           AND viewed_at >= NOW() - INTERVAL '30 minutes'
         LIMIT 1`,
        [profileId, key],
      );

      if (duplicate.rowCount && duplicate.rowCount > 0) {
        return res.json({ counted: false, reason: "recently-counted" });
      }

      await pool.query(
        "INSERT INTO profile_views (profile_id, visitor_key) VALUES ($1, $2)",
        [profileId, key],
      );

      return res.status(201).json({ counted: true });
    } catch (error) {
      console.error("Fehler beim Erfassen des Profilaufrufs:", error);
      return res.status(500).json({ message: "Profilaufruf konnte nicht erfasst werden" });
    }
  });

  app.get("/api/my-profile/views", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const profile = await storage.getProfileByUserId(req.user!.id);
      if (!profile) {
        return res.json({ today: 0, week: 0, total: 0 });
      }

      await ensureProfileViewsTable();
      const result = await pool.query(
        `SELECT
           COUNT(*)::int AS total,
           COUNT(*) FILTER (
             WHERE viewed_at >= (date_trunc('day', NOW() AT TIME ZONE 'Europe/Vienna') AT TIME ZONE 'Europe/Vienna')
           )::int AS today,
           COUNT(*) FILTER (
             WHERE viewed_at >= NOW() - INTERVAL '7 days'
           )::int AS week
         FROM profile_views
         WHERE profile_id = $1`,
        [profile.id],
      );

      const stats = result.rows[0] || { today: 0, week: 0, total: 0 };
      return res.json({
        today: Number(stats.today || 0),
        week: Number(stats.week || 0),
        total: Number(stats.total || 0),
      });
    } catch (error) {
      console.error("Fehler beim Laden der Profilaufrufe:", error);
      return res.status(500).json({ message: "Profilaufrufe konnten nicht geladen werden" });
    }
  });

  app.get("/api/ranked-profiles", async (req: Request, res: Response) => {
    try {
      const service = String(req.query.service || "");
      const servicesParam = req.query.services;
      const services = (Array.isArray(servicesParam) ? servicesParam : servicesParam ? [servicesParam] : [])
        .map((value) => String(value));
      const region = String(req.query.region || "");
      const name = String(req.query.name || "");
      const sort = String(req.query.sort || "newest");
      const page = Math.max(1, Number(req.query.page || 1));
      const pageSize = Math.max(1, Math.min(50, Number(req.query.pageSize || 10)));

      let profiles = await storage.getAllProfiles();

      if (service && service !== "all") {
        const normalizedService = normalizeSearchText(service);
        profiles = profiles.filter((profile: any) =>
          (profile.services || []).some((item: string) => normalizeSearchText(item) === normalizedService) ||
          normalizeSearchText(profile.customServices).includes(normalizedService),
        );
      } else if (services.length > 0) {
        const normalizedServices = services.map((value) => normalizeSearchText(value));
        profiles = profiles.filter((profile: any) =>
          (profile.services || []).some((item: string) => normalizedServices.includes(normalizeSearchText(item))),
        );
      }

      if (region && region !== "all") {
        profiles = profiles.filter((profile: any) => (profile.regions || []).includes(region));
      }

      if (name.trim()) {
        const keywords = normalizeSearchText(name).split(/\s+/).filter(Boolean);
        profiles = profiles.filter((profile: any) => {
          const searchableText = [
            profile.firstName,
            profile.lastName,
            profile.description,
            profile.customServices,
            ...(profile.services || []),
            ...(profile.regions || []),
          ]
            .map(normalizeSearchText)
            .join(" ");

          return keywords.every((keyword) => searchableText.includes(keyword));
        });
      }

      const viewCounts = await getViewCounts();
      const enriched = (await enrichProfiles(profiles)).map((profile) => ({
        ...profile,
        viewCount: viewCounts.get(profile.id) || 0,
      }));

      enriched.sort((a, b) => {
        if (sort === "rating") {
          if (b.averageRating !== a.averageRating) return b.averageRating - a.averageRating;
          if (b.reviewCount !== a.reviewCount) return b.reviewCount - a.reviewCount;
        } else if (sort === "views") {
          if (b.viewCount !== a.viewCount) return b.viewCount - a.viewCount;
        }

        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        if (dateB !== dateA) return dateB - dateA;
        return Number(b.id || 0) - Number(a.id || 0);
      });

      const total = enriched.length;
      const offset = (page - 1) * pageSize;
      return res.json({
        profiles: enriched.slice(offset, offset + pageSize),
        total,
      });
    } catch (error) {
      console.error("Fehler beim Laden der sortierten Profile:", error);
      return res.status(500).json({ message: "Profile konnten nicht sortiert geladen werden" });
    }
  });

  app.get("/api/top-profiles", async (_req: Request, res: Response) => {
    try {
      await ensureProfileViewsTable();
      const allProfiles = await storage.getAllProfiles();
      const activeProfiles = allProfiles.filter((profile: any) => profile.isAvailable !== false);
      const enriched = await enrichProfiles(activeProfiles);

      const newest = [...enriched]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 4);

      const topRated = [...enriched]
        .filter((profile) => profile.reviewCount > 0)
        .sort((a, b) => {
          if (b.averageRating !== a.averageRating) return b.averageRating - a.averageRating;
          return b.reviewCount - a.reviewCount;
        })
        .slice(0, 4);

      const viewCounts = await getViewCounts();
      const mostViewed = [...enriched]
        .map((profile) => ({ ...profile, viewCount: viewCounts.get(profile.id) || 0 }))
        .filter((profile) => profile.viewCount > 0)
        .sort((a, b) => b.viewCount - a.viewCount)
        .slice(0, 4);

      return res.json({ topRated, mostViewed, newest });
    } catch (error) {
      console.error("Fehler beim Laden der Top-Profile:", error);
      return res.status(500).json({ message: "Top-Profile konnten nicht geladen werden" });
    }
  });
}
