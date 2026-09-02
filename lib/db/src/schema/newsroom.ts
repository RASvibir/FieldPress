import {
  bigint,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export const membershipRoleEnum = pgEnum("membership_role", [
  "owner",
  "editor",
  "reporter",
  "producer",
  "viewer",
  "external_reviewer",
]);

export const projectStatusEnum = pgEnum("project_status", [
  "draft",
  "active",
  "embargoed",
  "published",
  "archived",
]);

export const captureKindEnum = pgEnum("capture_kind", [
  "note",
  "interview",
  "ambient",
  "photo",
  "document",
  "source_detail",
]);

export const mediaKindEnum = pgEnum("media_kind", [
  "original",
  "proxy",
  "waveform",
  "normalized_preview",
  "clip_export",
  "transcript_sidecar",
]);

export const usersTable = pgTable(
  "users",
  {
    id: text("id").primaryKey(),
    email: varchar("email", { length: 320 }).notNull(),
    displayName: varchar("display_name", { length: 200 }).notNull(),
    status: varchar("status", { length: 40 }).notNull().default("active"),
    passwordHash: text("password_hash").notNull().default(""),
    resetWordHash: text("reset_word_hash"),
    deskLinks: jsonb("desk_links").$type<Record<string, string>>().notNull().default({}),
    ageBand: varchar("age_band", { length: 20 }).notNull().default("teen"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("users_email_idx").on(table.email)],
);

export const organizationsTable = pgTable("organizations", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 80 }).notNull(),
  plan: varchar("plan", { length: 40 }).notNull().default("indie"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const membershipsTable = pgTable(
  "memberships",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizationsTable.id, { onDelete: "cascade" }),
    role: membershipRoleEnum("role").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("memberships_user_org_idx").on(table.userId, table.organizationId)],
);

export const projectsTable = pgTable("projects", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizationsTable.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  status: projectStatusEnum("status").notNull().default("draft"),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  version: integer("version").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sourcesTable = pgTable("sources", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projectsTable.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 40 }).notNull(),
  displayName: varchar("display_name", { length: 200 }).notNull(),
  sensitivity: varchar("sensitivity", { length: 40 }).notNull().default("internal"),
});

export const capturesTable = pgTable(
  "captures",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projectsTable.id, { onDelete: "cascade" }),
    kind: captureKindEnum("kind").notNull(),
    capturedAt: timestamp("captured_at", { withTimezone: true }).notNull(),
    timezoneConfidence: varchar("timezone_confidence", { length: 20 }).notNull().default("unknown"),
    deviceMetadata: jsonb("device_metadata").$type<Record<string, unknown>>().notNull().default({}),
    sensitivity: varchar("sensitivity", { length: 40 }).notNull().default("internal"),
    idempotencyKey: varchar("idempotency_key", { length: 128 }).notNull(),
    syncState: varchar("sync_state", { length: 32 }).notNull().default("local"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("captures_idempotency_idx").on(table.projectId, table.idempotencyKey)],
);

export const captureMediaAssetsTable = pgTable("capture_media_assets", {
  id: text("id").primaryKey(),
  captureId: text("capture_id")
    .notNull()
    .references(() => capturesTable.id, { onDelete: "cascade" }),
  kind: mediaKindEnum("kind").notNull(),
  parentAssetId: text("parent_asset_id"),
  storageKey: text("storage_key").notNull(),
  originalFilename: text("original_filename").notNull(),
  mimeType: varchar("mime_type", { length: 200 }).notNull(),
  sha256: varchar("sha256", { length: 64 }).notNull(),
  byteSize: bigint("byte_size", { mode: "number" }).notNull(),
  durationMs: integer("duration_ms"),
  sampleRate: integer("sample_rate"),
  channelCount: integer("channel_count"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const transcriptsTable = pgTable("transcripts", {
  id: text("id").primaryKey(),
  mediaAssetId: text("media_asset_id")
    .notNull()
    .references(() => captureMediaAssetsTable.id, { onDelete: "cascade" }),
  language: varchar("language", { length: 16 }).notNull().default("und"),
  version: integer("version").notNull().default(1),
  status: varchar("status", { length: 32 }).notNull().default("queued"),
  asrVendor: varchar("asr_vendor", { length: 80 }),
  asrModel: varchar("asr_model", { length: 120 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const transcriptSegmentsTable = pgTable("transcript_segments", {
  id: text("id").primaryKey(),
  transcriptId: text("transcript_id")
    .notNull()
    .references(() => transcriptsTable.id, { onDelete: "cascade" }),
  startMs: integer("start_ms").notNull(),
  endMs: integer("end_ms").notNull(),
  speakerId: text("speaker_id"),
  text: text("text").notNull(),
  redacted: integer("redacted").notNull().default(0),
  version: integer("version").notNull().default(0),
});

export const annotationsTable = pgTable("annotations", {
  id: text("id").primaryKey(),
  authorId: text("author_id").notNull(),
  targetType: varchar("target_type", { length: 40 }).notNull(),
  targetId: text("target_id").notNull(),
  body: text("body").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const consentRecordsTable = pgTable("consent_records", {
  id: text("id").primaryKey(),
  sourceId: text("source_id")
    .notNull()
    .references(() => sourcesTable.id, { onDelete: "cascade" }),
  scope: varchar("scope", { length: 200 }).notNull(),
  status: varchar("status", { length: 40 }).notNull(),
  evidenceAssetId: text("evidence_asset_id"),
});

export const exportPackagesTable = pgTable("export_packages", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projectsTable.id, { onDelete: "cascade" }),
  format: varchar("format", { length: 40 }).notNull(),
  manifestHash: varchar("manifest_hash", { length: 64 }),
  status: varchar("status", { length: 32 }).notNull().default("queued"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const auditEventsTable = pgTable("audit_events", {
  id: text("id").primaryKey(),
  actorId: text("actor_id"),
  action: varchar("action", { length: 80 }).notNull(),
  entityType: varchar("entity_type", { length: 80 }).notNull(),
  entityId: text("entity_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const mediaJobsTable = pgTable("media_jobs", {
  id: text("id").primaryKey(),
  assetId: text("asset_id")
    .notNull()
    .references(() => captureMediaAssetsTable.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 80 }).notNull(),
  status: varchar("status", { length: 32 }).notNull().default("queued"),
  attempt: integer("attempt").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sessionsTable = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const passwordResetTokensTable = pgTable("password_reset_tokens", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
