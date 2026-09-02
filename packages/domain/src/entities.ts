import { z } from "zod";
import {
  captureKindSchema,
  consentStatusSchema,
  draftSyncStateSchema,
  idSchema,
  mediaKindSchema,
  membershipRoleSchema,
  projectStatusSchema,
  sensitivitySchema,
  sourceTypeSchema,
} from "./enums.js";

export const organizationSchema = z.object({
  id: idSchema,
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(80).regex(/^[a-z0-9-]+$/),
  plan: z.string().min(1).max(40).default("indie"),
});
export type Organization = z.infer<typeof organizationSchema>;

export const membershipSchema = z.object({
  id: idSchema,
  userId: idSchema,
  organizationId: idSchema,
  role: membershipRoleSchema,
});
export type Membership = z.infer<typeof membershipSchema>;

export const projectSchema = z.object({
  id: idSchema,
  organizationId: idSchema,
  title: z.string().min(1).max(255),
  status: projectStatusSchema,
  publishedAt: z.string().datetime().nullable(),
  version: z.number().int().nonnegative(),
});
export type Project = z.infer<typeof projectSchema>;

export const sourceSchema = z.object({
  id: idSchema,
  projectId: idSchema,
  type: sourceTypeSchema,
  displayName: z.string().min(1).max(200),
  sensitivity: sensitivitySchema,
});
export type Source = z.infer<typeof sourceSchema>;

export const captureSchema = z.object({
  id: idSchema,
  projectId: idSchema,
  kind: captureKindSchema,
  capturedAt: z.string().datetime(),
  timezoneConfidence: z.enum(["exact", "device", "unknown"]),
  deviceMetadata: z.record(z.unknown()).default({}),
  rightsNotes: z.string().max(4000).optional(),
  embargoUntil: z.string().datetime().nullable().optional(),
  sensitivity: sensitivitySchema,
  idempotencyKey: z.string().min(8).max(128),
  syncState: draftSyncStateSchema,
});
export type Capture = z.infer<typeof captureSchema>;

export const mediaAssetSchema = z.object({
  id: idSchema,
  captureId: idSchema,
  kind: mediaKindSchema,
  parentAssetId: idSchema.nullable(),
  storageKey: z.string().min(1).max(1024),
  originalFilename: z.string().min(1).max(512),
  mimeType: z.string().min(1).max(200),
  sha256: z.string().length(64).regex(/^[a-f0-9]+$/),
  byteSize: z.number().int().nonnegative(),
  durationMs: z.number().int().nonnegative().nullable(),
  sampleRate: z.number().int().positive().nullable().optional(),
  channelCount: z.number().int().positive().nullable().optional(),
});
export type MediaAsset = z.infer<typeof mediaAssetSchema>;

export const consentRecordSchema = z.object({
  id: idSchema,
  sourceId: idSchema,
  scope: z.string().min(1).max(200),
  status: consentStatusSchema,
  evidenceAssetId: idSchema.nullable(),
});
export type ConsentRecord = z.infer<typeof consentRecordSchema>;

export const auditEventSchema = z.object({
  id: idSchema,
  actorId: idSchema.nullable(),
  action: z.string().min(1).max(80),
  entityType: z.string().min(1).max(80),
  entityId: idSchema,
  createdAt: z.string().datetime(),
});
export type AuditEvent = z.infer<typeof auditEventSchema>;
