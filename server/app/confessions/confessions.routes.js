import express from "express";

import {
	getConfessionById,
	createConfession,
	getLatestConfessions,
	likeConfession,
} from "./confessions.controller.js";

const router = express.Router();

router.route("/latest").get(getLatestConfessions);
router.route("/create").post(createConfession);
router.route("/:id").get(getConfessionById);
router.route("/:id/like").patch(likeConfession);

export default router;
