import { relations } from "drizzle-orm";
import { sqliteTable, text, integer, blob } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Importiere bestehende Konstanten aus dem Hauptschema
import { federalStates, serviceCategories } from "./schema";

// Neue Hilfstabellen für SQLite
export const jobListings = sqliteTable("job_listings", {
  id: integer("id").primaryKey({ autoIncrement: true }).notNull(),
  userId: integer("user_id").notNull(), // Ersteller des Auftrags
  title: text("title").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(), // Ort des Auftrags
  date: text("date").notNull(), // Auftragszeittermin - als ISO-String gespeichert
  contactInfo: text("contact_info").notNull(), // Kontaktinformationen
  category: text("category").notNull(), // Dienstleistungskategorie
  images: text("images"), // JSON-Array mit Bildpfaden
  status: text("status").default("active").notNull(), // active, completed, cancelled
  createdAt: text("created_at").default(String(new Date().toISOString())),
});

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }).notNull(),
  email: text("email").unique().notNull(),
  password: text("password").notNull(),
  status: text("status").default("active").notNull(), // active, suspended, deleted
  isAdmin: integer("is_admin", { mode: "boolean" }).default(false),
  createdAt: text("created_at").default(String(new Date().toISOString())),
});

export const profiles = sqliteTable("profiles", {
  id: integer("id").primaryKey({ autoIncrement: true }).notNull(),
  userId: integer("user_id").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  description: text("description"),
  services: text("services").notNull(), // JSON array
  customServices: text("custom_services"), // Individuelle Dienstleistungen als Text
  regions: text("regions").notNull(), // JSON array - mehrere Bundesländer
  phoneNumber: text("phone_number"),
  email: text("email"),
  socialMedia: text("social_media"),
  availablePeriods: text("available_periods").notNull(), // JSON array
  isAvailable: integer("is_available", { mode: "boolean" }).default(true),
  profileImage: text("profile_image"),
  createdAt: text("created_at").default(String(new Date().toISOString())),
});

export const favorites = sqliteTable("favorites", {
  id: integer("id").primaryKey({ autoIncrement: true }).notNull(),
  userId: integer("user_id").notNull(), // Nutzer, der favorisiert
  profileId: integer("profile_id").notNull(), // Favorisiertes Profil
  createdAt: text("created_at").default(String(new Date().toISOString())),
});

export const reviews = sqliteTable("reviews", {
  id: integer("id").primaryKey({ autoIncrement: true }).notNull(),
  userId: integer("user_id").notNull(), // Bewertender Nutzer
  profileId: integer("profile_id").notNull(), // Bewertetes Profil
  rating: integer("rating").notNull(), // Sterne 1-5
  comment: text("comment").notNull(), // Bewertungskommentar
  createdAt: text("created_at").default(String(new Date().toISOString())),
});

// Relationsdefinitionen für SQLite
export const jobListingsRelations = relations(jobListings, ({ many }) => ({
  // In SQLite können wir keine echten FK-Constraints definieren, aber die Relations helfen ORM
}));

export const favoritesRelations = relations(favorites, ({ many }) => ({
  // In SQLite können wir keine echten FK-Constraints definieren, aber die Relations helfen ORM
}));

// Validierungsschemas
export const jobListingSchema = createInsertSchema(jobListings).omit({
  id: true,
  createdAt: true,
  userId: true,
}).extend({
  category: z.string(),
  status: z.enum(["active", "completed", "cancelled"]).default("active"),
});

export const favoriteSchema = createInsertSchema(favorites).omit({
  id: true,
  createdAt: true,
});

export const profileSchema = createInsertSchema(profiles).omit({
  id: true,
  createdAt: true,
  userId: true,
}).extend({
  services: z.array(z.string()).min(1, "Mindestens eine Dienstleistung erforderlich"),
  customServices: z.string().optional(),
  regions: z.array(z.string()).min(1, "Mindestens eine Region erforderlich"),
  availablePeriods: z.array(z.string()).min(1, "Mindestens eine Verfügbarkeitszeit erforderlich"),
  isAvailable: z.boolean().default(true),
});

export const reviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
  userId: true,
}).extend({
  rating: z.number().min(1, "Bewertung muss mindestens 1 Stern sein").max(5, "Bewertung kann maximal 5 Sterne haben"),
  comment: z.string().min(10, "Kommentar muss mindestens 10 Zeichen lang sein").max(500, "Kommentar kann maximal 500 Zeichen lang sein"),
});

// Auth schemas
export const registerUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
}).extend({
  passwordConfirm: z.string()
}).refine((data) => data.password === data.passwordConfirm, {
  message: "Passwörter stimmen nicht überein",
  path: ["passwordConfirm"],
});

export const loginSchema = z.object({
  email: z.string().email("Bitte geben Sie eine gültige E-Mail-Adresse ein"),
  password: z.string().min(1, "Bitte geben Sie Ihr Passwort ein")
});

// Typen für Typscript
export type JobListing = typeof jobListings.$inferSelect;
export type InsertJobListing = typeof jobListings.$inferInsert;
export type JobListingFormData = z.infer<typeof jobListingSchema>;

export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = typeof favorites.$inferInsert;

export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = typeof profiles.$inferInsert;
export type ProfileFormData = z.infer<typeof profileSchema>;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;
export type ReviewFormData = z.infer<typeof reviewSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type RegisterUser = z.infer<typeof registerUserSchema>;
export type LoginUser = z.infer<typeof loginSchema>;