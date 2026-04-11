import { env } from "./validations/env.validation.js";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
	connectionString: env.DATABASE_URL,
});

export const prisma = new PrismaClient({ adapter });
