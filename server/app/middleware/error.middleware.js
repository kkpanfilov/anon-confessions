import { env } from "../validations/env.validation.js";

/**
 * Returns a 404 Not Found error for the given request.
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @param {Function} next - The next middleware function to call.
 */

export const notFound = (req, res, next) => {
	const error = new Error(`Not Found - ${req.originalUrl}`);
	res.status(404);
	next(error);
};

/**
 * Handles errors by sending a JSON response with the error message and stack trace (if not in production).
 * @param {Error} err - The error object.
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @param {Function} next - The next middleware function to call.
 */

export const errorHandler = (err, req, res, next) => {
	if (env.NODE_ENV === "development") console.error(err);
	const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
	res.status(statusCode);
	res.json({
		message: err.message,
		stack: env.NODE_ENV === "production" ? null : err.stack,
	});
};
