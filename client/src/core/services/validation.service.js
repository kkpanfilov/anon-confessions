class ValidationService {
	/**
	 * Validate if a given string is non-empty.
	 * @param {string} str the string to validate.
	 * @returns {boolean} true if the string is non-empty, false otherwise.
	 */

	#validateNonEmptyString(str) {
		return str && typeof str === "string" && str.trim().length > 0;
	}

	/**
	 * Validate if a given form field is non-empty.
	 * @param {Object} field the form field to validate.
	 * @returns {boolean} true if the field is non-empty, false otherwise.
	 */
  
	validateNonEmptyField(field) {
		return this.#validateNonEmptyString(field.value);
	}
}

export default new ValidationService();
