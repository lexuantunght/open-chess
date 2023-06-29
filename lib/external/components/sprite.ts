import { Node, NodeType } from './node';
import { Transform, Vec3 } from '../math';
import { Model3D } from '../../engine/types';
import ModelCache from '../../core/model-cache';

export class Sprite extends Node {
	protected transform: Transform;
	private model: Model3D;
	constructor(url: string) {
		super();
		this.type = NodeType.DRAWABLE;
		this.transform = {
			rotation: { x: 0, y: 0, z: 0 },
		};
		this.model = ModelCache.getInstance().getTexture(url);
	}

	setRotation(angle: Vec3) {
		this.transform.rotation = angle;
	}

	getRotation() {
		return this.transform.rotation;
	}

	getModel() {
		return this.model;
	}
}
