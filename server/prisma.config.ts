import "dotenv/config"; // Ensure environment variables are loaded
import { defineConfig, env } from "prisma/config";

export default defineConfig({
	schema: "prisma/schema.prisma",
	datasource: {
		url: env("DATABASE_URL"), // Or a hardcoded string for testing
	},
});
