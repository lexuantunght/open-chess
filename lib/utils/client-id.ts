class ClientId {
	private static instance: ClientId | null = null;
	private current: number;
	private constructor() {
		this.current = 0;
	}

	static getInstance() {
		if (!this.instance) {
			this.instance = new ClientId();
		}
		return this.instance;
	}

	next() {
		this.current += 1;
		return this.current;
	}

	getCurrent() {
		return this.current;
	}
}

export default ClientId;
