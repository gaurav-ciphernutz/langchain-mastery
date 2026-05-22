import dotenv from "dotenv";

import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  GOOGLE_API_KEY: z.string().min(1),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

export const env = envSchema.parse(process.env);
