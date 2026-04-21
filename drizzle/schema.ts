import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Story orders table - tracks each story generation request
 */
export const storyOrders = mysqlTable("story_orders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  childName: varchar("childName", { length: 255 }).notNull(),
  childAge: int("childAge").notNull(),
  childGender: mysqlEnum("childGender", ["male", "female", "other"]).notNull(),
  childPhotoUrl: text("childPhotoUrl"),
  childPhotoKey: text("childPhotoKey"), // S3 key for deletion tracking
  language: mysqlEnum("language", ["en", "hi", "hinglish"]).default("en").notNull(),
  parentingChallenge: text("parentingChallenge").notNull(),
  childPersonality: text("childPersonality"), // Optional extra context
  animationStyle: mysqlEnum("animationStyle", ["cartoon", "storybook", "magical"]).default("cartoon").notNull(),
  musicMood: mysqlEnum("musicMood", ["playful", "calm", "adventurous"]).default("playful").notNull(),
  videoLength: mysqlEnum("videoLength", ["short", "full"]).default("full").notNull(),
  storyScript: text("storyScript"), // JSON string of 10-scene script
  videoUrl: text("videoUrl"),
  videoKey: text("videoKey"), // S3 key for storage
  renderJobId: varchar("renderJobId", { length: 255 }),
  renderStatus: mysqlEnum("renderStatus", ["pending", "generating_script", "generating_images", "generating_voiceover", "stitching", "completed", "failed"]).default("pending").notNull(),
  renderProgress: int("renderProgress").default(0).notNull(),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "completed", "failed"]).default("pending").notNull(),
  pricingTier: mysqlEnum("pricingTier", ["preview", "hd", "hd_whatsapp"]).default("preview").notNull(),
  amountPaid: int("amountPaid").default(0).notNull(), // in paise (₹0.01 units)
  razorpayOrderId: varchar("razorpayOrderId", { length: 255 }),
  razorpayPaymentId: varchar("razorpayPaymentId", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StoryOrder = typeof storyOrders.$inferSelect;
export type InsertStoryOrder = typeof storyOrders.$inferInsert;

/**
 * Character uploads table - stores additional character photos for stories
 */
export const characterUploads = mysqlTable("character_uploads", {
  id: int("id").autoincrement().primaryKey(),
  storyOrderId: int("storyOrderId").notNull().references(() => storyOrders.id),
  characterName: varchar("characterName", { length: 255 }).notNull(),
  characterRole: varchar("characterRole", { length: 255 }).notNull(), // e.g., "sibling", "friend", "pet"
  photoUrl: text("photoUrl").notNull(),
  photoKey: text("photoKey").notNull(), // S3 key for deletion tracking
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CharacterUpload = typeof characterUploads.$inferSelect;
export type InsertCharacterUpload = typeof characterUploads.$inferInsert;

/**
 * Render jobs table - tracks async video rendering progress
 */
export const renderJobs = mysqlTable("render_jobs", {
  id: int("id").autoincrement().primaryKey(),
  storyOrderId: int("storyOrderId").notNull().references(() => storyOrders.id),
  jobId: varchar("jobId", { length: 255 }).notNull().unique(),
  status: mysqlEnum("status", ["queued", "processing", "completed", "failed"]).default("queued").notNull(),
  progress: int("progress").default(0).notNull(),
  currentStep: varchar("currentStep", { length: 255 }), // e.g., "generating_images", "stitching"
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type RenderJob = typeof renderJobs.$inferSelect;
export type InsertRenderJob = typeof renderJobs.$inferInsert;

/**
 * Feedback table - tracks parent feedback on story effectiveness
 */
export const storyFeedback = mysqlTable("story_feedback", {
  id: int("id").autoincrement().primaryKey(),
  storyOrderId: int("storyOrderId").notNull().references(() => storyOrders.id),
  feedbackType: mysqlEnum("feedbackType", ["worked", "partial", "not_worked"]).notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type StoryFeedback = typeof storyFeedback.$inferSelect;
export type InsertStoryFeedback = typeof storyFeedback.$inferInsert;

/**
 * Photo deletion tracking table - for GDPR/DPDP compliance
 */
export const photoDeleteLog = mysqlTable("photo_delete_log", {
  id: int("id").autoincrement().primaryKey(),
  photoKey: varchar("photoKey", { length: 255 }).notNull(),
  photoType: mysqlEnum("photoType", ["child", "character"]).notNull(),
  storyOrderId: int("storyOrderId"),
  deletedAt: timestamp("deletedAt").defaultNow().notNull(),
});

export type PhotoDeleteLog = typeof photoDeleteLog.$inferSelect;
export type InsertPhotoDeleteLog = typeof photoDeleteLog.$inferInsert;