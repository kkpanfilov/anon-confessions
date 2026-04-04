class FormService {
	/**
	 * Get the form data from the given form element
	 * @param {HTMLFormElement} form - The form element
	 * @returns {Object} - The form data
	 * @throws {Error} - If the form or element is invalid
	 */
  
	getFormData(form) {
		if (!form) {
			throw new Error("Form is required");
		}

		if (!(form instanceof HTMLFormElement)) {
			throw new Error("Invalid element");
		}

		if (form.tagName.toLowerCase() !== "form") {
			throw new Error("Invalid form");
		}

		const formData = new FormData(form);
		const data = {};
		formData.forEach((value, key) => {
			data[key] = value;
		});
		return data;
	}
}

export default new FormService();
