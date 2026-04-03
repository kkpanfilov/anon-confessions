class Storage {
	/**
	 * Sets the value of a key in local storage.
	 *
	 * @param {string} key
	 * @param {*} value
	 */

	setItem(key, value) {
		localStorage.setItem(key, value);
	}

	/**
	 * Returns the value of a key in local storage.
	 * @param {string} key - The key of the value to retrieve.
	 * @returns {*} - The value associated with the key in local storage.
	 */

	getItem(key) {
		return localStorage.getItem(key);
	}

	/**
	 * Removes the value of a key from local storage.
	 *
	 * @param {string} key - The key of the value to remove.
	 */
  
	removeItem(key) {
		localStorage.removeItem(key);
	}

	/**
	 * Clears all key-value pairs from local storage.
	 */

	clear() {
		localStorage.clear();
	}
}

export default new Storage();
