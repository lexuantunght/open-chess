import { Scene } from './components/scene';
import { Game } from './game';
import { WebGLCoreEvents } from '../core/webgl';

export class Director {
	private static instance: Director | null = null;
	private currentScene: Scene | null;
	private currentGame: Game | null;
	private constructor() {
		this.currentScene = null;
		this.currentGame = null;
	}

	static getInstance() {
		if (!this.instance) {
			this.instance = new Director();
		}
		return this.instance;
	}

	runScene(scene: Scene) {
		if (this.currentScene) {
			this.currentGame
				?.getEngine()
				.renderer.removeListener(WebGLCoreEvents.UPDATE, this.currentScene.update);
			this.currentScene.cleanUp();
		}
		scene.onLoad();
		this.currentScene = scene;
		this.currentGame
			?.getEngine()
			.renderer.addListener(WebGLCoreEvents.UPDATE, this.currentScene.update);
	}

	getCurrentScene() {
		return this.currentScene;
	}

	bindGame(game: Game) {
		this.currentGame = game;
	}

	async preloadResources(urls: string[]) {
		await this.currentGame?.getEngine().loadResources(urls);
	}
}
