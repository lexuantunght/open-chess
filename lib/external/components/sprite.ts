import { Node, NodeType } from './node';
import { Transform, Vec3 } from '../math';

export class Sprite extends Node {
	protected transform: Transform;
	constructor() {
		super();
		this.type = NodeType.DRAWABLE;
		this.transform = {
			rotation: { x: 0, y: 0, z: 0 },
		};
	}

	setRotation(angle: Vec3) {
		this.transform.rotation = angle;
	}

	getRotation() {
		return this.transform.rotation;
	}
}
