import "dotenv/config";

import express from "express";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";

import confessionsRoutes from "./app/confessions/confessions.routes.js";

import { prisma } from "./app/prisma.js";

import { errorHandler, notFound } from "./app/middleware/error.middleware.js";

const app = express();
async function main() {
	if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

	const port = process.env.PORT || 4200;

	app.use(
		cors({
			origin: process.env.CLIENT_URL,
			credentials: true,
		}),
	);
	app.use(express.json());
	app.use(cookieParser(process.env.COOKIE_SECRET));
	app.use("/api/confessions", confessionsRoutes);

	app.use(notFound);
	app.use(errorHandler);

	app.listen(port, () => console.log(`Server is running on port ${port}`));
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async e => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	});
