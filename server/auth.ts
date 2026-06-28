import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
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
  const { password, ...safeUser } = user;
  return safeUser;
}

function getEnvAdminCredentials() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return null;
  return { email, password };
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

        // Robuster Admin-Login:
        // Wenn die eingegebenen Werte exakt den Render-ENV-Werten entsprechen,
        // wird der Admin sofort erstellt/aktualisiert und eingeloggt.
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

  app.post("/api/register", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, passwordConfirm } = req.body || {};
      const normalizedEmail = String(email || "").trim().toLowerCase();

      if (!normalizedEmail || !password || !passwordConfirm) {
        return res.status(400).json({
          message: "E-Mail, Passwort und Passwortbestätigung sind erforderlich",
        });
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

      const newUser = await storage.createUser({
        email: normalizedEmail,
        password: await hashPassword(password),
        status: "active",
        isAdmin: false,
      });

      req.login(newUser, (err) => {
        if (err) return next(err);
        res.status(201).json(sanitizeUser(newUser));
      });
    } catch (error) {
      console.error("Fehler bei der Registrierung:", error);
      res.status(500).json({ message: "Interner Serverfehler" });
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
