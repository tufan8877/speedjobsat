import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  serial,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Konstanten
export const federalStates = [
  "Wien",
  "Niederösterreich",
  "Oberösterreich",
  "Steiermark",
  "Tirol",
  "Kärnten",
  "Salzburg",
  "Vorarlberg",
  "Burgenland",
] as const;

export const serviceCategories = [
  "Installateur",
  "Elektriker",
  "Reinigung",
  "Umzug",
  "Transport",
  "Gartenpflege",
  "Haushaltshilfe",
  "Kinderbetreuung",
  "Seniorenbetreuung",
  "Nachhilfe",
  "Computer & IT",
  "Handwerker",
  "Maler",
  "Dachdecker",
  "Automechaniker",
  "Schlosser",
  "Masseur",
] as const;

export const availabilityPeriods = [
  "Vormittag",
  "Nachmittag",
  "Abend",
  "Wochenende",
  "Feiertag",
] as const;

export const userStatuses = ["active", "suspended", "deleted"] as const;

// Postgres Enum für Status (sauberer als text enum-option)
export const userStatusEnum = pgEnum("user_status", userStatuses);

// Tabellen
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  status: userStatusEnum("status").notNull().default("active"),
  isAdmin: boolean("is_admin").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" })
    .unique(),

  firstName: text("first_name"),
  lastName: text("last_name"),
  phoneNumber: text("phone_number"),
  email: text("email"),
  socialMedia: text("social_media"),
  profileImage: text("profile_image"),

  services: text("services").array(),
  regions: text("regions").array(),
  description: text("description"),
  availablePeriods: text("available_periods").array(),

  isAvailable: boolean("is_available").notNull().default(true),

  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),

  profileId: integer("profile_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),

  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  rating: integer("rating").notNull(),
  comment: text("comment"),

  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const bannedEmails = pgTable("banned_emails", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  reason: text("reason"),
  adminId: integer("admin_id").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId],
  }),
  reviews: many(reviews),
  bannedEmails: many(bannedEmails),
}));

export const profilesRelations = relations(profiles, ({ one, many }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
  reviews: many(reviews),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  profile: one(profiles, {
    fields: [reviews.profileId],
    references: [profiles.id],
  }),
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
}));

export const bannedEmailsRelations = relations(bannedEmails, ({ one }) => ({
  admin: one(users, {
    fields: [bannedEmails.adminId],
    references: [users.id],
  }),
}));

// Validierung (Zod)
export const registerUserSchema = createInsertSchema(users)
  .pick({ email: true, password: true })
  .extend({
    password: z.string().min(8, "Passwort muss mindestens 8 Zeichen haben"),
    passwordConfirm: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Passwörter stimmen nicht überein",
    path: ["passwordConfirm"],
  });

export const loginSchema = z.object({
  email: z.string().email("Ungültige E-Mail-Adresse"),
  password: z.string().min(1, "Bitte geben Sie Ihr Passwort ein"),
});

export const profileSchema = createInsertSchema(profiles)
  .omit({
    id: true,
    userId: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    services: z.array(z.string()).min(1, "Wählen Sie mindestens eine Dienstleistung"),
    regions: z.array(z.string()).min(1, "Wählen Sie mindestens ein Bundesland"),
    availablePeriods: z
      .array(z.string())
      .min(1, "Wählen Sie mindestens eine Verfügbarkeit"),
  });

export const reviewSchema = createInsertSchema(reviews)
  .omit({
    id: true,
    userId: true,
    createdAt: true,
  })
  .extend({
    rating: z.number().min(1).max(5),
    comment: z.string().min(3, "Bewertung muss mindestens 3 Zeichen haben"),
  });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type RegisterUser = z.infer<typeof registerUserSchema>;
export type LoginUser = z.infer<typeof loginSchema>;

export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = typeof profiles.$inferInsert;
export type ProfileFormData = z.infer<typeof profileSchema>;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

export type BannedEmail = typeof bannedEmails.$inferSelect;
export type InsertBannedEmail = typeof bannedEmails.$inferInsert;
