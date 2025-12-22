import { Express, Request, Response } from "express";
import { isAuthenticated } from "./sqlite-auth";
import { sqliteDb } from "./sqlite-db";
import { favorites } from "@shared/sqlite-schema";
import { eq, and } from "drizzle-orm";

export function setupFavoritesRoutes(app: Express) {
  // Favorit hinzufügen
  app.post("/api/favorites", isAuthenticated, async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Nicht authentifiziert" });
      }
      
      const { profileId } = req.body;
      
      if (!profileId) {
        return res.status(400).json({ message: "Profil-ID ist erforderlich" });
      }
      
      // Prüfen, ob der Favorit bereits existiert
      const [existingFavorite] = await sqliteDb
        .select()
        .from(favorites)
        .where(and(
          eq(favorites.userId, req.user.id),
          eq(favorites.profileId, profileId)
        ));
      
      if (existingFavorite) {
        return res.status(409).json({ 
          message: "Dieses Profil ist bereits in Ihren Favoriten"
        });
      }
      
      // Favorit erstellen
      const newFavorite = {
        userId: req.user.id,
        profileId: profileId
      };
      
      // In Datenbank speichern
      const [createdFavorite] = await sqliteDb.insert(favorites).values(newFavorite).returning();
      
      res.status(201).json({ 
        success: true, 
        favorite: createdFavorite 
      });
    } catch (error) {
      console.error("Fehler beim Hinzufügen des Favoriten:", error);
      res.status(500).json({ message: "Fehler beim Hinzufügen des Favoriten" });
    }
  });
  
  // Favorit entfernen
  app.delete("/api/favorites/:profileId", isAuthenticated, async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Nicht authentifiziert" });
      }
      
      const profileId = parseInt(req.params.profileId);
      
      if (isNaN(profileId)) {
        return res.status(400).json({ message: "Ungültige Profil-ID" });
      }
      
      // Favorit löschen
      await sqliteDb
        .delete(favorites)
        .where(and(
          eq(favorites.userId, req.user.id),
          eq(favorites.profileId, profileId)
        ));
      
      res.status(200).json({ 
        success: true, 
        message: "Favorit erfolgreich entfernt" 
      });
    } catch (error) {
      console.error("Fehler beim Entfernen des Favoriten:", error);
      res.status(500).json({ message: "Fehler beim Entfernen des Favoriten" });
    }
  });
  
  // Alle Favoriten des angemeldeten Benutzers abrufen
  app.get("/api/favorites", isAuthenticated, async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Nicht authentifiziert" });
      }
      
      // Um alle favorisierten Profile zu erhalten, müssen wir mit der Profiltabelle joinen
      // Dies ist eine vereinfachte Version, die nur die Favoriten-Einträge zurückgibt
      // In einer echten Anwendung würden wir hier einen Join mit der Profiltabelle durchführen
      
      // Da wir zwei Datenbanksysteme verwenden, müssen wir hier manuell die Daten abrufen
      const userFavorites = await sqliteDb
        .select()
        .from(favorites)
        .where(eq(favorites.userId, req.user.id));
      
      // Extrahiere alle Profil-IDs aus den Favoriten
      const profileIds = userFavorites.map(fav => fav.profileId);
      
      if (profileIds.length === 0) {
        return res.json([]);
      }
      
      // Hier würden wir normalerweise die Profildaten abrufen
      // Da wir im Moment keine direkte Verbindung zwischen SQLite und PostgreSQL haben,
      // geben wir einen einfachen Response zurück und machen die eigentliche Datenabfrage im Frontend
      
      // In einer echten Anwendung würde dieser Endpunkt die vollständigen Profildaten zurückgeben
      
      res.json(profileIds);
    } catch (error) {
      console.error("Fehler beim Abrufen der Favoriten:", error);
      res.status(500).json({ message: "Fehler beim Abrufen der Favoriten" });
    }
  });
  
  // Prüfen, ob ein Profil favorisiert ist
  app.get("/api/favorites/:profileId", isAuthenticated, async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Nicht authentifiziert" });
      }
      
      const profileId = parseInt(req.params.profileId);
      
      if (isNaN(profileId)) {
        return res.status(400).json({ message: "Ungültige Profil-ID" });
      }
      
      // Prüfen, ob der Favorit existiert
      const [favorite] = await sqliteDb
        .select()
        .from(favorites)
        .where(and(
          eq(favorites.userId, req.user.id),
          eq(favorites.profileId, profileId)
        ));
      
      res.json({ isFavorite: !!favorite });
    } catch (error) {
      console.error("Fehler beim Prüfen des Favoriten-Status:", error);
      res.status(500).json({ message: "Fehler beim Prüfen des Favoriten-Status" });
    }
  });
}