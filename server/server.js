import "dotenv/config";

import express from "express";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { rateLimit } from "express-rate-limit";

import { env } from "./app/validations/env.validation.js";

import confessionsRoutes from "./app/confessions/confessions.routes.js";

import { prisma } from "./app/prisma.js";

import { errorHandler, notFound } from "./app/middleware/error.middleware.js";
import { gracefulShutdown } from "./app/utils/gracefulShutdown.js";

const app = express();

async function main() {
	if (env.NODE_ENV === "development") app.use(morgan("dev"));

	const port = env.PORT;

	app.use(express.json({ limit: "32kb" }));
	app.use(helmet());
	app.use(
		cors({
			origin: env.CLIENT_URL,
			credentials: true,
		}),
	);
	app.use(
		rateLimit({
			windowMs: 15 * 60 * 1000, // 15 minutes
			limit: 100,
			standardHeaders: "draft-8",
			legacyHeaders: false,
			ipv6Subnet: 56,
		}),
	);
	app.use(cookieParser(env.COOKIE_SECRET));

	app.use("/api/confessions", confessionsRoutes);

	app.use(notFound);
	app.use(errorHandler);

	const server = app.listen(port, () =>
		console.log(`Server is running on port ${port}`),
	);

	global.isShuttingDown = false;

	process.on("SIGINT", () =>
		gracefulShutdown({
			signal: "SIGINT",
			server,
			prisma,
		}),
	);
	process.on("SIGTERM", () =>
		gracefulShutdown({
			signal: "SIGTERM",
			server,
			prisma,
		}),
	);
}

main().catch(async e => {
	console.error(e);
	await prisma.$disconnect();
	process.exit(1);
});
