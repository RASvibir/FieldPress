import { z } from "zod";

export const visualSourceTypeSchema = z.enum([
  "archival_search",
  "ai_generated",
  "field_upload",
]);

export type VisualSourceType = z.infer<typeof visualSourceTypeSchema>;

export const visualAspectRatioSchema = z.enum(["16:9", "4:5", "1:1"]);

export type VisualAspectRatio = z.infer<typeof visualAspectRatioSchema>;

export const visualLicenseStatusSchema = z.enum([
  "public_domain",
  "creative_commons",
  "rights_restricted",
  "unknown",
]);

export type VisualLicenseStatus = z.infer<typeof visualLicenseStatusSchema>;

export const visualReviewStatusSchema = z.enum([
  "candidate",
  "selected",
  "rejected",
]);

export type VisualReviewStatus = z.infer<typeof visualReviewStatusSchema>;

export const visualProvenanceSchema = z.object({
  sourceType: visualSourceTypeSchema,
  sourceName: z.string().trim().min(1).max(200).optional(),
  sourcePageUrl: z.string().url().optional(),
  author: z.string().trim().min(1).max(500).optional(),
  license: z.string().trim().min(1).max(500),
  licenseUrl: z.string().url().optional(),
  attribution: z.string().trim().min(1).max(2000),
  originalDate: z.string().trim().min(1).max(100).optional(),
  promptUsed: z.string().trim().min(1).max(8000).optional(),
  aiDisclosure: z.boolean().default(false),
});

export type VisualProvenance = z.infer<typeof visualProvenanceSchema>;

export const visualAssetSchema = z.object({
  id: z.string().trim().min(1).max(200),
  storyId: z.string().trim().min(1).max(200),
  url: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  aspectRatio: visualAspectRatioSchema.optional(),
  caption: z.string().trim().max(2000).optional(),
  reviewStatus: visualReviewStatusSchema.default("candidate"),
  provenance: visualProvenanceSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type VisualAsset = z.infer<typeof visualAssetSchema>;

export const createVisualAssetSchema = visualAssetSchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    reviewStatus: visualReviewStatusSchema.optional(),
  });

export type CreateVisualAsset = z.infer<typeof createVisualAssetSchema>;

export interface VisualSearchCandidate {
  id: string;
  title: string;
  url: string;
  thumbUrl: string;
  author: string;
  license: string;
  description: string;
  width?: number;
  height?: number;
}

const CREATIVE_COMMONS = /\bcc\b|creative commons/i;
const PUBLIC_DOMAIN = /\bpublic domain\b|\bcc0\b|\bno known copyright restrictions\b/i;
const RESTRICTED = /\ball rights reserved\b|\bnon-commercial\b|\bno derivatives\b/i;

export function inferLicenseStatus(license: string): VisualLicenseStatus {
  const normalized = license.trim();

  if (!normalized) return "unknown";
  if (RESTRICTED.test(normalized)) return "rights_restricted";
  if (PUBLIC_DOMAIN.test(normalized)) return "public_domain";
  if (CREATIVE_COMMONS.test(normalized)) return "creative_commons";

  return "unknown";
}

export function inferAspectRatio(
  width?: number,
  height?: number,
): VisualAspectRatio | undefined {
  if (!width || !height || width <= 0 || height <= 0) return undefined;

  const ratio = width / height;
  const presets: Array<{ value: VisualAspectRatio; ratio: number }> = [
    { value: "16:9", ratio: 16 / 9 },
    { value: "4:5", ratio: 4 / 5 },
    { value: "1:1", ratio: 1 },
  ];

  return presets.reduce((closest, preset) =>
    Math.abs(preset.ratio - ratio) < Math.abs(closest.ratio - ratio)
      ? preset
      : closest,
  ).value;
}

export function isEditoriallyUsable(candidate: VisualSearchCandidate): boolean {
  if (!candidate.url || !candidate.license) return false;

  const licenseStatus = inferLicenseStatus(candidate.license);

  return licenseStatus === "public_domain" || licenseStatus === "creative_commons";
}

export function rankVisualCandidate(
  candidate: VisualSearchCandidate,
  query: string,
): number {
  const queryTerms = query
    .toLocaleLowerCase()
    .split(/\s+/)
    .map((term) => term.replace(/[^\p{L}\p{N}-]/gu, ""))
    .filter((term) => term.length > 2);

  const haystack = [
    candidate.title,
    candidate.description,
    candidate.author,
  ]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase();

  const queryScore = queryTerms.reduce(
    (score, term) => score + (haystack.includes(term) ? 10 : 0),
    0,
  );

  const licenseScore = (() => {
    switch (inferLicenseStatus(candidate.license)) {
      case "public_domain":
        return 40;
      case "creative_commons":
        return 25;
      case "rights_restricted":
        return -100;
      default:
        return -25;
    }
  })();

  const metadataScore =
    (candidate.author && candidate.author !== "Unknown" ? 5 : 0) +
    (candidate.description ? 5 : 0) +
    (candidate.width && candidate.height ? 5 : 0);

  return queryScore + licenseScore + metadataScore;
}

export function formatVisualAttribution(
  provenance: VisualProvenance,
): string {
  const parts = [provenance.author, provenance.sourceName, provenance.license]
    .filter(Boolean)
    .join(" · ");

  if (provenance.aiDisclosure) {
    return `${parts}${parts ? " · " : ""}AI-generated visual`;
  }

  return parts || provenance.attribution;
}

function generateVisualAssetId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 11)}`;
}

export function makeVisualAsset(
  input: CreateVisualAsset,
  now = new Date().toISOString(),
): VisualAsset {
  const sourceType = input.provenance.sourceType;
  const aiDisclosure =
    sourceType === "ai_generated" || input.provenance.aiDisclosure;

  return visualAssetSchema.parse({
    ...input,
    id: generateVisualAssetId(),
    aspectRatio:
      input.aspectRatio ??
      inferAspectRatio(input.width, input.height),
    reviewStatus: input.reviewStatus ?? "candidate",
    provenance: {
      ...input.provenance,
      aiDisclosure,
    },
    createdAt: now,
    updatedAt: now,
  });
}
