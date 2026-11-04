const { z } = require("zod");

try {
  process.loadEnvFile();
} catch {}

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  PORT: z.coerce.number().int().min(1).max(65535).default(3000),

  DATABASE_URL: z
    .string()
    .min(1, "DATABASE_URL is required")
    .refine((value) => {
      try {
        const url = new URL(value);

        return url.protocol === "postgres:" || url.protocol === "postgresql:";
      } catch {
        return false;
      }
    }, "DATABASE_URL must be a valid PostgreSQL URL"),

  JWT_SECRET: z.string().min(32, "JWT_SECRET must have at least 32 characters"),

  JWT_EXPIRES_IN: z.string().min(1).default("15m"),

  REPOSITORY_MODE: z.enum(["knex", "memory"]).default("knex"),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error("Invalid environment configuration:");

  for (const issue of result.error.issues) {
    console.error(`  ${issue.path.join(".")}: ${issue.message}`);
  }

  process.exit(1);
}

module.exports = Object.freeze(result.data);
