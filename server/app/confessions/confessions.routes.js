import express from "express";

import {
	getConfessionById,
	createConfession,
	getLatestConfessions,
	likeConfession,
	unlikeConfession,
} from "./confessions.controller.js";

import { ensureAnonVoter } from "../middleware/anon-voter.middleware.js";

const router = express.Router();

router.route("/latest").get(getLatestConfessions);
router.route("/create").post(createConfession);
router.route("/:id").get(getConfessionById);
router.route("/:id/like").patch(ensureAnonVoter, likeConfession);
router.route("/:id/unlike").patch(ensureAnonVoter, unlikeConfession);

export default router;
