class ValidationService {
	// TODO: Валидация сейчас размазана по компонентам и серверу, а этот сервис почти не участвует в потоке. Пока правила не будут собраны в одном месте, front и back будут расходиться по ограничениям и ошибкам.
	#EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	#USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;
	#SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
	#PHONE_REGEX = /^\+?[0-9\s\-()]{7,20}$/;

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
	 * Validate email format.
	 * @param {*} email email to validate.
	 * @returns {boolean} true when email has valid format.
	 */

	validateEmail(email) {
		const normalizedEmail = this.#normalizeString(email);
		return this.#EMAIL_REGEX.test(normalizedEmail);
	}

	/**
	 * Validate username format and length.
	 * @param {*} username username to validate.
	 * @param {Object} [options] username validation options.
	 * @param {number} [options.minLength=3] minimum username length.
	 * @param {number} [options.maxLength=30] maximum username length.
	 * @returns {boolean} true when username matches constraints.
	 */

	validateUsername(username, { minLength = 3, maxLength = 30 } = {}) {
		const normalizedUsername = this.#normalizeString(username);

		if (!this.validateLengthRange(normalizedUsername, minLength, maxLength)) {
			return false;
		}

		return this.#USERNAME_REGEX.test(normalizedUsername);
	}

	/**
	 * Validate password complexity rules.
	 * @param {*} password password to validate.
	 * @param {Object} [options] password validation options.
	 * @param {number} [options.minLength=8] minimum password length.
	 * @param {boolean} [options.requireUppercase=true] require at least one uppercase letter.
	 * @param {boolean} [options.requireLowercase=true] require at least one lowercase letter.
	 * @param {boolean} [options.requireNumber=true] require at least one digit.
	 * @param {boolean} [options.requireSpecialChar=false] require at least one special character.
	 * @returns {boolean} true when password matches all enabled rules.
	 */

	validatePassword(
		password,
		{
			minLength = 8,
			requireUppercase = true,
			requireLowercase = true,
			requireNumber = true,
			requireSpecialChar = false,
		} = {},
	) {
		if (!this.validateMinLength(password, minLength)) {
			return false;
		}

		if (requireUppercase && !/[A-Z]/.test(password)) {
			return false;
		}

		if (requireLowercase && !/[a-z]/.test(password)) {
			return false;
		}

		if (requireNumber && !/[0-9]/.test(password)) {
			return false;
		}

		if (requireSpecialChar && !/[^a-zA-Z0-9]/.test(password)) {
			return false;
		}

		return true;
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
	 * Validate phone number format.
	 * @param {*} phone phone value to validate.
	 * @returns {boolean} true when phone matches allowed pattern.
	 */

	validatePhone(phone) {
		const normalizedPhone = this.#normalizeString(phone);
		return this.#PHONE_REGEX.test(normalizedPhone);
	}

	/**
	 * Validate slug format.
	 * @param {*} value slug value to validate.
	 * @returns {boolean} true when value is a valid slug.
	 */

	validateSlug(value) {
		const normalizedValue = this.#normalizeString(value);
		return this.#SLUG_REGEX.test(normalizedValue);
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
	 * Validate that date value is within provided date range.
	 * @param {*} value date value to validate.
	 * @param {*} minDate minimum allowed date.
	 * @param {*} maxDate maximum allowed date.
	 * @returns {boolean} true when value is inside range.
	 */

	validateDateRange(value, minDate, maxDate) {
		if (
			!this.validateDate(value) ||
			!this.validateDate(minDate) ||
			!this.validateDate(maxDate)
		) {
			return false;
		}

		const current = new Date(value).getTime();
		const min = new Date(minDate).getTime();
		const max = new Date(maxDate).getTime();

		if (min > max) {
			return false;
		}

		return current >= min && current <= max;
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

	/**
	 * Validate checkbox checked state.
	 * @param {*} value checkbox value.
	 * @returns {boolean} true when checkbox is checked.
	 */

	validateCheckboxChecked(value) {
		return value === true;
	}

	/**
	 * Validate if a given form field is non-empty.
	 * @param {Object} field the form field to validate.
	 * @returns {boolean} true if the field is non-empty, false otherwise.
	 */

	validateNonEmptyField(field) {
		return this.#validateNonEmptyString(field?.value);
	}
}

export default new ValidationService();
