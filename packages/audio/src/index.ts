import { z } from "zod";
import { jobNameSchema, jobStatusSchema } from "@fieldpress/domain";

export const mediaJobSchema = z.object({
  id: z.string().min(1),
  assetId: z.string().min(1),
  name: jobNameSchema,
  status: jobStatusSchema,
  attempt: z.number().int().nonnegative().default(0),
});
export type MediaJob = z.infer<typeof mediaJobSchema>;

export const JOB_PIPELINE = [
  "media.inspect",
  "media.generate_proxy",
  "media.generate_waveform",
  "media.transcribe",
  "media.index",
] as const satisfies readonly z.infer<typeof jobNameSchema>[];
