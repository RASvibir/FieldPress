import { z } from "zod";

export const archiveManifestSchema = z.object({
  schemaVersion: z.literal(1),
  projectId: z.string().min(1),
  generatedAt: z.string().datetime(),
  manifestHash: z.string().length(64).regex(/^[a-f0-9]+$/),
  files: z.array(
    z.object({
      storageKey: z.string().min(1),
      sha256: z.string().length(64).regex(/^[a-f0-9]+$/),
      role: z.enum(["original", "derivative", "transcript", "metadata"]),
    }),
  ),
});
export type ArchiveManifest = z.infer<typeof archiveManifestSchema>;

export function assertManifestChecksums(manifest: ArchiveManifest): void {
  for (const file of manifest.files) {
    if (file.role === "original" && !file.sha256) {
      throw new Error("Original files require sha256");
    }
  }
}
