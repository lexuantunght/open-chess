import Engine from '../engine';

export class Game {
	private engine: Engine;
	constructor(canvas?: HTMLCanvasElement | null) {
		this.engine = new Engine(canvas);
	}

	run() {
		this.engine.run();
	}

	getEngine() {
		return this.engine;
	}
}
