import { Scene, Sprite } from 'titan3d';

class MagicForestScene extends Scene {
	constructor() {
		super();
	}

	onLoad() {
		const background = new Sprite('/res/magic_forest_skybox.obj');
		this.addChild(background);
	}
}

export default MagicForestScene;
