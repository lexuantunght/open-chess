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

	addChild(node: Node) {
		this.children.set(node.getId(), node);
	}

	removeChild(id: number) {
		this.children.delete(id);
	}

	removeAllChilds() {
		this.children.clear();
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
