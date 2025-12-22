import { User, InsertUser, Profile, InsertProfile, Review, InsertReview, BannedEmail, InsertBannedEmail } from "@shared/schema";
import { db } from "./db";
import { eq, and, like, ilike, or, desc, asc, sql } from "drizzle-orm";
import { users, profiles, reviews, bannedEmails } from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

// PostgreSQL Session Store für Express
const PostgresSessionStore = connectPg(session);

// Storage Interface Definition
export interface IStorage {
  // Session store
  sessionStore: session.Store;
  
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  
  // Profile operations
  getProfile(id: number): Promise<Profile | undefined>;
  getProfileByUserId(userId: number): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile): Promise<Profile>;
  updateProfile(id: number, updates: Partial<InsertProfile>): Promise<Profile | undefined>;
  deleteProfile(id: number): Promise<boolean>;
  searchProfiles(params: { 
    service?: string; 
    region?: string; 
    name?: string;
    sort?: 'rating' | 'newest';
    page?: number;
    pageSize?: number;
  }): Promise<{profiles: Profile[], total: number}>;
  
  // Review operations
  getReview(id: number): Promise<Review | undefined>;
  getReviewsByProfileId(profileId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  updateReview(id: number, updates: Partial<InsertReview>): Promise<Review | undefined>;
  deleteReview(id: number): Promise<boolean>;
  
  // Banned email operations
  getBannedEmail(email: string): Promise<BannedEmail | undefined>;
  banEmail(bannedEmail: InsertBannedEmail): Promise<BannedEmail>;
  unbanEmail(email: string): Promise<boolean>;
  listBannedEmails(): Promise<BannedEmail[]>;
  
  // Admin operations
  getAllUsers(): Promise<User[]>;
  getAllProfiles(): Promise<Profile[]>;
}

// Implementierung mit Datenbankanbindung
export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;
  
  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }
  
  async deleteUser(id: number): Promise<boolean> {
    const [deletedUser] = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning({ id: users.id });
    return !!deletedUser;
  }
  
  // Profile operations
  async getProfile(id: number): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.id, id));
    return profile;
  }
  
  async getProfileByUserId(userId: number): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId));
    return profile;
  }
  
  async createProfile(insertProfile: InsertProfile): Promise<Profile> {
    const [profile] = await db.insert(profiles).values(insertProfile).returning();
    return profile;
  }
  
  async updateProfile(id: number, updates: Partial<InsertProfile>): Promise<Profile | undefined> {
    const [updatedProfile] = await db
      .update(profiles)
      .set(updates)
      .where(eq(profiles.id, id))
      .returning();
    return updatedProfile;
  }
  
  async deleteProfile(id: number): Promise<boolean> {
    const [deletedProfile] = await db
      .delete(profiles)
      .where(eq(profiles.id, id))
      .returning({ id: profiles.id });
    return !!deletedProfile;
  }
  
  async searchProfiles(params: { 
    service?: string; 
    region?: string; 
    name?: string;
    sort?: 'rating' | 'newest';
    page?: number;
    pageSize?: number;
  }): Promise<{profiles: Profile[], total: number}> {
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const offset = (page - 1) * pageSize;
    
    // Basisabfrage
    let query = db.select().from(profiles);
    
    // Filter anwenden
    const conditions = [];
    
    if (params.service) {
      conditions.push(sql`${profiles.services} @> ARRAY[${params.service}]::text[]`);
    }
    
    if (params.region) {
      conditions.push(eq(profiles.region, params.region));
    }
    
    if (params.name) {
      conditions.push(
        or(
          ilike(profiles.firstName || '', `%${params.name}%`),
          ilike(profiles.lastName || '', `%${params.name}%`)
        )
      );
    }
    
    if (conditions.length > 0) {
      const condition = conditions.reduce((acc, curr) => and(acc, curr));
      query = query.where(condition);
    }
    
    // Sortierung
    if (params.sort === 'newest') {
      query = query.orderBy(desc(profiles.createdAt));
    }
    // Die 'rating' Sortierung würde eine separate Abfrage erfordern, 
    // die durchschnittliche Bewertungen berechnet, aber das übersteigt den
    // Rahmen dieser einfachen Implementierung
    
    // Abfrage für die Gesamtzahl
    const countQuery = db.select({ count: sql`COUNT(*)` }).from(profiles);
    if (conditions.length > 0) {
      const condition = conditions.reduce((acc, curr) => and(acc, curr));
      countQuery.where(condition);
    }
    
    // Paginierung
    query = query.limit(pageSize).offset(offset);
    
    // Ausführen der Abfragen
    const [countResult] = await countQuery;
    const fetchedProfiles = await query;
    
    return {
      profiles: fetchedProfiles,
      total: Number(countResult?.count || 0)
    };
  }
  
  // Review operations
  async getReview(id: number): Promise<Review | undefined> {
    const [review] = await db.select().from(reviews).where(eq(reviews.id, id));
    return review;
  }
  
  async getReviewsByProfileId(profileId: number): Promise<Review[]> {
    const foundReviews = await db
      .select()
      .from(reviews)
      .where(eq(reviews.profileId, profileId))
      .orderBy(desc(reviews.createdAt));
    return foundReviews;
  }
  
  async createReview(insertReview: InsertReview): Promise<Review> {
    const [review] = await db.insert(reviews).values(insertReview).returning();
    return review;
  }
  
  async updateReview(id: number, updates: Partial<InsertReview>): Promise<Review | undefined> {
    const [updatedReview] = await db
      .update(reviews)
      .set(updates)
      .where(eq(reviews.id, id))
      .returning();
    return updatedReview;
  }
  
  async deleteReview(id: number): Promise<boolean> {
    const [deletedReview] = await db
      .delete(reviews)
      .where(eq(reviews.id, id))
      .returning({ id: reviews.id });
    return !!deletedReview;
  }
  
  // Banned email operations
  async getBannedEmail(email: string): Promise<BannedEmail | undefined> {
    const [bannedEmail] = await db
      .select()
      .from(bannedEmails)
      .where(eq(bannedEmails.email, email));
    return bannedEmail;
  }
  
  async banEmail(data: Omit<InsertBannedEmail, 'id'>): Promise<BannedEmail> {
    const [bannedEmail] = await db
      .insert(bannedEmails)
      .values(data)
      .returning();
    return bannedEmail;
  }
  
  async unbanEmail(email: string): Promise<boolean> {
    const [unbannedEmail] = await db
      .delete(bannedEmails)
      .where(eq(bannedEmails.email, email))
      .returning({ id: bannedEmails.id });
    return !!unbannedEmail;
  }
  
  async listBannedEmails(): Promise<BannedEmail[]> {
    return db.select().from(bannedEmails).orderBy(desc(bannedEmails.createdAt));
  }
  
  // Admin operations
  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }
  
  async getAllProfiles(): Promise<Profile[]> {
    return db.select().from(profiles);
  }
}

// Exporte
export const storage = new DatabaseStorage();