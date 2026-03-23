export class Layout {
  // #router;
	#children;

	constructor({ router, children }) {
		//this.#router = router;
		this.#children = children;
	}

	render() {
		const headerHTML = `<header>
    <a href="/feed">Feed</a>
    <a href="/add">Add</a>
    <a href="/confession">Confession</a>
    </header>`;

		return `
    ${headerHTML}
    <main>
      ${this.#children}
    </main>
    `;
	}
}
