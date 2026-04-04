import express from "express";

import {
	getConfessionById,
	getLatestConfessions,
	createConfession,
} from "./confessions.controller.js";

const router = express.Router();

router.route("/latest").get(getLatestConfessions);
router.route("/create").post(createConfession);
router.route("/:id").get(getConfessionById);

export default router;
