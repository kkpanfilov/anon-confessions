import express from "express";

import {
	getConfessionById,
	createConfession,
	getRandomConfessions,
	updateConfession,
	likeConfession,
	unlikeConfession,
	deleteConfession,
} from "./confessions.controller.js";

import { ensureAnonVoter } from "../middleware/anon-voter.middleware.js";

const router = express.Router();

// TODO: Маршруты в action-стиле (/create, /:id/edit, /:id/delete) быстро мешают масштабировать API, middleware и версионирование. Лучше держать ресурсную схему POST /, PATCH /:id, DELETE /:id.
router.route("/random").get(getRandomConfessions);
router.route("/create").post(createConfession);
router.route("/:id").get(getConfessionById);
router.route("/:id/edit").patch(updateConfession);
router.route("/:id/like").patch(ensureAnonVoter, likeConfession);
router.route("/:id/unlike").patch(ensureAnonVoter, unlikeConfession);
router.route("/:id/delete").delete(deleteConfession);

export default router;
