import { integer, jsonb, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const storiesTable = pgTable("stories", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id"),
  title: varchar("title", { length: 255 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("active"),
  visibility: varchar("visibility", { length: 20 }).notNull().default("public"),
  nsfw: integer("nsfw").notNull().default(0),
  contentRating: varchar("content_rating", { length: 20 }).notNull().default("pg13"),
  embargoUntil: timestamp("embargo_until", { withTimezone: true }),
  deskChecks: jsonb("desk_checks").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const storyItemsTable = pgTable("story_items", {
  id: text("id").primaryKey(),
  storyId: text("story_id").notNull().references(() => storiesTable.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 20 }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const draftsTable = pgTable("drafts", {
  id: text("id").primaryKey(),
  storyId: text("story_id").notNull().references(() => storiesTable.id, { onDelete: "cascade" }),
  mode: varchar("mode", { length: 20 }).notNull(),
  title: varchar("title", { length: 500 }).notNull().default(""),
  content: text("content").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertStorySchema = createInsertSchema(storiesTable).omit({ updatedAt: true });
export type InsertStory = z.infer<typeof insertStorySchema>;
export type Story = typeof storiesTable.$inferSelect;

export const insertStoryItemSchema = createInsertSchema(storyItemsTable);
export type InsertStoryItem = z.infer<typeof insertStoryItemSchema>;
export type StoryItem = typeof storyItemsTable.$inferSelect;

export const insertDraftSchema = createInsertSchema(draftsTable).omit({ updatedAt: true });
export type InsertDraft = z.infer<typeof insertDraftSchema>;
export type Draft = typeof draftsTable.$inferSelect;
export const deskTipsTable = pgTable("desk_tips", {
  id: text("id").primaryKey(),
  storyId: text("story_id").references(() => storiesTable.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  fromName: varchar("from_name", { length: 200 }).notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const deskNotesTable = pgTable("desk_notes", {
  id: text("id").primaryKey(),
  storyId: text("story_id").notNull().references(() => storiesTable.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  fromName: varchar("from_name", { length: 200 }).notNull().default("Desk"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export { storiesTable as stories };
