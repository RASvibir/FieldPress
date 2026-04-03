import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const storiesTable = pgTable("stories", {
  id: text("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("active"),
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
