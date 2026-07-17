import type { Express, Request, Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { profiles, users, jobListings } from "@shared/schema";

const SITE_URL = "https://speedjob.at";

const STATIC_PAGES: { path: string; changefreq: string; priority: string }[] = [
  { path: "/", changefreq: "daily", priority: "1.0" },
  { path: "/suche", changefreq: "daily", priority: "0.9" },
  { path: "/auftraege", changefreq: "daily", priority: "0.7" },
  { path: "/auth?tab=register", changefreq: "monthly", priority: "0.6" },
  { path: "/ueber-uns", changefreq: "monthly", priority: "0.3" },
  { path: "/kontakt", changefreq: "monthly", priority: "0.3" },
  { path: "/hilfe-faq", changefreq: "monthly", priority: "0.3" },
  { path: "/sicherheitstipps", changefreq: "monthly", priority: "0.3" },
  { path: "/support", changefreq: "monthly", priority: "0.3" },
  { path: "/impressum", changefreq: "yearly", priority: "0.2" },
  { path: "/datenschutz", changefreq: "yearly", priority: "0.2" },
  { path: "/nutzungsbedingungen", changefreq: "yearly", priority: "0.2" },
];

function xmlEscape(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function urlEntry(loc: string, lastmod: Date | null, changefreq: string, priority: string) {
  return [
    "  <url>",
    `    <loc>${xmlEscape(loc)}</loc>`,
    lastmod ? `    <lastmod>${lastmod.toISOString().slice(0, 10)}</lastmod>` : "",
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    "  </url>",
  ].filter(Boolean).join("\n");
}

export function setupSeoRoutes(app: Express) {
  app.get("/robots.txt", (_req: Request, res: Response) => {
    res.type("text/plain").send(
      [
        "User-agent: *",
        "Allow: /",
        "Disallow: /admin",
        "Disallow: /profil",
        "Disallow: /favoriten",
        "Disallow: /auftrag-erstellen",
        "Disallow: /auftraege/bearbeiten/",
        "Disallow: /api/",
        "",
        `Sitemap: ${SITE_URL}/sitemap.xml`,
        "",
      ].join("\n"),
    );
  });

  app.get("/sitemap.xml", async (_req: Request, res: Response) => {
    try {
      const activeProfiles = await db
        .select({ id: profiles.id, updatedAt: profiles.updatedAt })
        .from(profiles)
        .innerJoin(users, eq(profiles.userId, users.id))
        .where(eq(users.status, "active"));

      const activeJobs = await db
        .select({ id: jobListings.id, createdAt: jobListings.createdAt })
        .from(jobListings)
        .where(eq(jobListings.status, "active"));

      const entries = [
        ...STATIC_PAGES.map((page) => urlEntry(`${SITE_URL}${page.path}`, null, page.changefreq, page.priority)),
        ...activeProfiles.map((profile) =>
          urlEntry(`${SITE_URL}/anbieter/${profile.id}`, profile.updatedAt, "weekly", "0.6"),
        ),
        ...activeJobs.map((job) => urlEntry(`${SITE_URL}/auftraege/${job.id}`, job.createdAt, "weekly", "0.5")),
      ];

      const xml = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        ...entries,
        "</urlset>",
      ].join("\n");

      res.type("application/xml").send(xml);
    } catch (error) {
      console.error("Sitemap konnte nicht erstellt werden:", error);
      res.status(500).type("text/plain").send("Sitemap konnte nicht erstellt werden.");
    }
  });
}
