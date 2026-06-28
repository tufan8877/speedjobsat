import { Express, Request, Response, NextFunction } from "express";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { users, type User as AppUser } from "@shared/schema";
import { storage } from "./storage";
import { isAuthenticated } from "./auth";
import { sendVerificationEmail } from "./email";
import { createVerificationData } from "./verification";

function appUrl() {
  return (process.env.APP_URL || process.env.PUBLIC_APP_URL || "https://speedjobs.at").replace(/\/$/, "");
}

export function requireEmailVerified(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: "Nicht authentifiziert" });
  }

  const user = req.user as AppUser;
  if (user.isAdmin || (user as any).emailVerified) {
    return next();
  }

  return res.status(403).json({
    code: "EMAIL_NOT_VERIFIED",
    message: "Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse. Danach können Sie diese Funktion nutzen.",
  });
}

export function setupEmailVerificationRoutes(app: Express) {
  app.get("/api/verify-email", async (req: Request, res: Response) => {
    try {
      const token = String(req.query.token || "").trim();
      if (!token) return res.redirect(`${appUrl()}/auth?verified=missing`);

      const [user] = await db.select().from(users).where(eq(users.emailVerificationToken, token)).limit(1);
      if (!user) return res.redirect(`${appUrl()}/auth?verified=invalid`);

      if (user.emailVerificationExpires && new Date(user.emailVerificationExpires).getTime() < Date.now()) {
        return res.redirect(`${appUrl()}/auth?verified=expired`);
      }

      await storage.updateUser(user.id, {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      } as any);

      return res.redirect(`${appUrl()}/profil?verified=success`);
    } catch (error) {
      console.error("Fehler bei der E-Mail-Verifizierung:", error);
      return res.redirect(`${appUrl()}/auth?verified=error`);
    }
  });

  app.post("/api/resend-verification", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user as AppUser;
      if (user.isAdmin || (user as any).emailVerified) {
        return res.json({ message: "E-Mail-Adresse ist bereits bestätigt" });
      }

      const data = createVerificationData();
      await storage.updateUser(user.id, data as any);
      await sendVerificationEmail(user.email, data.emailVerificationToken);

      res.json({ message: "Verifizierungs-E-Mail wurde erneut gesendet" });
    } catch (error) {
      console.error("Verifizierungs-E-Mail konnte nicht gesendet werden:", error);
      res.status(500).json({ message: "Verifizierungs-E-Mail konnte nicht gesendet werden" });
    }
  });
}
