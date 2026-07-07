import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { eq } from "drizzle-orm";
import nodemailer from "nodemailer";
import { storage } from "./storage";
import { db } from "./db";
import { jobListings } from "@shared/schema";
import type { User as AppUser } from "@shared/schema";

const scryptAsync = promisify(scrypt);

type PendingRegistration = {
  email: string;
  passwordHash: string;
  code: string;
  expiresAt: number;
  attempts: number;
};

const pendingRegistrations = new Map<string, PendingRegistration>();

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
  const { password, ...safeUser } = user;
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

function createRegistrationCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function parseMailFrom() {
  const raw = process.env.MAIL_FROM?.trim() || process.env.SMTP_USER?.trim() || "";
  const match = raw.match(/^(.*)<([^>]+)>$/);

  if (match) {
    return {
      name: match[1].trim().replace(/^['\"]|['\"]$/g, "") || "speedjob.at",
      email: match[2].trim(),
      raw,
    };
  }

  return {
    name: "speedjob.at",
    email: raw,
    raw,
  };
}

function getMailConfig() {
  const host = process.env.SMTP_HOST?.trim();
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.replace(/\s+/g, "");
  const from = process.env.MAIL_FROM?.trim() || user;

  if (!host || !user || !pass || !from) return null;
  return { host, port, user, pass, from };
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), timeoutMs);
    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

function readableMailError(error: unknown) {
  const raw = error instanceof Error ? error.message : String(error || "");
  const lower = raw.toLowerCase();

  if (lower.includes("brevo") || lower.includes("unauthorized") || lower.includes("api key")) {
    return "Brevo API fehlgeschlagen. Bitte BREVO_API_KEY und verifizierte MAIL_FROM-Adresse prüfen.";
  }

  if (lower.includes("sender") || lower.includes("from") || lower.includes("not verified")) {
    return "Absender nicht verifiziert. Bitte die MAIL_FROM-Adresse in Brevo unter Absender verifizieren.";
  }

  if (lower.includes("timeout") || lower.includes("timed out")) {
    return "Der E-Mail-Server antwortet nicht. Bitte SMTP_HOST, SMTP_PORT und Render-ENV prüfen oder BREVO_API_KEY verwenden.";
  }

  if (lower.includes("invalid login") || lower.includes("authentication") || lower.includes("username and password")) {
    return "SMTP Login fehlgeschlagen. Bitte SMTP_USER und SMTP_PASS prüfen.";
  }

  if (lower.includes("self signed") || lower.includes("certificate")) {
    return "SMTP-Zertifikatfehler. Bitte SMTP_HOST/SMTP_PORT prüfen.";
  }

  return raw || "E-Mail konnte nicht gesendet werden.";
}

function registrationMailHtml(code: string) {
  return `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
      <h2 style="margin:0 0 12px;color:#111827">speedjob.at Registrierung</h2>
      <p>Ihr Registrierungscode lautet:</p>
      <div style="font-size:28px;font-weight:bold;letter-spacing:6px;background:#f3f4f6;padding:14px 18px;border-radius:8px;display:inline-block">${code}</div>
      <p>Der Code ist 15 Minuten gültig.</p>
      <p style="font-size:13px;color:#6b7280">Falls Sie sich nicht bei speedjob.at registriert haben, können Sie diese E-Mail ignorieren.</p>
    </div>
  `;
}

async function sendWithBrevoApi(email: string, code: string) {
  const apiKey = process.env.BREVO_API_KEY?.trim();
  if (!apiKey) return false;

  const sender = parseMailFrom();
  if (!sender.email || !sender.email.includes("@")) {
    throw new Error("MAIL_FROM fehlt oder ist ungültig. Beispiel: Speedjob <kontakt@speedjob.at>");
  }

  const response = await withTimeout(
    fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: sender.name, email: sender.email },
        to: [{ email }],
        subject: "speedjob.at – Registrierungscode",
        textContent: `Ihr Registrierungscode für speedjob.at lautet: ${code}\n\nDer Code ist 15 Minuten gültig.`,
        htmlContent: registrationMailHtml(code),
      }),
    }),
    12000,
    "Brevo API Timeout nach 12 Sekunden",
  );

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Brevo API Fehler ${response.status}: ${text}`);
  }

  return true;
}

async function sendWithSmtp(email: string, code: string) {
  const config = getMailConfig();
  if (!config) {
    throw new Error("E-Mail-Versand ist nicht eingerichtet. Bitte BREVO_API_KEY oder SMTP-Daten auf Render setzen.");
  }

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    requireTLS: config.port === 587,
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 10000,
    auth: {
      user: config.user,
      pass: config.pass,
    },
    tls: {
      servername: config.host,
    },
  });

  await withTimeout(
    transporter.sendMail({
      from: config.from,
      to: email,
      subject: "speedjob.at – Registrierungscode",
      text: `Ihr Registrierungscode für speedjob.at lautet: ${code}\n\nDer Code ist 15 Minuten gültig.`,
      html: registrationMailHtml(code),
    }),
    12000,
    "SMTP Versand Timeout nach 12 Sekunden",
  );
}

async function sendRegistrationCode(email: string, code: string) {
  try {
    const sentViaBrevo = await sendWithBrevoApi(email, code);
    if (sentViaBrevo) return;
    await sendWithSmtp(email, code);
  } catch (error) {
    console.error("E-Mail Versand Fehler:", error);
    throw new Error(readableMailError(error));
  }
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
    });
    console.log(`Admin-Benutzer erstellt: ${admin.email}`);
    return created;
  }

  const updated = await storage.updateUser(existingAdmin.id, {
    password: passwordHash,
    status: "active",
    isAdmin: true,
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
          if (!adminUser) return done(null, false, { message: "Admin-Zugang ist nicht konfiguriert" });
          return done(null, adminUser);
        }

        const user = await storage.getUserByEmail(normalizedEmail);
        if (!user) return done(null, false, { message: "Ungültige E-Mail-Adresse oder Passwort" });
        if (user.status !== "active") return done(null, false, { message: "Ihr Konto ist gesperrt. Bitte kontaktieren Sie den Support." });
        if (!(await comparePasswords(password, user.password))) return done(null, false, { message: "Ungültige E-Mail-Adresse oder Passwort" });
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

  upsertEnvAdminUser().catch((error) => console.error("Admin-Bootstrap fehlgeschlagen:", error));

  app.post("/api/register", async (req: Request, res: Response) => {
    try {
      const { email, password, passwordConfirm } = req.body || {};
      const normalizedEmail = String(email || "").trim().toLowerCase();

      if (!normalizedEmail || !password || !passwordConfirm) return res.status(400).json({ message: "E-Mail, Passwort und Passwortbestätigung sind erforderlich" });
      if (!isValidEmail(normalizedEmail)) return res.status(400).json({ message: "Bitte geben Sie eine gültige E-Mail-Adresse ein" });
      if (password !== passwordConfirm) return res.status(400).json({ message: "Passwörter stimmen nicht überein" });
      if (String(password).length < 8) return res.status(400).json({ message: "Passwort muss mindestens 8 Zeichen haben" });
      if (await storage.getBannedEmail(normalizedEmail)) return res.status(403).json({ message: "Diese E-Mail-Adresse ist gesperrt" });
      if (await storage.getUserByEmail(normalizedEmail)) return res.status(400).json({ message: "Ein Benutzer mit dieser E-Mail-Adresse existiert bereits" });

      const code = createRegistrationCode();
      pendingRegistrations.set(normalizedEmail, {
        email: normalizedEmail,
        passwordHash: await hashPassword(password),
        code,
        expiresAt: Date.now() + 15 * 60 * 1000,
        attempts: 0,
      });

      await sendRegistrationCode(normalizedEmail, code);
      return res.status(200).json({
        requiresCode: true,
        email: normalizedEmail,
        message: "Wir haben Ihnen einen 6-stelligen Bestätigungscode per E-Mail gesendet. Bitte geben Sie den Code ein, um Ihr Konto zu erstellen.",
      });
    } catch (error) {
      console.error("Fehler bei der Registrierung:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Interner Serverfehler" });
    }
  });

  app.post("/api/resend-registration-code", async (req: Request, res: Response) => {
    try {
      const normalizedEmail = String(req.body?.email || "").trim().toLowerCase();
      const pending = pendingRegistrations.get(normalizedEmail);
      if (!pending) return res.status(404).json({ message: "Keine offene Registrierung für diese E-Mail-Adresse gefunden" });
      if (await storage.getUserByEmail(normalizedEmail)) {
        pendingRegistrations.delete(normalizedEmail);
        return res.status(400).json({ message: "Ein Benutzer mit dieser E-Mail-Adresse existiert bereits" });
      }

      const code = createRegistrationCode();
      pending.code = code;
      pending.expiresAt = Date.now() + 15 * 60 * 1000;
      pending.attempts = 0;
      pendingRegistrations.set(normalizedEmail, pending);

      await sendRegistrationCode(normalizedEmail, code);
      return res.json({ message: "Ein neuer Code wurde per E-Mail gesendet." });
    } catch (error) {
      console.error("Fehler beim erneuten Senden des Codes:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Code konnte nicht erneut gesendet werden" });
    }
  });

  app.post("/api/confirm-registration", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const normalizedEmail = String(req.body?.email || "").trim().toLowerCase();
      const code = String(req.body?.code || "").trim();
      const pending = pendingRegistrations.get(normalizedEmail);

      if (!pending) return res.status(404).json({ message: "Keine offene Registrierung gefunden. Bitte registrieren Sie sich erneut." });
      if (pending.expiresAt < Date.now()) {
        pendingRegistrations.delete(normalizedEmail);
        return res.status(400).json({ message: "Der Code ist abgelaufen. Bitte registrieren Sie sich erneut." });
      }

      pending.attempts += 1;
      if (pending.attempts > 5) {
        pendingRegistrations.delete(normalizedEmail);
        return res.status(429).json({ message: "Zu viele falsche Versuche. Bitte registrieren Sie sich erneut." });
      }

      if (pending.code !== code) {
        pendingRegistrations.set(normalizedEmail, pending);
        return res.status(400).json({ message: "Der eingegebene Code ist falsch" });
      }

      if (await storage.getUserByEmail(normalizedEmail)) {
        pendingRegistrations.delete(normalizedEmail);
        return res.status(400).json({ message: "Ein Benutzer mit dieser E-Mail-Adresse existiert bereits" });
      }

      const newUser = await storage.createUser({ email: normalizedEmail, password: pending.passwordHash, status: "active", isAdmin: false });
      pendingRegistrations.delete(normalizedEmail);

      req.login(newUser, (err) => {
        if (err) return next(err);
        req.session.save((saveErr) => {
          if (saveErr) return next(saveErr);
          return res.status(201).json({ message: "E-Mail bestätigt. Ihr Konto wurde erstellt.", user: sanitizeUser(newUser) });
        });
      });
    } catch (error) {
      console.error("Fehler bei der Code-Bestätigung:", error);
      res.status(500).json({ message: "Interner Serverfehler" });
    }
  });

  app.post("/api/login", (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("local", (err: any, user: AppUser | false, info: any) => {
      if (err) return res.status(500).json({ message: "Interner Serverfehler" });
      if (!user) return res.status(401).json({ message: info?.message || "Anmeldung fehlgeschlagen" });
      req.login(user, (loginErr) => {
        if (loginErr) return next(loginErr);
        req.session.save((saveErr) => {
          if (saveErr) return res.status(500).json({ message: "Fehler beim Speichern der Sitzung" });
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

      if (!normalizedEmail || !password) return res.status(400).json({ message: "Neue E-Mail-Adresse und aktuelles Passwort sind erforderlich" });
      if (!isValidEmail(normalizedEmail)) return res.status(400).json({ message: "Bitte geben Sie eine gültige E-Mail-Adresse ein" });

      const freshUser = await storage.getUser(currentUser.id);
      if (!freshUser) return res.status(404).json({ message: "Benutzerkonto nicht gefunden" });
      if (!(await comparePasswords(password, freshUser.password))) return res.status(401).json({ message: "Aktuelles Passwort ist falsch" });

      const existingUser = await storage.getUserByEmail(normalizedEmail);
      if (existingUser && existingUser.id !== freshUser.id) return res.status(400).json({ message: "Diese E-Mail-Adresse wird bereits verwendet" });
      if (await storage.getBannedEmail(normalizedEmail)) return res.status(403).json({ message: "Diese E-Mail-Adresse ist gesperrt" });

      const updatedUser = await storage.updateUser(freshUser.id, { email: normalizedEmail });
      if (!updatedUser) return res.status(500).json({ message: "E-Mail-Adresse konnte nicht geändert werden" });

      const profile = await storage.getProfileByUserId(freshUser.id);
      if (profile) await storage.updateProfile(profile.id, { email: normalizedEmail });
      await db.update(jobListings).set({ contactInfo: normalizedEmail }).where(eq(jobListings.userId, freshUser.id));

      req.login(updatedUser, (loginErr) => {
        if (loginErr) return next(loginErr);
        req.session.save((saveErr) => {
          if (saveErr) return next(saveErr);
          return res.json({ message: "E-Mail-Adresse erfolgreich geändert", user: sanitizeUser(updatedUser) });
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

      if (!currentPassword || !newPassword) return res.status(400).json({ message: "Aktuelles Passwort und neues Passwort sind erforderlich" });
      if (newPassword.length < 8) return res.status(400).json({ message: "Neues Passwort muss mindestens 8 Zeichen haben" });

      const freshUser = await storage.getUser(currentUser.id);
      if (!freshUser) return res.status(404).json({ message: "Benutzerkonto nicht gefunden" });
      if (!(await comparePasswords(currentPassword, freshUser.password))) return res.status(401).json({ message: "Aktuelles Passwort ist falsch" });

      const updatedUser = await storage.updateUser(freshUser.id, { password: await hashPassword(newPassword) });
      if (!updatedUser) return res.status(500).json({ message: "Passwort konnte nicht geändert werden" });
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
      if (!deleted) return res.status(500).json({ message: "Konto konnte nicht gelöscht werden" });

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
    if (!req.isAuthenticated() || !req.user) return res.status(401).json({ message: "Nicht authentifiziert" });
    res.json(sanitizeUser(req.user as AppUser));
  });
}

export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated() && req.user) return next();
  return res.status(401).json({ message: "Nicht authentifiziert" });
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
