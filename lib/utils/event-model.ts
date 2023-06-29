export type EventModelMap = {
	[key: string]: unknown;
};

export type EventModelCallback<T> = (value: T) => void;

class EventModel<T extends EventModelMap> {
	protected listeners: Map<keyof T, CallableFunction[]>;
	constructor() {
		this.listeners = new Map();
	}

	addListener<E extends keyof T>(event: E, callback: EventModelCallback<T[E]>) {
		let cbs = this.listeners.get(event);
		if (!cbs) {
			cbs = [callback];
		} else {
			cbs.push(callback);
		}
		this.listeners.set(event, cbs);
	}

	removeListener<E extends keyof T>(event: E, callback: EventModelCallback<T[E]>) {
		const cbs = this.listeners.get(event);
		if (!cbs) {
			return;
		}
		const idx = cbs.findIndex((cb) => cb === callback);
		cbs.splice(idx, 1);
		this.listeners.set(event, cbs);
	}
}

export default EventModel;
