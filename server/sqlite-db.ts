import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "@shared/sqlite-schema";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import fs from "fs";
import path from "path";

// Stelle sicher, dass das Verzeichnis existiert
const dbDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, "speedjobs.db");
console.log(`SQLite Datenbank wird verwendet: ${dbPath}`);

// Erstelle die SQLite-Datenbankverbindung
const sqlite = new Database(dbPath);
export const sqliteDb = drizzle(sqlite, { schema });

// Führe die Migrationen aus
export const initializeSqliteDb = async () => {
  try {
    // Einfaches Schema-Setup ohne formelle Migration
    // Erstelle Tabellen, wenn sie nicht existieren
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        is_admin INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        description TEXT,
        services TEXT NOT NULL,
        custom_services TEXT,
        regions TEXT NOT NULL,
        phone_number TEXT,
        email TEXT,
        social_media TEXT,
        available_periods TEXT NOT NULL,
        is_available INTEGER DEFAULT 1,
        profile_image TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      );

      CREATE TABLE IF NOT EXISTS job_listings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        location TEXT NOT NULL,
        date TEXT NOT NULL,
        contact_info TEXT NOT NULL,
        category TEXT NOT NULL,
        images TEXT,
        status TEXT NOT NULL DEFAULT 'active',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      );

      CREATE TABLE IF NOT EXISTS favorites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        profile_id INTEGER NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, profile_id),
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (profile_id) REFERENCES profiles (id)
      );

      CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        profile_id INTEGER NOT NULL,
        rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
        comment TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (profile_id) REFERENCES profiles (id)
      );
    `);
    
    // Prüfe und füge die images-Spalte hinzu, falls sie nicht existiert
    try {
      const result = sqlite.prepare("PRAGMA table_info(job_listings)").all();
      const hasImagesColumn = result.some((col: any) => col.name === 'images');
      
      if (!hasImagesColumn) {
        console.log("Füge images-Spalte zur job_listings Tabelle hinzu...");
        sqlite.exec("ALTER TABLE job_listings ADD COLUMN images TEXT");
        console.log("images-Spalte erfolgreich hinzugefügt");
      }
    } catch (error) {
      console.log("Fehler beim Hinzufügen der images-Spalte:", error);
    }
    
    // Prüfe und aktualisiere die Profile-Tabelle
    try {
      const profileColumns = sqlite.prepare("PRAGMA table_info(profiles)").all();
      const columnNames = profileColumns.map((col: any) => col.name);
      
      // Prüfe, ob neue Spalten existieren
      const newColumns = [
        'description',
        'regions',
        'phone_number', 
        'email',
        'social_media',
        'available_periods',
        'is_available',
        'custom_services'
      ];
      
      const missingColumns = newColumns.filter(col => !columnNames.includes(col));
      
      if (missingColumns.length > 0) {
        console.log("Aktualisiere Profile-Tabelle...");
        
        // Alte Tabelle sichern
        sqlite.exec("ALTER TABLE profiles RENAME TO profiles_old");
        
        // Neue Tabelle erstellen
        sqlite.exec(`
          CREATE TABLE profiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            description TEXT,
            services TEXT NOT NULL,
            regions TEXT NOT NULL,
            phone_number TEXT,
            email TEXT,
            social_media TEXT,
            available_periods TEXT NOT NULL,
            is_available INTEGER DEFAULT 1,
            profile_image TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
          )
        `);
        
        // Alte Daten migrieren (falls vorhanden)
        const oldProfiles = sqlite.prepare("SELECT * FROM profiles_old").all();
        if (oldProfiles.length > 0) {
          const insertStmt = sqlite.prepare(`
            INSERT INTO profiles (user_id, first_name, last_name, description, services, regions, phone_number, email, social_media, available_periods, is_available, profile_image, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);
          
          for (const profile of oldProfiles) {
            try {
              // Konvertiere alte Daten zu neuer Struktur
              const services = profile.services || "[]";
              const regions = profile.federal_states || "[]";
              const availablePeriods = profile.availability || "[]";
              
              insertStmt.run(
                profile.user_id,
                profile.first_name,
                profile.last_name,
                profile.experience || "",
                services,
                regions,
                profile.contact_method === 'phone' ? profile.contact_value : null,
                profile.contact_method === 'email' ? profile.contact_value : null,
                profile.contact_method === 'social' ? profile.contact_value : null,
                availablePeriods,
                1,
                profile.profile_image,
                profile.created_at
              );
            } catch (migrationError) {
              console.log("Fehler beim Migrieren des Profils:", migrationError);
            }
          }
          console.log(`${oldProfiles.length} Profile migriert`);
        }
        
        // Alte Tabelle löschen
        sqlite.exec("DROP TABLE profiles_old");
        console.log("Profile-Tabelle erfolgreich aktualisiert");
      }
    } catch (error) {
      console.log("Fehler beim Aktualisieren der Profile-Tabelle:", error);
    }
    
    // Admin-Benutzer erstellen, falls er nicht existiert
    const adminEmail = 'tufan777@gmx.at';
    const adminExists = sqlite.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail);
    
    if (!adminExists) {
      console.log("Erstelle Admin-Benutzer...");
      sqlite.prepare(`
        INSERT INTO users (email, password, status, is_admin)
        VALUES (?, ?, ?, ?)
      `).run(adminEmail, '909bc7e5b0353d728a5f717f3942fe17d222fb5ada4102cf594d2a2b635cdf27a77bcbea4aac6a1ed2d73d758ad67364d9a6015f278c16f14c2020203fdb9ad1.5337f4506b8fb4d5d3c7b8025086848d', 'active', 1);
      console.log("Admin-Benutzer erstellt:", adminEmail);
    }
    
    console.log("SQLite Datenbankschema initialisiert");
  } catch (error) {
    console.error("Fehler bei der SQLite-Datenbankinitialisierung:", error);
    throw error;
  }
};