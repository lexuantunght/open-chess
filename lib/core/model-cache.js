class ModelCache {
	constructor() {
		this._cache = new Map();
	}

	static getInstance() {
		if (!this._instance) {
			this._instance = new ModelCache();
		}
		return this._instance;
	}

	hasLoaded(url) {
		return this._cache.has(url);
	}

	getTexture(url) {
		return this._cache.get(url);
	}

	setTexture(url, data) {
		this._cache.set(url, data);
	}

	removeTexture(url) {
		this._cache.delete(url);
	}

	cleanUp() {
		this._cache.clear();
	}
}

export default ModelCache;
