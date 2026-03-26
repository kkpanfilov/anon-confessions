export class JQuery {
	/**
	 * Creates a new instance of JQuery class.
	 * @param {string|HTMLElement} elem - the element to query
	 * @throws {Error} if the element is not found
	 */

	constructor(elem) {
		if (typeof elem === "string") {
			this.element = document.querySelector(elem);

			if (!this.element) {
				throw new Error(`Element ${elem} not found`);
			}
		} else if (elem instanceof HTMLElement) {
			this.element = elem;
		} else {
			throw new Error("Invalid selector or HTMLElement");
		}
	}

	/**
	 * Finds an element within the current element.
	 * @param {string} selector - the CSS selector to find
	 * @throws {Error} if the element is not found
	 * @returns {JQuery} a new instance of JQuery class pointing to the found element
	 */

	find(selector) {
		const foundElement = this.element.querySelector(selector);

		if (!foundElement) {
			throw new Error(`Element ${selector} not found`);
		}

		return new JQuery(this.element.querySelector(selector));
	}

	append(elem) {
		if (!(elem instanceof HTMLElement)) {
			throw new Error("Invalid element");
		}

		this.element.appendChild(elem);
		return this;
	}

	/**
	 * Sets CSS styles to the current element.
	 * @param {object<string,string>} styles - an object with CSS properties and values
	 * @throws {Error} if any of the properties or values are invalid
	 */

	css(styles) {
		for (const property in styles) {
			if (
				typeof property !== "string" ||
				typeof styles[property] !== "string"
			) {
				console.error("Invalid property or value");
				continue;
			}

			this.element.style[property] = styles[property];
			return this;
		}
	}

	text() {}
}

export function $(elem) {
	return new JQuery(elem);
}
