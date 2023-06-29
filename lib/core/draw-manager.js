class DrawManager {
	constructor() {
		this._objectMap = new Map();
	}

	static getInstance() {
		if (!this._instance) {
			this._instance = new DrawManager();
		}
		return this._instance;
	}

	getObjects() {
		return Array.from(this._objectMap.values()).map((obj) => obj.getModel());
	}

	removeObject(id) {
		this._objectMap.delete(id);
	}

	cleanUp() {
		this._objectMap.clear();
	}

	addObject(id, obj) {
		this._objectMap.set(id, obj);
	}
}

export default DrawManager;
