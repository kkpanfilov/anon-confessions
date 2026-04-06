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

	/**
	 * Appends an element to the current element.
	 * @param {HTMLElement} elem - the element to append
	 * @throws {Error} if the element is not an HTMLElement
	 * @returns {JQuery} a new instance of JQuery class pointing to the modified element
	 */

	append(elem) {
		if (!(elem instanceof HTMLElement)) {
			throw new Error("Invalid element");
		}

		this.element.appendChild(elem);
		return this;
	}

	/**
	 * Inserts an element before the current element.
	 * @param {HTMLElement} elem - the element to insert before
	 * @throws {Error} if the element is not an HTMLElement
	 * @returns {JQuery} a new instance of JQuery class pointing to the modified element
	 */

	before(elem) {
		if (!(elem instanceof HTMLElement)) {
			throw new Error("Invalid element");
		}

		this.element.before(elem);
		return this;
	}

	/**
	 * Replaces all children of the current element with the given element.
	 * @param {HTMLElement} elem - the element to replace all children with
	 * @throws {Error} if the element is not an HTMLElement
	 * @returns {JQuery} a new instance of JQuery class pointing to the modified element
	 */

	replaceChildren(elem) {
		if (!(elem instanceof HTMLElement)) {
			throw new Error("Invalid element");
		}

		this.element.replaceChildren(elem);
		return this;
	}

	/**
	 * Clears all children of the current element.
	 * @returns {JQuery} a new instance of JQuery class pointing to the modified element
	 */

	clear() {
		this.element.innerHTML = "";
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

	/**
	 * Adds a class to the current element.
	 * @param {string} className - the class to add
	 * @throws {Error} if the class name is not a string
	 * @returns {JQuery} a new instance of JQuery class pointing to the modified element
	 */

	addClass(className) {
		if (typeof className !== "string") {
			throw new Error("Invalid class name");
		}

		this.element.classList.add(className);
		return this;
	}

	/**
	 * Removes a class from the current element.
	 * @param {string} className - the class to remove
	 * @throws {Error} if the class name is not a string
	 * @returns {JQuery} a new instance of JQuery class pointing to the modified element
	 */

	removeClass(className) {
		if (typeof className !== "string") {
			throw new Error("Invalid class name");
		}

		this.element.classList.remove(className);
		return this;
	}

	/**
	 * Sets the text content of the current element.
	 * @param {string} text - the text to set
	 * @throws {Error} if the text is not a string
	 * @returns {JQuery} a new instance of JQuery class pointing to the modified element
	 */

	text(text) {
		if (typeof text !== "string") {
			throw new Error("Invalid text");
		}

		this.element.textContent = text;
		return this;
	}

	/**
	 * Sets an attribute to the current element.
	 * @param {string} attr - the attribute to set
	 * @param {string} value - the value to set
	 * @throws {Error} if the attribute or value are invalid
	 * @returns {JQuery} a new instance of JQuery class pointing to the modified element
	 */

	attr(attr, value) {
		if (typeof attr !== "string") {
			throw new Error("Invalid attribute");
		}

		if (typeof value !== "string") {
			throw new Error("Invalid value");
		}

		this.element.setAttribute(attr, value);
		return this;
	}

	/**
	 * Adds an event listener to the current element.
	 * @param {string} event - the event to listen to
	 * @param {function} callback - the function to call when the event is triggered
	 * @returns {JQuery} a new instance of JQuery class pointing to the modified element
	 */

	on(event, callback) {
		this.element.addEventListener(event, callback);
		return this;
	}

	/**
	 * Submits a form when the given element is a form.
	 * @param {function} onSubmit - the function to call when the form is submitted
	 * @throws {Error} if the element is not a form
	 */

	submit(onSubmit) {
		if (this.element.tagName.toLowerCase() === "form") {
			this.element.addEventListener("submit", e => {
				e.preventDefault();
				onSubmit(e);
			});
		} else {
			throw new Error("Element is not a form");
		}

		return this;
	}
}

export function $(elem) {
	return new JQuery(elem);
}
