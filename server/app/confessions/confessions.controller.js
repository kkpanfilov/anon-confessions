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
 * @description Like a confession.
 * @function likeConfession
 * @param {IncomingMessage} req - The incoming HTTP request.
 * @param {ServerResponse} res - The outgoing HTTP response.
 * @throws {Error} - If the confession is not found.
 * @returns {Promise<Confession>} - A promise that resolves or rejects with an error.
 */

export const likeConfession = asyncHandler(async (req, res) => {
	const confession = await prisma.confession.findUnique({
		where: { id: req.params.id },
	});

	if (!confession) {
		res.status(404);
		throw new Error("Confession not found");
	}

	const updatedConfession = await prisma.confession.update({
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

	res.status(200).json(updatedConfession);
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
	const confession = await prisma.confession.findUnique({
		where: { id: req.params.id },
	});

	if (!confession) {
		res.status(404);
		throw new Error("Confession not found");
	}

	const updatedConfession = await prisma.confession.update({
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

	res.status(200).json(updatedConfession);
});
