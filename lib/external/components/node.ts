import { Model3D } from '../../engine/types';
import DrawManager from '../../core/draw-manager';
import ClientId from '../../utils/client-id';

export class Node {
	protected name?: string;
	protected readonly id: number;
	protected children: Map<number, Node>;
	protected type: NodeType;
	constructor(name?: string) {
		this.name = name;
		this.id = ClientId.getInstance().next();
		this.children = new Map();
		this.type = NodeType.NODE;
	}

	getId() {
		return this.id;
	}

	getName() {
		return this.name;
	}

	getChildrenById(id: number) {
		return this.children.get(id);
	}

	getChildrenByName(name: string) {
		let result: Node | undefined;
		this.children.forEach((child) => {
			if (child.getName() === name) {
				result = child;
				return;
			}
		});
		return result;
	}

	getModel(): Model3D | null {
		return null;
	}

	addChild(node: Node) {
		if (node.getType() === NodeType.DRAWABLE) {
			DrawManager.getInstance().addObject(node.getId(), node);
		}
		this.children.set(node.getId(), node);
	}

	removeChild(id: number) {
		DrawManager.getInstance().removeObject(id);
		this.children.delete(id);
	}

	removeAllChilds() {
		this.children.forEach((child) => {
			DrawManager.getInstance().removeObject(child.getId());
		});
		this.children.clear();
	}

	getType() {
		return this.type;
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	update = (dt: number) => {
		//
	};
}

export enum NodeType {
	NODE,
	DRAWABLE,
	SCENE,
}
