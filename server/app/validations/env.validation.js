import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.url(),
  CLIENT_URL: z.url(),
  PORT: z.coerce.number().int().positive().default(4200),
  COOKIE_SECRET: z.string().min(32),
  VOTER_SECRET: z.string().min(32),
});

export const env = schema.parse(process.env);