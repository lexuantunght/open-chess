import { Node, NodeType } from './node';
import TextureCache from '../../core/texture-cache';

export class Scene extends Node {
	constructor() {
		super();
		this.type = NodeType.SCENE;
	}

	cleanUp() {
		this.removeAllChilds();
		TextureCache.getInstance().cleanUp();
	}
}
