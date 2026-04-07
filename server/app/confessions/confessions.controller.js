import asyncHandler from "express-async-handler";

import { prisma } from "../prisma.js";

import { generateToken } from "../utils/crypto/generateToken.js";
import { hashToken } from "../utils/crypto/hashToken.js";

/**
 * @description Get a confession by its id.
 * @function getConfessionById
 * @param {IncomingMessage} req - The incoming HTTP request.
 * @param {ServerResponse} res - The outgoing HTTP response.
 * @throws {Error} - If the confession is not found.
 * @returns {Promise<void>} - A promise that resolves or rejects with an error.
 */

export const getConfessionById = asyncHandler(async (req, res) => {
	const confession = await prisma.confession.findUnique({
		where: { id: req.params.id },
		select: {
			id: true,
			createdAt: true,
			title: true,
			content: true,
			likes: true,
		},
	});

	if (!confession) {
		res.status(404);
		throw new Error("Confession not found");
	}

	res.status(200).json(confession);
});

/**
 * @description Get latest confessions.
 * @function getLatestConfessions
 * @param {IncomingMessage} req - The incoming HTTP request.
 * @param {ServerResponse} res - The outgoing HTTP response.
 * @returns {Promise<void>} - A promise that resolves or rejects with an error.
 */

export const getLatestConfessions = asyncHandler(async (req, res) => {
	const confessions = await prisma.confession.findMany({
		take: 10,
		orderBy: {
			createdAt: "desc",
		},
		select: {
			id: true,
			createdAt: true,
			title: true,
			content: true,
			likes: true,
		},
	});

	res.status(200).json(confessions);
});

/**
 * @description Create a new confession.
 * @function createConfession
 * @param {IncomingMessage} req - The incoming HTTP request.
 * @param {ServerResponse} res - The outgoing HTTP response.
 * @throws {Error} - If the confession content is missing.
 * @returns {Promise<Confession>} - A promise that resolves or rejects with an error.
 */

export const createConfession = asyncHandler(async (req, res) => {
	const body = { ...req.body };

	if (!body.content) {
		res.status(400);
		throw new Error("Confession content required");
	}

	if (!body.title) {
		res.status(400);
		throw new Error("Confession title required");
	}

	const token = generateToken();
	const tokenHash = hashToken(token);

	body.tokenHash = tokenHash;

	const confession = await prisma.confession.create({
		data: body,
		select: {
			id: true,
			tokenHash: true,
		},
	});

	res.status(201).json(confession);
});

/**
 * @description Delete a confession by its id.
 * @function deleteConfession
 * @param {IncomingMessage} req - The incoming HTTP request.
 * @param {ServerResponse} res - The outgoing HTTP response.
 * @throws {Error} - If the confession is not found, or if the token hash does not match.
 * @returns {Promise<{id: string, isDeleted: boolean}>} - A promise that resolves or rejects with an error.
 */

export const deleteConfession = asyncHandler(async (req, res) => {
	const confessionId = req.params.id;
	const tokenHash = req.body.tokenHash;

	if (!tokenHash) {
		res.status(400);
		throw new Error("Confession token hash required");
	}

	const confession = await prisma.confession.findUnique({
		where: { id: confessionId },
		select: {
			id: true,
			tokenHash: true,
		},
	});

	if (!confession) {
		res.status(404);
		throw new Error("Confession not found");
	}

	if (confession.tokenHash !== tokenHash) {
		res.status(401);
		throw new Error("Confession token hash does not match");
	}

	const result = await prisma.$transaction(async tx => {
		await tx.confession.delete({
			where: { id: confessionId },
		});

		await tx.confessionLike.deleteMany({
			where: {
				confessionId: confessionId,
			},
		});

		return {
			id: confessionId,
			isDeleted: true,
		};
	});

	res.status(200).json(result);
});

/**
 * @description Like a confession.
 * @function likeConfession
 * @param {IncomingMessage} req - The incoming HTTP request.
 * @param {ServerResponse} res - The outgoing HTTP response.
 * @throws {Error} - If the confession is not found.
 * @returns {Promise<Confession>} - A promise that resolves or rejects with an error.
 */

export const likeConfession = asyncHandler(async (req, res) => {
	const confessionId = req.params.id;
	const voterHash = hashToken(`${process.env.VOTER_SECRET}:${req.anonVoterId}`);

	const result = await prisma.$transaction(async tx => {
		const confession = await tx.confession.findUnique({
			where: { id: req.params.id },
			select: {
				id: true,
				likes: true,
			},
		});

		if (!confession) {
			res.status(404);
			throw new Error("Confession not found");
		}

		try {
			await tx.confessionLike.create({
				data: {
					confessionId: confessionId,
					voterHash: voterHash,
				},
			});
		} catch (err) {
			if (err.code === "P2002") {
				return {
					id: confession.id,
					likes: confession.likes,
					message: "Already liked",
				};
			}

			throw err;
		}

		const updated = await tx.confession.update({
			where: { id: confession.id },
			data: {
				likes: {
					increment: 1,
				},
			},
			select: {
				id: true,
				likes: true,
			},
		});

		return { ...updated, message: "Successfully liked confession" };
	});

	res.status(200).json(result);
});

/**
 * @description Unlike a confession.
 * @function likeConfession
 * @param {IncomingMessage} req - The incoming HTTP request.
 * @param {ServerResponse} res - The outgoing HTTP response.
 * @throws {Error} - If the confession is not found.
 * @returns {Promise<Confession>} - A promise that resolves or rejects with an error.
 */

export const unlikeConfession = asyncHandler(async (req, res) => {
	const confessionId = req.params.id;
	const voterHash = hashToken(`${process.env.VOTER_SECRET}:${req.anonVoterId}`);

	const result = await prisma.$transaction(async tx => {
		const confession = await tx.confession.findUnique({
			where: { id: req.params.id },
			select: {
				id: true,
				likes: true,
			},
		});

		if (!confession) {
			res.status(404);
			throw new Error("Confession not found");
		}

		await tx.confessionLike.delete({
			where: {
				confessionId_voterHash: {
					confessionId: confessionId,
					voterHash: voterHash,
				},
			},
		});

		const updated = await tx.confession.update({
			where: { id: confession.id },
			data: {
				likes: {
					decrement: 1,
				},
			},
			select: {
				id: true,
				likes: true,
			},
		});

		return { ...updated, message: "Successfully unliked confession" };
	});

	res.status(200).json(result);
});
