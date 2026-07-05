import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual, createHash } from "crypto";
import { promisify } from "util";
import { eq } from "drizzle-orm";
import nodemailer from "nodemailer";
import { storage } from "./storage";
import { db } from "./db";
import { jobListings, users } from "@shared/schema";
import type { User as AppUser } from "@shared/schema";

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function comparePasswords(supplied: string, stored: string) {
  try {
    const [hashed, salt] = stored.split(".");
    if (!hashed || !salt) return false;
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    if (hashedBuf.length !== suppliedBuf.length) return false;
    return timingSafeEqual(hashedBuf, suppliedBuf);
  } catch {
    return false;
  }
}

function sanitizeUser(user: AppUser) {
  const { password, emailVerificationToken, emailVerificationExpires, ...safeUser } = user as any;
  return safeUser;
}

function getEnvAdminCredentials() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return null;
  return { email, password };
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function createVerificationToken() {
  const token = randomBytes(32).toString("hex");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return { token, tokenHash, expires };
}

function getAppUrl(req?: Request) {
  const configuredUrl = process.env.APP_URL?.trim().replace(/\/$/, "");
  if (configuredUrl) return configuredUrl;

  if (req) {
    const protocol = req.headers["x-forwarded-proto"] || req.protocol || "https";
    return `${protocol}://${req.get("host")}`.replace(/\/$/, "");
  }

  return "http://localhost:5000";
}

function getMailConfig() {
  const host = process.env.SMTP_HOST?.trim();
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS;
  const from = process.env.MAIL_FROM?.trim() || user;

  if (!host || !user || !pass || !from) return null;
  return { host, port, user, pass, from };
}

async function sendVerificationEmail(email: string, token: string, req?: Request) {
  const config = getMailConfig();
  if (!config) {
    throw new Error("SMTP ist nicht konfiguriert. Bitte SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS und MAIL_FROM setzen.");
  }

  const appUrl = getAppUrl(req);
  const verifyUrl = `${appUrl}/api/verify-email?token=${encodeURIComponent(token)}`;
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });

  await transporter.sendMail({
    from: config.from,
    to: email,
    subject: "speedjob.at – E-Mail-Adresse bestätigen",
    text: `Bitte bestätigen Sie Ihre E-Mail-Adresse für speedjob.at. Öffnen Sie diesen Link: ${verifyUrl}\n\nDer Link ist 24 Stunden gültig.`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
        <h2 style="margin:0 0 12px;color:#111827">E-Mail-Adresse bestätigen</h2>
        <p>Bitte bestätigen Sie Ihre E-Mail-Adresse für <strong>speedjob.at</strong>.</p>
        <p>
          <a href="${verifyUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;padding:12px 18px;border-radius:8px;text-decoration:none;font-weight:bold">
            E-Mail bestätigen
          </a>
        </p>
        <p>Der Link ist 24 Stunden gültig.</p>
        <p style="font-size:13px;color:#6b7280">Falls der Button nicht funktioniert, kopieren Sie diesen Link in Ihren Browser:<br>${verifyUrl}</p>
      </div>
    `,
  });
}

async function upsertEnvAdminUser() {
  const admin = getEnvAdminCredentials();
  if (!admin) {
    console.warn("ADMIN_EMAIL/ADMIN_PASSWORD nicht gesetzt – Admin wird nicht automatisch erstellt.");
    return null;
  }

  const passwordHash = await hashPassword(admin.password);
  const existingAdmin = await storage.getUserByEmail(admin.email);

  if (!existingAdmin) {
    const created = await storage.createUser({
      email: admin.email,
      password: passwordHash,
      status: "active",
      isAdmin: true,
      emailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpires: null,
    });
    console.log(`Admin-Benutzer erstellt: ${admin.email}`);
    return created;
  }

  const updated = await storage.updateUser(existingAdmin.id, {
    password: passwordHash,
    status: "active",
    isAdmin: true,
    emailVerified: true,
    emailVerificationToken: null,
    emailVerificationExpires: null,
  });
  console.log(`Admin-Benutzer aktualisiert: ${admin.email}`);
  return updated || existingAdmin;
}

export function setupAuth(app: Express) {
  const isProduction = process.env.NODE_ENV === "production";
  const sessionSecret = process.env.SESSION_SECRET || randomBytes(32).toString("hex");

  if (isProduction && !process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET muss in Produktion gesetzt sein.");
  }

  app.set("trust proxy", 1);
  app.use(
    session({
      name: "speedjobs.sid",
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      store: storage.sessionStore,
      cookie: {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000,
        path: "/",
      },
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
      try {
        const normalizedEmail = String(email || "").trim().toLowerCase();
        const admin = getEnvAdminCredentials();

        if (admin && normalizedEmail === admin.email && password === admin.password) {
          const adminUser = await upsertEnvAdminUser();
          if (!adminUser) {
            return done(null, false, { message: "Admin-Zugang ist nicht konfiguriert" });
          }
          return done(null, adminUser);
        }

        const user = await storage.getUserByEmail(normalizedEmail);
        if (!user) {
          return done(null, false, { message: "Ungültige E-Mail-Adresse oder Passwort" });
        }

        if (user.status !== "active") {
          return done(null, false, {
            message: "Ihr Konto ist gesperrt. Bitte kontaktieren Sie den Support.",
          });
        }

        if (!(await comparePasswords(password, user.password))) {
          return done(null, false, { message: "Ungültige E-Mail-Adresse oder Passwort" });
        }

        if (!user.isAdmin && (user as any).emailVerified === false) {
          return done(null, false, {
            message: "Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse. Prüfen Sie Ihr Postfach oder fordern Sie eine neue Bestätigungs-E-Mail an.",
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user: any, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      done(null, (await storage.getUser(Number(id))) || undefined);
    } catch (error) {
      done(error);
    }
  });

  upsertEnvAdminUser().catch((error) =>
    console.error("Admin-Bootstrap fehlgeschlagen:", error),
  );

  app.post("/api/register", async (req: Request, res: Response) => {
    try {
      const { email, password, passwordConfirm } = req.body || {};
      const normalizedEmail = String(email || "").trim().toLowerCase();

      if (!normalizedEmail || !password || !passwordConfirm) {
        return res.status(400).json({
          message: "E-Mail, Passwort und Passwortbestätigung sind erforderlich",
        });
      }

      if (!isValidEmail(normalizedEmail)) {
        return res.status(400).json({ message: "Bitte geben Sie eine gültige E-Mail-Adresse ein" });
      }

      if (password !== passwordConfirm) {
        return res.status(400).json({ message: "Passwörter stimmen nicht überein" });
      }

      if (String(password).length < 8) {
        return res.status(400).json({
          message: "Passwort muss mindestens 8 Zeichen haben",
        });
      }

      if (await storage.getBannedEmail(normalizedEmail)) {
        return res.status(403).json({ message: "Diese E-Mail-Adresse ist gesperrt" });
      }

      if (await storage.getUserByEmail(normalizedEmail)) {
        return res.status(400).json({
          message: "Ein Benutzer mit dieser E-Mail-Adresse existiert bereits",
        });
      }

      const verification = createVerificationToken();
      const newUser = await storage.createUser({
        email: normalizedEmail,
        password: await hashPassword(password),
        status: "active",
        isAdmin: false,
        emailVerified: false,
        emailVerificationToken: verification.tokenHash,
        emailVerificationExpires: verification.expires,
      });

      try {
        await sendVerificationEmail(normalizedEmail, verification.token, req);
      } catch (mailError) {
        console.error("Bestätigungs-E-Mail konnte nicht gesendet werden:", mailError);
        await storage.deleteUser(newUser.id);
        return res.status(500).json({
          message: "Registrierung aktuell nicht möglich, weil der E-Mail-Versand nicht konfiguriert ist.",
        });
      }

      return res.status(201).json({
        message: "Registrierung erfolgreich. Bitte bestätigen Sie Ihre E-Mail-Adresse über den Link in Ihrem Postfach.",
        requiresEmailVerification: true,
        email: normalizedEmail,
      });
    } catch (error) {
      console.error("Fehler bei der Registrierung:", error);
      res.status(500).json({ message: "Interner Serverfehler" });
    }
  });

  app.post("/api/resend-verification", async (req: Request, res: Response) => {
    try {
      const normalizedEmail = String(req.body?.email || "").trim().toLowerCase();
      if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
        return res.status(400).json({ message: "Bitte geben Sie eine gültige E-Mail-Adresse ein" });
      }

      const user = await storage.getUserByEmail(normalizedEmail);
      if (!user || user.emailVerified || user.isAdmin) {
        return res.json({ message: "Falls ein unverifiziertes Konto existiert, wurde eine neue Bestätigungs-E-Mail gesendet." });
      }

      const verification = createVerificationToken();
      await storage.updateUser(user.id, {
        emailVerificationToken: verification.tokenHash,
        emailVerificationExpires: verification.expires,
      });
      await sendVerificationEmail(normalizedEmail, verification.token, req);

      return res.json({ message: "Eine neue Bestätigungs-E-Mail wurde gesendet." });
    } catch (error) {
      console.error("Fehler beim erneuten Senden der Bestätigungs-E-Mail:", error);
      res.status(500).json({ message: "Bestätigungs-E-Mail konnte nicht gesendet werden" });
    }
  });

  app.get("/api/verify-email", async (req: Request, res: Response) => {
    try {
      const token = String(req.query.token || "");
      if (!token) {
        return res.redirect("/auth?verified=missing");
      }

      const tokenHash = createHash("sha256").update(token).digest("hex");
      const [user] = await db.select().from(users).where(eq(users.emailVerificationToken, tokenHash)).limit(1);

      if (!user) {
        return res.redirect("/auth?verified=invalid");
      }

      if (!user.emailVerificationExpires || user.emailVerificationExpires.getTime() < Date.now()) {
        return res.redirect(`/auth?verified=expired&email=${encodeURIComponent(user.email)}`);
      }

      await storage.updateUser(user.id, {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      });

      return res.redirect("/auth?verified=success");
    } catch (error) {
      console.error("Fehler bei der E-Mail-Bestätigung:", error);
      return res.redirect("/auth?verified=error");
    }
  });

  app.post("/api/login", (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("local", (err: any, user: AppUser | false, info: any) => {
      if (err) return res.status(500).json({ message: "Interner Serverfehler" });
      if (!user) {
        return res.status(401).json({
          message: info?.message || "Anmeldung fehlgeschlagen",
        });
      }

      req.login(user, (loginErr) => {
        if (loginErr) return next(loginErr);
        req.session.save((saveErr) => {
          if (saveErr) {
            return res.status(500).json({ message: "Fehler beim Speichern der Sitzung" });
          }
          res.json(sanitizeUser(user));
        });
      });
    })(req, res, next);
  });

  app.post("/api/change-email", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const currentUser = req.user as AppUser;
      const normalizedEmail = String(req.body?.email || "").trim().toLowerCase();
      const password = String(req.body?.password || "");

      if (!normalizedEmail || !password) {
        return res.status(400).json({ message: "Neue E-Mail-Adresse und aktuelles Passwort sind erforderlich" });
      }

      if (!isValidEmail(normalizedEmail)) {
        return res.status(400).json({ message: "Bitte geben Sie eine gültige E-Mail-Adresse ein" });
      }

      const freshUser = await storage.getUser(currentUser.id);
      if (!freshUser) {
        return res.status(404).json({ message: "Benutzerkonto nicht gefunden" });
      }

      if (!(await comparePasswords(password, freshUser.password))) {
        return res.status(401).json({ message: "Aktuelles Passwort ist falsch" });
      }

      const existingUser = await storage.getUserByEmail(normalizedEmail);
      if (existingUser && existingUser.id !== freshUser.id) {
        return res.status(400).json({ message: "Diese E-Mail-Adresse wird bereits verwendet" });
      }

      if (await storage.getBannedEmail(normalizedEmail)) {
        return res.status(403).json({ message: "Diese E-Mail-Adresse ist gesperrt" });
      }

      const verification = createVerificationToken();
      const updatedUser = await storage.updateUser(freshUser.id, {
        email: normalizedEmail,
        emailVerified: false,
        emailVerificationToken: verification.tokenHash,
        emailVerificationExpires: verification.expires,
      });
      if (!updatedUser) {
        return res.status(500).json({ message: "E-Mail-Adresse konnte nicht geändert werden" });
      }

      try {
        await sendVerificationEmail(normalizedEmail, verification.token, req);
      } catch (mailError) {
        console.error("Bestätigungs-E-Mail konnte nicht gesendet werden:", mailError);
        return res.status(500).json({ message: "E-Mail-Adresse wurde geändert, aber die Bestätigungs-E-Mail konnte nicht gesendet werden. Bitte Support kontaktieren." });
      }

      const profile = await storage.getProfileByUserId(freshUser.id);
      if (profile) {
        await storage.updateProfile(profile.id, { email: normalizedEmail });
      }

      await db
        .update(jobListings)
        .set({ contactInfo: normalizedEmail })
        .where(eq(jobListings.userId, freshUser.id));

      req.login(updatedUser, (loginErr) => {
        if (loginErr) return next(loginErr);
        req.session.save((saveErr) => {
          if (saveErr) return next(saveErr);
          return res.json({
            message: "E-Mail-Adresse geändert. Bitte bestätigen Sie die neue E-Mail-Adresse über den Link in Ihrem Postfach.",
            user: sanitizeUser(updatedUser),
          });
        });
      });
    } catch (error) {
      console.error("Fehler beim Ändern der E-Mail-Adresse:", error);
      res.status(500).json({ message: "Serverfehler beim Ändern der E-Mail-Adresse" });
    }
  });

  app.post("/api/change-password", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const currentUser = req.user as AppUser;
      const currentPassword = String(req.body?.currentPassword || "");
      const newPassword = String(req.body?.newPassword || "");

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Aktuelles Passwort und neues Passwort sind erforderlich" });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({ message: "Neues Passwort muss mindestens 8 Zeichen haben" });
      }

      const freshUser = await storage.getUser(currentUser.id);
      if (!freshUser) {
        return res.status(404).json({ message: "Benutzerkonto nicht gefunden" });
      }

      if (!(await comparePasswords(currentPassword, freshUser.password))) {
        return res.status(401).json({ message: "Aktuelles Passwort ist falsch" });
      }

      const updatedUser = await storage.updateUser(freshUser.id, {
        password: await hashPassword(newPassword),
      });

      if (!updatedUser) {
        return res.status(500).json({ message: "Passwort konnte nicht geändert werden" });
      }

      res.json({ message: "Passwort erfolgreich geändert" });
    } catch (error) {
      console.error("Fehler beim Ändern des Passworts:", error);
      res.status(500).json({ message: "Serverfehler beim Ändern des Passworts" });
    }
  });

  app.delete("/api/delete-account", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const currentUser = req.user as AppUser;
      const deleted = await storage.deleteUser(currentUser.id);

      if (!deleted) {
        return res.status(500).json({ message: "Konto konnte nicht gelöscht werden" });
      }

      req.logout((logoutErr) => {
        if (logoutErr) return next(logoutErr);
        req.session.destroy((destroyErr) => {
          if (destroyErr) return next(destroyErr);
          res.clearCookie("speedjobs.sid");
          return res.json({ message: "Konto erfolgreich gelöscht" });
        });
      });
    } catch (error) {
      console.error("Fehler beim Löschen des Kontos:", error);
      res.status(500).json({ message: "Serverfehler beim Löschen des Kontos" });
    }
  });

  app.post("/api/logout", (req: Request, res: Response, next: NextFunction) => {
    req.logout((err) => {
      if (err) return next(err);
      req.session.destroy((destroyErr) => {
        if (destroyErr) return next(destroyErr);
        res.clearCookie("speedjobs.sid");
        res.sendStatus(200);
      });
    });
  });

  app.get("/api/user", (req: Request, res: Response) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Nicht authentifiziert" });
    }
    res.json(sanitizeUser(req.user as AppUser));
  });
}

export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: "Nicht authentifiziert" });
  }

  const user = req.user as AppUser;
  if (!user.isAdmin && (user as any).emailVerified === false) {
    return res.status(403).json({ message: "Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse." });
  }

  return next();
}

export function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated() && req.user && (req.user as AppUser).isAdmin) return next();
  return res.status(403).json({ message: "Administratorrechte erforderlich" });
}

declare global {
  namespace Express {
    interface User extends AppUser {}
  }
}
