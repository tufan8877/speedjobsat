import { sqliteDb } from "./sqlite-db";
import { users, profiles, reviews, jobListings } from "@shared/sqlite-schema";
import { eq, sql, desc } from "drizzle-orm";
import session from "express-session";
import SQLiteStore from "connect-sqlite3";

const SqliteSessionStore = SQLiteStore(session);

// SQLite-basierte Storage-Implementierung
export class SqliteStorage {
  sessionStore: session.Store;

  constructor() {
    // Persistente SQLite-Sessions für Datenstabilität
    this.sessionStore = new SqliteSessionStore({
      db: 'data/sessions.db',
      table: 'sessions',
      ttl: 86400000, // 24 Stunden
      cleanup: true,
    });
  }

  // Benutzer-Operationen
  async getUser(id: number) {
    const [user] = await sqliteDb
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return user || undefined;
  }

  async getUserByEmail(email: string) {
    const [user] = await sqliteDb
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return user || undefined;
  }

  async createUser(userData: {
    email: string;
    password: string;
    status?: string;
    isAdmin?: boolean;
  }) {
    const [user] = await sqliteDb
      .insert(users)
      .values({
        email: userData.email,
        password: userData.password,
        status: userData.status || "active",
        isAdmin: userData.isAdmin || false,
      })
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<{
    email: string;
    password: string;
    status: string;
    isAdmin: boolean;
  }>) {
    const [user] = await sqliteDb
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await sqliteDb
      .delete(users)
      .where(eq(users.id, id));
    return result.changes > 0;
  }

  // Profil-Operationen
  async getProfile(id: number) {
    const [profile] = await sqliteDb
      .select()
      .from(profiles)
      .where(eq(profiles.id, id))
      .limit(1);
    return profile || undefined;
  }

  async getProfileByUserId(userId: number) {
    const [profile] = await sqliteDb
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId))
      .limit(1);
    return profile || undefined;
  }

  async createProfile(profileData: {
    userId: number;
    firstName: string;
    lastName: string;
    description?: string;
    services: string; // JSON string
    customServices?: string;
    regions: string; // JSON string
    phoneNumber?: string;
    email?: string;
    socialMedia?: string;
    availablePeriods: string; // JSON string
    isAvailable?: boolean;
    profileImage?: string;
  }) {
    const [profile] = await sqliteDb
      .insert(profiles)
      .values(profileData)
      .returning();
    return profile;
  }

  async updateProfile(id: number, updates: Partial<{
    firstName: string;
    lastName: string;
    description: string;
    services: string; // JSON string
    customServices: string;
    regions: string; // JSON string
    phoneNumber: string;
    email: string;
    socialMedia: string;
    availablePeriods: string; // JSON string
    isAvailable: boolean;
    profileImage: string;
  }>) {
    const [profile] = await sqliteDb
      .update(profiles)
      .set(updates)
      .where(eq(profiles.id, id))
      .returning();
    return profile || undefined;
  }

  async deleteProfile(id: number): Promise<boolean> {
    const result = await sqliteDb
      .delete(profiles)
      .where(eq(profiles.id, id));
    return result.changes > 0;
  }

  async searchProfiles(params: { 
    service?: string; 
    region?: string; 
    name?: string;
    sort?: 'rating' | 'newest';
    page?: number;
    pageSize?: number;
  }) {
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const offset = (page - 1) * pageSize;
    
    // Alle Profile zunächst laden
    let allProfiles = await sqliteDb.select().from(profiles);
    
    // Filtern nach Service (nur wenn nicht "all" oder undefined)
    if (params.service && params.service !== "all") {
      allProfiles = allProfiles.filter(profile => {
        try {
          // Suche in Standard-Services
          const services = JSON.parse(profile.services || "[]");
          const hasService = Array.isArray(services) && services.includes(params.service);
          
          // Suche auch in customServices
          const customServices = profile.customServices || "";
          const hasCustomService = customServices.toLowerCase().includes(params.service.toLowerCase());
          
          return hasService || hasCustomService;
        } catch (error) {
          return false;
        }
      });
    }
    
    // Filtern nach Region (nur wenn nicht "all" oder undefined)
    if (params.region && params.region !== "all") {
      allProfiles = allProfiles.filter(profile => {
        try {
          const regions = JSON.parse(profile.regions || "[]");
          return Array.isArray(regions) && regions.includes(params.region);
        } catch (error) {
          return false;
        }
      });
    }
    
    // Filtern nach Name
    if (params.name) {
      const searchName = params.name.toLowerCase();
      allProfiles = allProfiles.filter(profile => {
        const firstName = (profile.firstName || "").toLowerCase();
        const lastName = (profile.lastName || "").toLowerCase();
        const fullName = `${firstName} ${lastName}`;
        return firstName.includes(searchName) || 
               lastName.includes(searchName) || 
               fullName.includes(searchName);
      });
    }
    
    // Sortierung
    if (params.sort === 'newest') {
      allProfiles.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA; // Neueste zuerst
      });
    }
    
    const total = allProfiles.length;
    
    // Paginierung
    const paginatedProfiles = allProfiles.slice(offset, offset + pageSize);
    
    console.log(`Finale Ergebnisse: ${paginatedProfiles.length} von ${total} Profilen`);
    
    return {
      profiles: paginatedProfiles,
      total: total
    };
  }

  // Review-Operationen
  async getReview(id: number) {
    const [review] = await sqliteDb
      .select()
      .from(reviews)
      .where(eq(reviews.id, id))
      .limit(1);
    return review || undefined;
  }

  async getReviewsByProfileId(profileId: number) {
    return await sqliteDb
      .select()
      .from(reviews)
      .where(eq(reviews.profileId, profileId))
      .orderBy(sql`${reviews.createdAt} DESC`);
  }

  async createReview(reviewData: {
    userId: number;
    profileId: number;
    rating: number;
    comment: string;
  }) {
    const [review] = await sqliteDb
      .insert(reviews)
      .values(reviewData)
      .returning();
    return review;
  }

  async updateReview(id: number, updates: Partial<{
    rating: number;
    comment: string;
  }>) {
    const [review] = await sqliteDb
      .update(reviews)
      .set(updates)
      .where(eq(reviews.id, id))
      .returning();
    return review || undefined;
  }

  async deleteReview(id: number): Promise<boolean> {
    const result = await sqliteDb
      .delete(reviews)
      .where(eq(reviews.id, id));
    return result.changes > 0;
  }

  // Job-Operationen
  async createJob(jobData: {
    userId: number;
    title: string;
    description: string;
    location: string;
    category: string;
    date: string;
    contactInfo: string;
    images?: string | null;
    status: string;
  }) {
    try {
      const [createdJob] = await sqliteDb.insert(jobListings).values({
        userId: jobData.userId,
        title: jobData.title,
        description: jobData.description,
        location: jobData.location,
        category: jobData.category,
        date: jobData.date,
        contactInfo: jobData.contactInfo,
        images: jobData.images,
        status: jobData.status
      }).returning();
      return createdJob;
    } catch (error) {
      console.error('Error creating job:', error);
      throw error;
    }
  }

  async getAllJobs() {
    return await sqliteDb.select().from(jobListings).orderBy(desc(jobListings.createdAt));
  }

  async deleteJob(id: number): Promise<boolean> {
    const result = await sqliteDb
      .delete(jobListings)
      .where(eq(jobListings.id, id));
    return result.changes > 0;
  }

  // Admin-Operationen
  async getAllUsers() {
    return await sqliteDb.select().from(users);
  }

  async getAllProfiles() {
    return await sqliteDb.select().from(profiles);
  }
}

export const sqliteStorage = new SqliteStorage();