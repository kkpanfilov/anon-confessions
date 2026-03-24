export class BaseScreen {
	/**
	 * Create a new BaseScreen instance
	 * @param {string} title - title of the page
	 */

	constructor({ title } = {}) {
		if (title) document.title = `${title} | Anon Confessions`;
	}

	/**
	 * Render the child component
	 * @return {HTMLElement}
	 */
	render() {
		throw new Error("Render method mist be implemented int the child class");
	}
}
