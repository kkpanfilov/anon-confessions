class RenderService {
	/**
	 * Takes an HTML string and returns a corresponding DOM element
	 * @param {string} html - The HTML string to convert to a DOM element
	 * @param {Object} components - The components to replace in the HTML
	 * @param {Object} styles - The styles to replace in the HTML
	 * @returns {HTMLElement} The converted DOM element
	 */

	htmlToElement(html, components = {}, styles) {
		const template = document.createElement("template");
		template.innerHTML = html.trim();

		const element = template.content.firstElementChild;

		if (styles) {
			this.#applyModuleStyles(element, styles);
		}

		if (components) {
			this.#replaceComponentsTags(element, components);
		}

		return element;
	}

	/**
	 * Replaces all components in the HTML with their corresponding rendered HTML
	 * @param {HTMLElement} htmlElement - The HTML element to replace components in
	 * @param {Object} components - The components to replace in the HTML
	 */

	#replaceComponentsTags(htmlElement, components) {
		for (const key in components) {
			const component = components[key];

			if (!htmlElement.querySelector(key)) {
				console.error("No components found");
				continue;
			}

			const allComponentsElements = htmlElement.querySelectorAll(key);

			for (const componentElement of allComponentsElements) {
				componentElement.replaceWith(component);
			}
		}
	}

	/**
	 * Replaces all classes in the HTML with their corresponding styles
	 * @param {HTMLElement} htmlElement - The HTML element to replace classes in
	 * @param {Object} styles - The styles to replace in the HTML
	 */

	#applyModuleStyles(htmlElement, styles) {
		if (!htmlElement) return;

		console.log(styles)
		const applyStyles = element => {
			for (const [key, value] of Object.entries(styles)) {
				if (element.classList.contains(key)) {
					element.classList.remove(key);
					element.classList.add(value);
				}
			}
		};

		if (htmlElement.getAttribute("class")) {
			applyStyles(htmlElement);
		}

		const elements = htmlElement.querySelectorAll("*");
		elements.forEach(applyStyles);
	}
}

export default new RenderService();
