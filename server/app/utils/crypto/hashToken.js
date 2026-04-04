import crypto from "crypto";

/**
 * Returns a SHA-256 hash of the given token.
 * @param {string} token The token to be hashed.
 * @returns {string} The hashed token.
 */

export function hashToken(token) {
	return crypto.createHash("sha256").update(token).digest("hex");
}
