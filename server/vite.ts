import type { Express } from "express";
import express from "express";
import path from "path";
import fs from "fs";

export function log(message: string) {
  console.log(message);
}

export async function setupVite(app: Express, _server: any) {
  const { createServer: createViteServer } = await import("vite");

  const vite = await createViteServer({
    appType: "custom",
    server: { middlewareMode: true },
  });

  app.use(vite.middlewares);

  // Alles außer /api zu Vite/SPA routen
  app.use(async (req, res, next) => {
    try {
      if (req.originalUrl.startsWith("/api")) return next();

      const url = req.originalUrl;
      const indexPath = path.resolve(process.cwd(), "index.html");

      let html = fs.readFileSync(indexPath, "utf-8");
      html = await vite.transformIndexHtml(url, html);

      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    } catch (e) {
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(process.cwd(), "dist/public");
  const indexHtml = path.join(distPath, "index.html");

  app.use(express.static(distPath));

  // Alles außer /api -> SPA index.html
  app.get("*", (req, res, next) => {
    if (req.originalUrl.startsWith("/api")) return next();
    res.sendFile(indexHtml);
  });
}
