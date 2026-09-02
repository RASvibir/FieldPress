import { z } from "zod";

const optionalSecret = z.string().optional().default("");

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_URL: z.string().url().default("http://localhost:5173"),
  PUBLIC_ORIGIN: z.string().url().default("https://fieldpress.studio"),
  API_URL: z.string().url().default("http://localhost:3000"),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1),
  DATABASE_URL_UNPOOLED: z.string().optional(),
  AUTH_SECRET: optionalSecret,
  AUTH_ISSUER: optionalSecret,
  AUTH_AUDIENCE: optionalSecret,
  S3_ENDPOINT: optionalSecret,
  S3_REGION: z.string().default("auto"),
  S3_BUCKET: z.string().default("fieldpress-private"),
  S3_ACCESS_KEY_ID: optionalSecret,
  S3_SECRET_ACCESS_KEY: optionalSecret,
  S3_PUBLIC_BASE_URL: optionalSecret,
  FFMPEG_PATH: z.string().default("ffmpeg"),
  FFPROBE_PATH: z.string().default("ffprobe"),
  MEDIA_MAX_UPLOAD_BYTES: z.coerce.number().int().positive().default(21474836480),
  QUEUE_URL: optionalSecret,
  TRANSCRIPTION_PROVIDER: optionalSecret,
  TRANSCRIPTION_API_KEY: optionalSecret,
  SENTRY_DSN: optionalSecret,
  LOG_LEVEL: z.string().default("info"),
  GEMINI_API_KEY: optionalSecret,
  GEMINI_MODEL: z.string().default("gemini-3.5-flash"),
});

export type AppEnv = z.infer<typeof envSchema>;

const productionSecrets = [
  "AUTH_SECRET",
  "S3_ACCESS_KEY_ID",
  "S3_SECRET_ACCESS_KEY",
] as const;

export function loadEnv(raw: NodeJS.Dict<string> = process.env): AppEnv {
  const parsed = envSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(`Invalid environment: ${parsed.error.message}`);
  }
  const env = parsed.data;
  if (env.NODE_ENV === "production") {
    for (const key of productionSecrets) {
      if (!env[key]) {
        throw new Error(`Missing required production secret: ${key}`);
      }
    }
  }
  return env;
}
