import asyncHandler from "express-async-handler";

import argon2 from "argon2";
import { generateToken } from "../utils/crypto/generateToken.js";
import { hashToken } from "../utils/crypto/hashToken.js";

import { env } from "../validations/env.validation.js";

import { confessionSchema } from "../validations/confessions.validation.js";

import { prisma } from "../prisma.js";

/**
 * @description Get a confession by its id.
 * @function getConfessionById
 * @param {IncomingMessage} req - The incoming HTTP request.
 * @param {ServerResponse} res - The outgoing HTTP response.
 * @throws {Error} - If the confession is not found.
 * @returns {Promise<void>} - A promise that resolves or rejects with an error.
 */

export const getConfessionById = asyncHandler(async (req, res) => {
	const confessionId = confessionSchema.params.parse(req.params).id;

	const confession = await prisma.confession.findUnique({
		where: { id: confessionId },
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
 * @description Get random confessions.
 * @function getRandomConfessions
 * @param {IncomingMessage} req - The incoming HTTP request.
 * @param {ServerResponse} res - The outgoing HTTP response.
 * @returns {Promise<void>} - A promise that resolves or rejects with an error.
 */

export const getRandomConfessions = asyncHandler(async (req, res) => {
	const pivot = Math.random();

	const first = await prisma.confession.findMany({
		where: { randomKey: { gte: pivot } },
		orderBy: { randomKey: "asc" },
		take: 15,
		select: {
			id: true,
			title: true,
			createdAt: true,
			content: true,
			likes: true,
		},
	});

	const second =
		first.length < 15
			? await prisma.confession.findMany({
					where: { randomKey: { lt: pivot } },
					orderBy: { randomKey: "asc" },
					take: 15 - first.length,
					select: {
						id: true,
						title: true,
						createdAt: true,
						content: true,
						likes: true,
					},
				})
			: [];

	const confessions = [...first, ...second];

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
	const { title, content } = confessionSchema.body.parse(req.body);

	let isUserHasOwnerToken = false;

	if (req.signedCookies?.confession_owner_session) {
		isUserHasOwnerToken = true;
	}

	if (!content) {
		res.status(400);
		throw new Error("Confession content required");
	}

	if (!title) {
		res.status(400);
		throw new Error("Confession title required");
	}

	const ownerToken = isUserHasOwnerToken
		? req.signedCookies.confession_owner_session
		: generateToken();
	const ownerTokenHash = await argon2.hash(ownerToken);

	const confession = await prisma.confession.create({
		data: { title, content, ownerTokenHash },
		select: {
			id: true,
		},
	});

	if (!isUserHasOwnerToken) {
		res.cookie("confession_owner_session", ownerToken, {
			httpOnly: true,
			signed: true,
			sameSite: "strict",
			secure: true,
			maxAge: 1000 * 60 * 60 * 24 * 360,
			path: "/",
		});
	}

	res.status(201).json({ id: confession.id });
});

/**
 * @description Update a confession by its id.
 * @function updateConfession
 * @param {IncomingMessage} req - The incoming HTTP request.
 * @param {ServerResponse} res - The outgoing HTTP response.
 * @throws {Error} - If the confession is not found, or if the token hash does not match.
 * @returns {Promise<{id: string, title: string, content: string, message: string}>} - A promise that resolves or rejects with an error.
 */

export const updateConfession = asyncHandler(async (req, res) => {
	const confessionId = confessionSchema.params.parse(req.params).id;
	const ownerToken = req.signedCookies?.confession_owner_session;

	const { title, content } = confessionSchema.body.parse(req.body);

	if (!ownerToken) {
		res.status(401);
		throw new Error("Confession owner token required");
	}

	const confession = await prisma.confession.findUnique({
		where: { id: confessionId },
		select: {
			id: true,
			ownerTokenHash: true,
		},
	});

	if (!confession) {
		res.status(404);
		throw new Error("Confession not found");
	}

	const isHashVerified = await argon2.verify(
		confession.ownerTokenHash,
		ownerToken,
	);

	if (!isHashVerified) {
		res.status(403);
		throw new Error("Confession token hash does not match");
	}

	const updated = await prisma.confession.update({
		where: { id: confessionId },
		data: { title, content },
		select: {
			id: true,
			title: true,
			content: true,
		},
	});

	res.status(200).json({ ...updated, message: "Confession updated" });
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
	const confessionId = confessionSchema.params.parse(req.params).id;
	const ownerToken = req.signedCookies?.confession_owner_session;

	if (!ownerToken) {
		res.status(401);
		throw new Error("Confession token hash required");
	}

	const confession = await prisma.confession.findUnique({
		where: { id: confessionId },
		select: {
			id: true,
			ownerTokenHash: true,
		},
	});

	if (!confession) {
		res.status(404);
		throw new Error("Confession not found");
	}

	const isHashVerified = await argon2.verify(
		confession.ownerTokenHash,
		ownerToken,
	);

	if (!isHashVerified) {
		res.status(403);
		throw new Error("Confession token hash does not match");
	}

	const result = await prisma.$transaction(async tx => {
		await tx.confession.delete({
			where: { id: confessionId },
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
	const confessionId = confessionSchema.params.parse(req.params).id;
	const voterHash = hashToken(`${env.VOTER_SECRET}:${req.anonVoterId}`);

	const result = await prisma.$transaction(async tx => {
		const confession = await tx.confession.findUnique({
			where: { id: confessionId },
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
	const confessionId = confessionSchema.params.parse(req.params).id;
	const voterHash = hashToken(`${env.VOTER_SECRET}:${req.anonVoterId}`);

	const result = await prisma.$transaction(async tx => {
		const confession = await tx.confession.findUnique({
			where: { id: confessionId },
			select: {
				id: true,
				likes: true,
			},
		});

		if (!confession) {
			res.status(404);
			throw new Error("Confession not found");
		}

		const deleted = await tx.confessionLike.deleteMany({
			where: {
				confessionId,
				voterHash,
			},
		});

		if (deleted.count === 0) {
			return {
				id: confession.id,
				likes: confession.likes,
				message: "Already unliked",
			};
		}

		const decremented = await tx.confession.updateMany({
			where: {
				id: confession.id,
				likes: {
					gt: 0,
				},
			},
			data: {
				likes: {
					decrement: 1,
				},
			},
		});

		if (decremented.count === 1) {
			const updated = await tx.confession.findUnique({
				where: { id: confession.id },
				select: {
					id: true,
					likes: true,
				},
			});

			return { ...updated, message: "Successfully unliked confession" };
		}

		const actualLikes = await tx.confessionLike.count({
			where: {
				confessionId,
			},
		});

		const reconciled = await tx.confession.update({
			where: { id: confession.id },
			data: {
				likes: actualLikes,
			},
			select: {
				id: true,
				likes: true,
			},
		});

		return {
			...reconciled,
			message: "Successfully unliked confession (counter reconciled)",
		};
	});

	res.status(200).json(result);
});
