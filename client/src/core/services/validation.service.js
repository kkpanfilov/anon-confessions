class ValidationService {
	#UUID_REGEX =
		/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

	/**
	 * Validate if a given string is non-empty.
	 * @param {string} str the string to validate.
	 * @returns {boolean} true if the string is non-empty, false otherwise.
	 */

	#validateNonEmptyString(str) {
		return typeof str === "string" && str.trim().length > 0;
	}

	/**
	 * Normalize value to a trimmed string.
	 * @param {*} value the value to normalize.
	 * @returns {string} trimmed string or empty string for non-string values.
	 */

	#normalizeString(value) {
		return typeof value === "string" ? value.trim() : "";
	}

	/**
	 * Check if a value is a finite number.
	 * @param {*} value the value to check.
	 * @returns {boolean} true when value is a finite number.
	 */

	#isNumber(value) {
		return (
			typeof value === "number" &&
			!Number.isNaN(value) &&
			Number.isFinite(value)
		);
	}

	/**
	 * Convert value to number when possible.
	 * @param {*} value value to convert.
	 * @returns {number} finite number or NaN when conversion fails.
	 */

	#toNumber(value) {
		if (this.#isNumber(value)) {
			return value;
		}

		if (typeof value === "string" && value.trim() !== "") {
			const parsed = Number(value);
			return this.#isNumber(parsed) ? parsed : NaN;
		}

		return NaN;
	}

	/**
	 * Validate required value for primitive and array inputs.
	 * @param {*} value value to validate.
	 * @returns {boolean} true when value is present.
	 */

	validateRequired(value) {
		if (typeof value === "string") {
			return this.#validateNonEmptyString(value);
		}

		if (Array.isArray(value)) {
			return value.length > 0;
		}

		return value !== null && value !== undefined;
	}

	/**
	 * Validate that value is a string.
	 * @param {*} value value to validate.
	 * @returns {boolean} true when value is a string.
	 */

	validateString(value) {
		return typeof value === "string";
	}

	/**
	 * Validate that value is a boolean.
	 * @param {*} value value to validate.
	 * @returns {boolean} true when value is a boolean.
	 */

	validateBoolean(value) {
		return typeof value === "boolean";
	}

	/**
	 * Validate that value is an array.
	 * @param {*} value value to validate.
	 * @returns {boolean} true when value is an array.
	 */

	validateArray(value) {
		return Array.isArray(value);
	}

	/**
	 * Validate that value is a plain object (not null and not array).
	 * @param {*} value value to validate.
	 * @returns {boolean} true when value is an object.
	 */

	validateObject(value) {
		return value !== null && typeof value === "object" && !Array.isArray(value);
	}

	/**
	 * Validate minimum string length.
	 * @param {*} value value to validate.
	 * @param {number} minLength minimum allowed length.
	 * @returns {boolean} true when string length is greater than or equal to minLength.
	 */

	validateMinLength(value, minLength) {
		if (
			!this.validateString(value) ||
			!this.#isNumber(minLength) ||
			minLength < 0
		) {
			return false;
		}

		return value.trim().length >= minLength;
	}

	/**
	 * Validate maximum string length.
	 * @param {*} value value to validate.
	 * @param {number} maxLength maximum allowed length.
	 * @returns {boolean} true when string length is less than or equal to maxLength.
	 */

	validateMaxLength(value, maxLength) {
		if (
			!this.validateString(value) ||
			!this.#isNumber(maxLength) ||
			maxLength < 0
		) {
			return false;
		}

		return value.trim().length <= maxLength;
	}

	/**
	 * Validate that string length is in the provided range.
	 * @param {*} value value to validate.
	 * @param {number} minLength minimum allowed length.
	 * @param {number} maxLength maximum allowed length.
	 * @returns {boolean} true when value length is within range.
	 */

	validateLengthRange(value, minLength, maxLength) {
		if (
			!this.#isNumber(minLength) ||
			!this.#isNumber(maxLength) ||
			minLength > maxLength
		) {
			return false;
		}

		return (
			this.validateMinLength(value, minLength) &&
			this.validateMaxLength(value, maxLength)
		);
	}

	/**
	 * Validate that value is an integer.
	 * @param {*} value value to validate.
	 * @returns {boolean} true when value is an integer number.
	 */

	validateInteger(value) {
		const numeric = this.#toNumber(value);
		return Number.isInteger(numeric);
	}

	/**
	 * Validate that value is a finite number.
	 * @param {*} value value to validate.
	 * @returns {boolean} true when value is numeric.
	 */

	validateNumber(value) {
		return this.#isNumber(this.#toNumber(value));
	}

	/**
	 * Validate positive number.
	 * @param {*} value value to validate.
	 * @param {Object} [options] validation options.
	 * @param {boolean} [options.allowZero=false] allow zero as valid value.
	 * @returns {boolean} true when number is positive (or non-negative if allowZero).
	 */

	validatePositiveNumber(value, { allowZero = false } = {}) {
		const numeric = this.#toNumber(value);

		if (!this.#isNumber(numeric)) {
			return false;
		}

		return allowZero ? numeric >= 0 : numeric > 0;
	}

	/**
	 * Validate that numeric value is between min and max.
	 * @param {*} value value to validate.
	 * @param {number} min minimum allowed value.
	 * @param {number} max maximum allowed value.
	 * @returns {boolean} true when value is in range.
	 */

	validateNumberRange(value, min, max) {
		const numeric = this.#toNumber(value);

		if (
			!this.#isNumber(numeric) ||
			!this.#isNumber(min) ||
			!this.#isNumber(max) ||
			min > max
		) {
			return false;
		}

		return numeric >= min && numeric <= max;
	}

	/**
	 * Validate HTTP/HTTPS URL.
	 * @param {*} url URL to validate.
	 * @returns {boolean} true when URL is valid and uses http or https protocol.
	 */

	validateUrl(url) {
		const normalizedUrl = this.#normalizeString(url);

		if (!normalizedUrl) {
			return false;
		}

		try {
			const parsedUrl = new URL(normalizedUrl);
			return ["http:", "https:"].includes(parsedUrl.protocol);
		} catch {
			return false;
		}
	}

	/**
	 * Validate date value.
	 * @param {*} value date input as Date or string.
	 * @returns {boolean} true when value can be parsed to a valid date.
	 */

	validateDate(value) {
		if (value instanceof Date) {
			return !Number.isNaN(value.getTime());
		}

		if (!this.validateString(value)) {
			return false;
		}

		const date = new Date(value);
		return !Number.isNaN(date.getTime());
	}

	/**
	 * Validate UUID string in canonical format.
	 * @param {*} value value to validate.
	 * @returns {boolean} true when value matches UUID format.
	 */

	validateUuid(value) {
		const normalizedValue = this.#normalizeString(value);
		return Boolean(normalizedValue) && this.#UUID_REGEX.test(normalizedValue);
	}

	/**
	 * Validate that value is in list of allowed values.
	 * @param {*} value value to validate.
	 * @param {Array<*>} [allowedValues=[]] allowed values.
	 * @returns {boolean} true when value exists in allowedValues.
	 */

	validateOneOf(value, allowedValues = []) {
		return Array.isArray(allowedValues) && allowedValues.includes(value);
	}

	/**
	 * Validate strict equality between two values.
	 * @param {*} value first value.
	 * @param {*} targetValue second value.
	 * @returns {boolean} true when values are strictly equal.
	 */

	validateMatch(value, targetValue) {
		return value === targetValue;
	}
}

export default new ValidationService();
