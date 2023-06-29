import WebGLCore from '../core/webgl';
import EventModel from '../utils/event-model';
import { EngineEventMap, Model3D } from './types';

class Engine extends EventModel<EngineEventMap> {
	private renderer: WebGLCore;
	constructor(canvas?: HTMLCanvasElement | null) {
		super();
		this.renderer = new WebGLCore(canvas);
	}

	loadResources(urls: string[]): Promise<Model3D[]> {
		const promises = [];
		for (const url of urls) {
			promises.push(this.renderer.load3DModel(url));
		}
		return Promise.all(promises);
	}

	run() {
		this.renderer.run();
	}
}

export default Engine;
