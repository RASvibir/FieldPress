import { pgTable, text, timestamp, uuid, integer, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { stories } from "./stories";

export const mediaSourceTypeEnum = pgEnum("media_source_type", [
  "archival_search",
  "ai_generated",
  "field_upload"
]);

export const mediaAssets = pgTable("media_assets", {
  id: uuid("id").primaryKey().defaultRandom(),
  storyId: uuid("story_id").notNull().references(() => stories.id, { onDelete: "cascade" }),
  
  url: text("url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  width: integer("width"),
  height: integer("height"),
  aspectRatio: text("aspect_ratio"),
  
  sourceType: mediaSourceTypeEnum("source_type").notNull(),
  sourceName: text("source_name"),
  sourcePageUrl: text("source_page_url"),
  author: text("author"),
  license: text("license").notNull(),
  licenseUrl: text("license_url"),
  attribution: text("attribution").notNull(),
  originalDate: text("original_date"),
  
  caption: text("caption"),
  promptUsed: text("prompt_used"),
  
  rawMetadata: jsonb("raw_metadata").$type<Record<string, unknown>>().default({}),
  
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const mediaAssetsRelations = relations(mediaAssets, ({ one }) => ({
  story: one(stories, {
    fields: [mediaAssets.storyId],
    references: [stories.id],
  }),
}));

export type MediaAsset = typeof mediaAssets.$inferSelect;
export type NewMediaAsset = typeof mediaAssets.$inferInsert;
