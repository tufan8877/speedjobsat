import { relations } from "drizzle-orm";
import { pgTable, text, integer, boolean, timestamp, serial, pgEnum, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const federalStates = ["Wien","Niederösterreich","Oberösterreich","Steiermark","Tirol","Kärnten","Salzburg","Vorarlberg","Burgenland"] as const;
export const serviceCategories = ["Installateur","Elektriker","Reinigung","Umzug","Transport","Gartenpflege","Haushaltshilfe","Pflege","Kinderbetreuung","Seniorenbetreuung","Nachhilfe","Computer & IT","Handwerker","Maler","Dachdecker","Automechaniker","Schlosser","Masseur"] as const;
export const availabilityPeriods = ["Vormittag","Nachmittag","Abend","Wochenende","Feiertag"] as const;
export const userStatuses = ["active", "suspended", "deleted"] as const;
export const jobStatuses = ["active", "completed", "cancelled"] as const;

export const userStatusEnum = pgEnum("user_status", userStatuses);
export const jobStatusEnum = pgEnum("job_status", jobStatuses);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  status: userStatusEnum("status").notNull().default("active"),
  isAdmin: boolean("is_admin").notNull().default(false),
  emailVerified: boolean("email_verified").notNull().default(false),
  emailVerificationToken: text("email_verification_token"),
  emailVerificationExpires: timestamp("email_verification_expires", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  description: text("description"),
  services: text("services").array(),
  customServices: text("custom_services"),
  regions: text("regions").array(),
  phoneNumber: text("phone_number"),
  email: text("email"),
  socialMedia: text("social_media"),
  availablePeriods: text("available_periods").array(),
  isAvailable: boolean("is_available").notNull().default(true),
  profileImage: text("profile_image"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const jobListings = pgTable("job_listings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  date: text("date").notNull(),
  contactInfo: text("contact_info").notNull(),
  category: text("category").notNull(),
  images: text("images"),
  status: jobStatusEnum("status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  profileId: integer("profile_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  uniqueUserProfile: uniqueIndex("favorites_user_profile_unique").on(table.userId, table.profileId),
}));

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
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

export const usersRelations = relations(users, ({ one, many }) => ({ profile: one(profiles, { fields: [users.id], references: [profiles.userId] }), jobs: many(jobListings), favorites: many(favorites), reviews: many(reviews), bannedEmails: many(bannedEmails) }));
export const profilesRelations = relations(profiles, ({ one, many }) => ({ user: one(users, { fields: [profiles.userId], references: [users.id] }), reviews: many(reviews), favorites: many(favorites) }));
export const jobListingsRelations = relations(jobListings, ({ one }) => ({ user: one(users, { fields: [jobListings.userId], references: [users.id] }) }));
export const favoritesRelations = relations(favorites, ({ one }) => ({ user: one(users, { fields: [favorites.userId], references: [users.id] }), profile: one(profiles, { fields: [favorites.profileId], references: [profiles.id] }) }));
export const reviewsRelations = relations(reviews, ({ one }) => ({ profile: one(profiles, { fields: [reviews.profileId], references: [profiles.id] }), user: one(users, { fields: [reviews.userId], references: [users.id] }) }));
export const bannedEmailsRelations = relations(bannedEmails, ({ one }) => ({ admin: one(users, { fields: [bannedEmails.adminId], references: [users.id] }) }));

export const registerUserSchema = createInsertSchema(users).pick({ email: true, password: true }).extend({ email: z.string().email("Ungültige E-Mail-Adresse"), password: z.string().min(8, "Passwort muss mindestens 8 Zeichen haben"), passwordConfirm: z.string() }).refine((data) => data.password === data.passwordConfirm, { message: "Passwörter stimmen nicht überein", path: ["passwordConfirm"] });
export const loginSchema = z.object({ email: z.string().email("Ungültige E-Mail-Adresse"), password: z.string().min(1, "Bitte geben Sie Ihr Passwort ein") });
export const profileSchema = createInsertSchema(profiles).omit({ id: true, userId: true, createdAt: true, updatedAt: true }).extend({ services: z.array(z.string()).min(1), regions: z.array(z.string()).min(1), availablePeriods: z.array(z.string()).min(1), customServices: z.string().optional().nullable() });
export const jobListingSchema = createInsertSchema(jobListings).omit({ id: true, userId: true, createdAt: true }).extend({ status: z.enum(jobStatuses).default("active") });
export const favoriteSchema = createInsertSchema(favorites).omit({ id: true, createdAt: true });
export const reviewSchema = createInsertSchema(reviews).omit({ id: true, userId: true, createdAt: true }).extend({ rating: z.number().min(1).max(5), comment: z.string().min(3) });

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type RegisterUser = z.infer<typeof registerUserSchema>;
export type LoginUser = z.infer<typeof loginSchema>;
export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = typeof profiles.$inferInsert;
export type ProfileFormData = z.infer<typeof profileSchema>;
export type JobListing = typeof jobListings.$inferSelect;
export type InsertJobListing = typeof jobListings.$inferInsert;
export type JobListingFormData = z.infer<typeof jobListingSchema>;
export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = typeof favorites.$inferInsert;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;
export type ReviewFormData = z.infer<typeof reviewSchema>;
export type BannedEmail = typeof bannedEmails.$inferSelect;
export type InsertBannedEmail = typeof bannedEmails.$inferInsert;
