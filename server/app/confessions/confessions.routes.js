import { Router } from "express";

import {
	getRandomConfessions,
	createConfession,
	getConfessionById,
	updateConfession,
	deleteConfession,
	likeConfession,
	unlikeConfession,
} from "./confessions.controller.js";

import { ensureAnonVoter } from "../middleware/anon-voter.middleware.js";

const router = Router();

router.get("/random", getRandomConfessions);

router.post("/", createConfession);
router.get("/:id", getConfessionById);
router.patch("/:id", updateConfession);
router.delete("/:id", deleteConfession);

router.patch("/:id/like", ensureAnonVoter, likeConfession);
router.patch("/:id/unlike", ensureAnonVoter, unlikeConfession);

export default router;
