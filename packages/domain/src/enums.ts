import { z } from "zod";

export const idSchema = z.string().min(1).max(64);

export const membershipRoleSchema = z.enum([
  "owner",
  "editor",
  "reporter",
  "producer",
  "viewer",
  "external_reviewer",
]);
export type MembershipRole = z.infer<typeof membershipRoleSchema>;

export const projectStatusSchema = z.enum([
  "draft",
  "active",
  "embargoed",
  "published",
  "archived",
]);
export type ProjectStatus = z.infer<typeof projectStatusSchema>;

export const sourceTypeSchema = z.enum([
  "person",
  "place",
  "document",
  "organization",
  "other",
]);
export type SourceType = z.infer<typeof sourceTypeSchema>;

export const sensitivitySchema = z.enum([
  "public",
  "internal",
  "restricted",
  "confidential",
]);
export type Sensitivity = z.infer<typeof sensitivitySchema>;

export const captureKindSchema = z.enum([
  "note",
  "interview",
  "ambient",
  "photo",
  "document",
  "source_detail",
]);
export type CaptureKind = z.infer<typeof captureKindSchema>;

export const mediaKindSchema = z.enum([
  "original",
  "proxy",
  "waveform",
  "normalized_preview",
  "clip_export",
  "transcript_sidecar",
]);
export type MediaKind = z.infer<typeof mediaKindSchema>;

export const draftSyncStateSchema = z.enum([
  "local",
  "pending_upload",
  "syncing",
  "synced",
  "failed",
]);
export type DraftSyncState = z.infer<typeof draftSyncStateSchema>;

export const consentStatusSchema = z.enum([
  "unknown",
  "requested",
  "granted",
  "limited",
  "denied",
  "withdrawn",
]);
export type ConsentStatus = z.infer<typeof consentStatusSchema>;

export const jobNameSchema = z.enum([
  "media.inspect",
  "media.generate_proxy",
  "media.generate_waveform",
  "media.transcribe",
  "media.index",
]);
export type JobName = z.infer<typeof jobNameSchema>;

export const jobStatusSchema = z.enum([
  "queued",
  "running",
  "succeeded",
  "failed",
  "cancelled",
]);
export type JobStatus = z.infer<typeof jobStatusSchema>;
