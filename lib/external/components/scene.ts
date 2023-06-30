import { Node, NodeType } from './node';
import ModelCache from '../../core/model-cache';
import DrawManager from '../../core/draw-manager';

export class Scene extends Node {
	constructor() {
		super();
		this.type = NodeType.SCENE;
	}

	onLoad() {
		//
	}

	cleanUp() {
		this.removeAllChilds();
		ModelCache.getInstance().cleanUp();
		DrawManager.getInstance().cleanUp();
	}
}
