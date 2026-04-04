import crypto from "crypto";

/**
 * Generates a cryptographically strong pseudorandom value in
 * hexadecimal notation. The length of the generated value is
 * 32 bytes (256 bits). The generated value is suitable for
 * use as a token in various secure contexts.
 *
 * @returns {string} A cryptographically strong pseudorandom value
 * in hexadecimal notation.
 */

export function generateToken() {
	return crypto.randomBytes(32).toString("hex");
}
