import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./dist/models/*.js",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL as string, // <- must not be undefined
  },
  verbose: true,
  strict: true,
});
