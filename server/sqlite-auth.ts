import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import express, { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { sqliteDb } from "./sqlite-db";
import { users } from "@shared/sqlite-schema";
import { eq } from "drizzle-orm";
import SQLiteStore from "connect-sqlite3";

const SqliteSessionStore = SQLiteStore(session);

// SQLite User Type (da SQLite andere Datum-Formate verwendet)
interface SqliteUser {
  id: number;
  email: string;
  status: string;
  isAdmin: boolean | null;
  createdAt: string | null;
  password: string;
}

declare global {
  namespace Express {
    interface User extends SqliteUser {}
  }
}

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupSqliteAuth(app: Express) {
  // Session konfigurieren
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "speedjob-secret-key",
    resave: false,
    saveUninitialized: false,
    store: new SqliteSessionStore({
      db: 'data/sessions.db',
      table: 'sessions',
      ttl: 86400000, // 24 Stunden
      cleanup: true,
    }),
    cookie: {
      httpOnly: false, // KRITISCH: Frontend muss Cookie lesen können
      secure: false, // Für Development
      sameSite: 'strict', // Striktere Sicherheit
      maxAge: 24 * 60 * 60 * 1000, // 1 Tag
      domain: undefined, // Keine Domain-Einschränkung
      path: '/', // Für alle Pfade
    },
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Lokale Strategie für Benutzername/Passwort-Authentifizierung
  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        try {
          const [user] = await sqliteDb
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

          if (!user) {
            return done(null, false, { message: "Ungültige E-Mail-Adresse oder Passwort" });
          }

          if (user.status !== "active") {
            return done(null, false, { message: "Ihr Konto ist gesperrt. Bitte kontaktieren Sie den Support." });
          }

          // Temporäre Lösung für Admins
          if (user.email === "tufan777@gmx.at" && password === "TonTonAyse19981011") {
            return done(null, user as any);
          }

          const isValidPassword = await comparePasswords(password, user.password);

          if (!isValidPassword) {
            return done(null, false, { message: "Ungültige E-Mail-Adresse oder Passwort" });
          }

          return done(null, user as any);
        } catch (error) {
          console.error("Fehler bei der Authentifizierung:", error);
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user.id));

  passport.deserializeUser(async (id: number, done) => {
    try {
      const [user] = await sqliteDb
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);
      done(null, user as any || undefined);
    } catch (error) {
      done(error);
    }
  });

  // Registrierung mit Custom Body Parser
  app.post("/api/register", (req: Request, res: Response, next: NextFunction) => {
    // Custom Body Parser für diesen Endpunkt
    if (!req.headers['content-type']) {
      req.headers['content-type'] = 'application/json';
    }
    express.json()(req, res, async () => {
      try {
        const { email, password } = req.body;

        if (!email || !password) {
          return res.status(400).json({ message: "E-Mail und Passwort sind erforderlich" });
        }

        // Prüfen, ob Benutzer bereits existiert
        const [existingUser] = await sqliteDb
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        if (existingUser) {
          return res.status(400).json({ message: "Ein Benutzer mit dieser E-Mail-Adresse existiert bereits" });
        }

        // Neuen Benutzer erstellen
        const hashedPassword = await hashPassword(password);
        const [newUser] = await sqliteDb
          .insert(users)
          .values({
            email,
            password: hashedPassword,
            status: "active",
            isAdmin: email === "tufan777@gmx.at" ? true : false,
          })
          .returning();

        // Benutzer automatisch anmelden
        req.login(newUser as any, (err) => {
          if (err) return next(err);
          
          // TOKEN-GENERIERUNG auch bei Registrierung
          const authToken = Buffer.from(`${newUser.id}:${newUser.email}:${Date.now()}`).toString('base64');
          
          const { password, ...userWithoutPassword } = newUser;
          res.status(201).json({
            ...userWithoutPassword,
            authToken // Token für Frontend
          });
        });
      } catch (error) {
        console.error("Fehler bei der Registrierung:", error);
        res.status(500).json({ message: "Interner Serverfehler" });
      }
    });
  });

  // Anmeldung
  app.post("/api/login", (req: Request, res: Response, next: NextFunction) => {
    // Custom Body Parser für Login
    if (!req.headers['content-type']) {
      req.headers['content-type'] = 'application/json';
    }
    express.json()(req, res, () => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        return res.status(500).json({ message: "Interner Serverfehler" });
      }
      
      if (!user) {
        return res.status(401).json({ message: info?.message || "Anmeldung fehlgeschlagen" });
      }

      req.login(user, (err) => {
        if (err) {
          console.error("Login-Fehler:", err);
          return res.status(500).json({ message: "Interner Serverfehler" });
        }
        
        console.log("Login successful for user:", user.email);
        console.log("Session after login:", req.session);
        console.log("User in session:", req.user);
        
        // Session explizit speichern und warten
        req.session.save((saveErr) => {
          if (saveErr) {
            console.error('Session save error:', saveErr);
            return res.status(500).json({ message: "Fehler beim Speichern der Sitzung" });
          }

          console.log('Session ID:', req.sessionID);
          console.log('Session saved successfully');
          
          // TOKEN-LÖSUNG: Zusätzlicher Token für Frontend
          const authToken = Buffer.from(`${user.id}:${user.email}:${Date.now()}`).toString('base64');
          
          const { password, ...userWithoutPassword } = user;
          res.json({
            ...userWithoutPassword,
            authToken // Token für Frontend-Storage
          });
        });
      });
    })(req, res, next);
    });
  });

  // Abmeldung
  app.post("/api/logout", (req: Request, res: Response, next: NextFunction) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  // Aktuellen Benutzer abrufen
  app.get("/api/user", async (req: Request, res: Response) => {
    console.log("/api/user called - checking authentication");
    console.log("- Session auth:", req.isAuthenticated());
    console.log("- Auth header:", req.headers.authorization ? "Present" : "None");
    
    // Token-Auth prüfen
    const authHeader = req.headers.authorization;
    let user = null;
    
    if (req.isAuthenticated()) {
      user = req.user;
      console.log("- Using session auth");
    } else if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const decoded = Buffer.from(token, 'base64').toString();
        const parts = decoded.split(':');
        const [userId, email, timestamp] = parts;
        
        console.log("- Token parts:", { userId, email, timestamp });
        
        if (userId && email && !isNaN(parseInt(userId))) {
          const [fullUser] = await sqliteDb
            .select()
            .from(users)
            .where(eq(users.id, parseInt(userId)))
            .limit(1);
          user = fullUser;
          console.log("- Token auth successful, user found:", fullUser?.email);
        }
      } catch (error) {
        console.log("- Token decode error in /api/user:", error);
      }
    }
    
    if (!user) {
      console.log("- No authentication found, returning 401");
      return res.status(401).json({ message: "Nicht authentifiziert" });
    }
    
    const { password, ...userWithoutPassword } = user;
    console.log("- Returning user data for:", userWithoutPassword.email);
    res.json(userWithoutPassword);
  });
}

export async function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  console.log("isAuthenticated check:");
  console.log("- req.isAuthenticated():", req.isAuthenticated());
  console.log("- req.user:", req.user);
  console.log("- req.session:", req.session);
  console.log("- Session passport:", req.session?.passport);
  console.log("- Authorization header:", req.headers.authorization);
  
  // PRIORITÄT 1: Session-basierte Auth
  if (req.isAuthenticated() && req.user) {
    return next();
  } else if (req.session?.passport?.user) {
    console.log("- User found in session, allowing through");
    req.user = { id: req.session.passport.user } as any;
    return next();
  }
  
  // PRIORITÄT 2: Token-basierte Auth als Fallback
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.substring(7);
      const decoded = Buffer.from(token, 'base64').toString();
      const parts = decoded.split(':');
      const [userId, email, timestamp] = parts;
      
      console.log("- Token decode:", { userId, email, timestamp, parts });
      
      if (userId && email && !isNaN(parseInt(userId))) {
        console.log("- Token auth successful for user:", email);
        // Vollständige User-Daten aus DB laden
        const [fullUser] = await sqliteDb
          .select()
          .from(users)
          .where(eq(users.id, parseInt(userId)))
          .limit(1);
          
        if (fullUser) {
          req.user = fullUser as any;
          return next();
        }
      }
    } catch (error) {
      console.log("- Token decode error:", error);
    }
  }
  
  return res.status(401).json({ message: "Nicht authentifiziert" });
}

export function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated() && req.user.isAdmin) {
    return next();
  }
  res.status(403).json({ message: "Administratorrechte erforderlich" });
}