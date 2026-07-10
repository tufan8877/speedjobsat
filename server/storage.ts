import session from "express-session";
import connectPg from "connect-pg-simple";
import { and, desc, eq } from "drizzle-orm";
import { db, pool } from "./db";
import {
  users,
  profiles,
  reviews,
  bannedEmails,
  jobListings,
  favorites,
  type User,
  type InsertUser,
  type Profile,
  type InsertProfile,
  type Review,
  type InsertReview,
  type BannedEmail,
  type InsertBannedEmail,
  type JobListing,
  type InsertJobListing,
  type Favorite,
  type InsertFavorite,
} from "@shared/schema";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  sessionStore: session.Store;
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  getProfile(id: number): Promise<Profile | undefined>;
  getProfileByUserId(userId: number): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile): Promise<Profile>;
  updateProfile(id: number, updates: Partial<InsertProfile>): Promise<Profile | undefined>;
  deleteProfile(id: number): Promise<boolean>;
  searchProfiles(params: {
    service?: string;
    region?: string;
    name?: string;
    sort?: "rating" | "newest";
    page?: number;
    pageSize?: number;
  }): Promise<{ profiles: Profile[]; total: number }>;
  getReview(id: number): Promise<Review | undefined>;
  getReviewsByProfileId(profileId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  updateReview(id: number, updates: Partial<InsertReview>): Promise<Review | undefined>;
  deleteReview(id: number): Promise<boolean>;
  createJob(job: InsertJobListing): Promise<JobListing>;
  getJob(id: number): Promise<JobListing | undefined>;
  getAllJobs(): Promise<JobListing[]>;
  getJobsByUserId(userId: number): Promise<JobListing[]>;
  searchJobs(params: { category?: string; location?: string; status?: string }): Promise<JobListing[]>;
  updateJob(id: number, updates: Partial<InsertJobListing>): Promise<JobListing | undefined>;
  deleteJob(id: number): Promise<boolean>;
  createFavorite(favorite: InsertFavorite): Promise<Favorite>;
  deleteFavorite(userId: number, profileId: number): Promise<boolean>;
  getFavorite(userId: number, profileId: number): Promise<Favorite | undefined>;
  getFavoritesByUserId(userId: number): Promise<Favorite[]>;
  getBannedEmail(email: string): Promise<BannedEmail | undefined>;
  banEmail(bannedEmail: InsertBannedEmail): Promise<BannedEmail>;
  unbanEmail(email: string): Promise<boolean>;
  listBannedEmails(): Promise<BannedEmail[]>;
  getAllUsers(): Promise<User[]>;
  getAllProfiles(): Promise<Profile[]>;
}

function normalizeSearchText(value: unknown): string {
  return String(value || "").trim().toLocaleLowerCase("de-AT");
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
      tableName: "sessions",
    });
  }

  async getUser(id: number) {
    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return user || undefined;
  }

  async getUserByEmail(email: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email.trim().toLowerCase())).limit(1);
    return user || undefined;
  }

  async createUser(data: InsertUser) {
    const [user] = await db.insert(users).values(data).returning();
    return user;
  }

  async updateUser(id: number, data: Partial<InsertUser>) {
    const [user] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return user || undefined;
  }

  async deleteUser(id: number) {
    const [user] = await db.delete(users).where(eq(users.id, id)).returning({ id: users.id });
    return !!user;
  }

  async getProfile(id: number) {
    const [profile] = await db.select().from(profiles).where(eq(profiles.id, id)).limit(1);
    return profile || undefined;
  }

  async getProfileByUserId(userId: number) {
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
    return profile || undefined;
  }

  async createProfile(data: InsertProfile) {
    const [profile] = await db.insert(profiles).values(data).returning();
    return profile;
  }

  async updateProfile(id: number, data: Partial<InsertProfile>) {
    const [profile] = await db
      .update(profiles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(profiles.id, id))
      .returning();
    return profile || undefined;
  }

  async deleteProfile(id: number) {
    const [profile] = await db.delete(profiles).where(eq(profiles.id, id)).returning({ id: profiles.id });
    return !!profile;
  }

  async searchProfiles(params: {
    service?: string;
    region?: string;
    name?: string;
    sort?: "rating" | "newest";
    page?: number;
    pageSize?: number;
  }) {
    const page = params.page && params.page > 0 ? params.page : 1;
    const pageSize = params.pageSize && params.pageSize > 0 ? params.pageSize : 10;
    const offset = (page - 1) * pageSize;

    let allProfiles = await db.select().from(profiles);

    if (params.service && params.service !== "all") {
      const service = normalizeSearchText(params.service);
      allProfiles = allProfiles.filter((profile) =>
        (profile.services || []).some((item) => normalizeSearchText(item) === service) ||
        normalizeSearchText(profile.customServices).includes(service),
      );
    }

    if (params.region && params.region !== "all") {
      allProfiles = allProfiles.filter((profile) => (profile.regions || []).includes(params.region!));
    }

    if (params.name?.trim()) {
      const keywords = normalizeSearchText(params.name)
        .split(/\s+/)
        .filter(Boolean);

      allProfiles = allProfiles.filter((profile) => {
        const searchableText = [
          profile.firstName,
          profile.lastName,
          profile.description,
          profile.customServices,
          ...(profile.services || []),
          ...(profile.regions || []),
        ]
          .map(normalizeSearchText)
          .join(" ");

        return keywords.every((keyword) => searchableText.includes(keyword));
      });
    }

    if (params.sort === "newest") {
      allProfiles.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });
    }

    return {
      profiles: allProfiles.slice(offset, offset + pageSize),
      total: allProfiles.length,
    };
  }

  async getReview(id: number) {
    const [review] = await db.select().from(reviews).where(eq(reviews.id, id)).limit(1);
    return review || undefined;
  }

  async getReviewsByProfileId(profileId: number) {
    return db.select().from(reviews).where(eq(reviews.profileId, profileId)).orderBy(desc(reviews.createdAt));
  }

  async createReview(data: InsertReview) {
    const [review] = await db.insert(reviews).values(data).returning();
    return review;
  }

  async updateReview(id: number, data: Partial<InsertReview>) {
    const [review] = await db.update(reviews).set(data).where(eq(reviews.id, id)).returning();
    return review || undefined;
  }

  async deleteReview(id: number) {
    const [review] = await db.delete(reviews).where(eq(reviews.id, id)).returning({ id: reviews.id });
    return !!review;
  }

  async createJob(data: InsertJobListing) {
    const [job] = await db.insert(jobListings).values(data).returning();
    return job;
  }

  async getJob(id: number) {
    const [job] = await db.select().from(jobListings).where(eq(jobListings.id, id)).limit(1);
    return job || undefined;
  }

  async getAllJobs() {
    return db.select().from(jobListings).orderBy(desc(jobListings.createdAt));
  }

  async getJobsByUserId(userId: number) {
    return db.select().from(jobListings).where(eq(jobListings.userId, userId)).orderBy(desc(jobListings.createdAt));
  }

  async searchJobs(params: { category?: string; location?: string; status?: string }) {
    let jobs = await this.getAllJobs();
    if (params.status) jobs = jobs.filter((job) => job.status === params.status);
    if (params.category && params.category !== "all") jobs = jobs.filter((job) => job.category === params.category);
    if (params.location) {
      const location = normalizeSearchText(params.location);
      jobs = jobs.filter((job) => normalizeSearchText(job.location).includes(location));
    }
    return jobs;
  }

  async updateJob(id: number, data: Partial<InsertJobListing>) {
    const [job] = await db.update(jobListings).set(data).where(eq(jobListings.id, id)).returning();
    return job || undefined;
  }

  async deleteJob(id: number) {
    const [job] = await db.delete(jobListings).where(eq(jobListings.id, id)).returning({ id: jobListings.id });
    return !!job;
  }

  async createFavorite(data: InsertFavorite) {
    const existing = await this.getFavorite(data.userId, data.profileId);
    if (existing) return existing;
    const [favorite] = await db.insert(favorites).values(data).returning();
    return favorite;
  }

  async deleteFavorite(userId: number, profileId: number) {
    const [favorite] = await db
      .delete(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.profileId, profileId)))
      .returning({ id: favorites.id });
    return !!favorite;
  }

  async getFavorite(userId: number, profileId: number) {
    const [favorite] = await db
      .select()
      .from(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.profileId, profileId)))
      .limit(1);
    return favorite || undefined;
  }

  async getFavoritesByUserId(userId: number) {
    return db.select().from(favorites).where(eq(favorites.userId, userId)).orderBy(desc(favorites.createdAt));
  }

  async getBannedEmail(email: string) {
    const [bannedEmail] = await db
      .select()
      .from(bannedEmails)
      .where(eq(bannedEmails.email, email.trim().toLowerCase()))
      .limit(1);
    return bannedEmail || undefined;
  }

  async banEmail(data: InsertBannedEmail) {
    const existing = await this.getBannedEmail(data.email);
    if (existing) return existing;
    const [bannedEmail] = await db
      .insert(bannedEmails)
      .values({ ...data, email: data.email.trim().toLowerCase() })
      .returning();
    return bannedEmail;
  }

  async unbanEmail(email: string) {
    const [bannedEmail] = await db
      .delete(bannedEmails)
      .where(eq(bannedEmails.email, email.trim().toLowerCase()))
      .returning({ id: bannedEmails.id });
    return !!bannedEmail;
  }

  async listBannedEmails() {
    return db.select().from(bannedEmails).orderBy(desc(bannedEmails.createdAt));
  }

  async getAllUsers() {
    return db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getAllProfiles() {
    return db.select().from(profiles).orderBy(desc(profiles.createdAt));
  }
}

export const storage = new DatabaseStorage();
