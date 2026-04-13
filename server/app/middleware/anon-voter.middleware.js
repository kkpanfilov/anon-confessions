import { generateToken } from "../utils/crypto/generateToken.js";

const COOKIE_NAME = "anon_voter_id";

/**
 * Ensures that the request has an anon voter ID cookie.
 * If the cookie is not present, a new token is generated and set as a cookie.
 * @param {express.Request} req - The incoming HTTP request.
 * @param {express.Response} res - The outgoing HTTP response.
 * @param {express.NextFunction} next - The next middleware or route handler.
 * @returns {void} - Nothing is returned.
 */

export function ensureAnonVoter(req, res, next) {
	const anonVoterId = req.signedCookies?.[COOKIE_NAME];

	if (!anonVoterId) {
		const token = generateToken();
		req.anonVoterId = token;

		res.cookie(COOKIE_NAME, token, {
			httpOnly: true,
			signed: true,
			sameSite: "lax",
			secure: true,
			maxAge: 1000 * 60 * 60 * 24 * 180,
			path: "/",
		});
	} else {
		req.anonVoterId = anonVoterId;
	}

	next();
}
