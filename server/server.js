import "dotenv/config";

import express from "express";
import morgan from "morgan";

import confessionsRoutes from "./app/confessions/confessions.routes.js";

const app = express();

async function main() {
	if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

	const port = process.env.PORT || 3000;

	app.use(express.json());
	app.use("/api/confessions", confessionsRoutes);

	app.listen(port, () => console.log(`Server is running on port ${port}`));
}

main();
