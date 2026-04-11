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
 * @description Get random confessions.
 * @function getRandomConfessions
 * @param {IncomingMessage} req - The incoming HTTP request.
 * @param {ServerResponse} res - The outgoing HTTP response.
 * @returns {Promise<void>} - A promise that resolves or rejects with an error.
 */

export const getRandomConfessions = asyncHandler(async (req, res) => {
	// TODO: Здесь сразу три проблемы: $queryRawUnsafe не нужен для статичного SQL, ORDER BY RANDOM() плохо масштабируется, а SELECT * публично светит tokenHash. В текущем виде любой клиент может вытащить секрет владения из фида.
	const confessions = await prisma.$queryRawUnsafe(
		`SELECT * FROM "Confession" ORDER BY RANDOM() LIMIT 15;`,
	);

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

	// TODO: Серверная валидация почти отсутствует: нет trim/type/maxLength whitelist-а. Сейчас UI-лимиты легко обходятся прямым запросом, а лишние поля из req.body уходят дальше по слою данных.
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
		// TODO: Не передавай body в Prisma как есть. Это mass assignment: клиент может подсовывать likes/createdAt/updatedAt и другие поля, которые UI не должен контролировать.
		data: body,
		select: {
			id: true,
			// TODO: Сейчас клиент получает уже готовый tokenHash и потом использует его как bearer-secret. Тогда хеш перестаёт быть защитой: при утечке БД или ответа можно редактировать и удалять запись без знания исходного token.
			tokenHash: true,
		},
	});

	res.status(201).json(confession);
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
	const confessionId = req.params.id;
	const tokenHash = req.body.tokenHash;
	const body = { ...req.body };

	// TODO: Нужно отдельно валидировать req.params.id как UUID и не отдавать управление формату API через исключения Prisma. Иначе часть ошибок будет 500 вместо предсказуемых 400/404.
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

	// TODO: body содержит и tokenHash, и любые остальные поля пользователя, а дальше целиком идёт в update. Это прямой mass assignment и возможность менять технические поля модели.
	const updated = await prisma.confession.update({
		where: { id: confession.id },
		data: body,
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

		// TODO: Здесь дублируется ответственность schema.prisma: для ConfessionLike уже стоит onDelete: Cascade. Лишняя ручная очистка создаёт расхождение между кодом и схемой.
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

		// TODO: delete бросит исключение, если лайка уже нет или клиентский likedConfessions рассинхронизирован с сервером. Для публичного endpoint это должен быть идемпотентный сценарий, а не 500.
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
