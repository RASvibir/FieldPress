import { z } from "zod";
import { idSchema } from "./enums.js";
import { captureSchema, mediaAssetSchema } from "./entities.js";

export const ingestManifestSchema = captureSchema
  .pick({
    id: true,
    projectId: true,
    kind: true,
    capturedAt: true,
    timezoneConfidence: true,
    deviceMetadata: true,
    sensitivity: true,
    idempotencyKey: true,
    syncState: true,
  })
  .extend({
    originalFilename: z.string().min(1).max(512),
    mimeType: z.string().min(1).max(200),
  });
export type IngestManifest = z.infer<typeof ingestManifestSchema>;

export function assertOriginalNotReplaced(
  original: { kind: string; id: string },
  derivative: { kind: string; parentAssetId: string | null },
): void {
  if (original.kind !== "original") {
    throw new Error("Raw original must keep kind=original");
  }
  if (derivative.kind === "original") {
    throw new Error("Derivatives must not be stored as original");
  }
  if (derivative.parentAssetId !== original.id) {
    throw new Error("Derivative must point at the original asset");
  }
}

export function storageKeyNotUrl(asset: z.infer<typeof mediaAssetSchema>): boolean {
  return !/^https?:\/\//i.test(asset.storageKey);
}

export const transcriptSegmentCollisionSchema = z.object({
  segmentId: idSchema,
  localText: z.string(),
  serverText: z.string(),
  localVersion: z.number().int(),
  serverVersion: z.number().int(),
});
