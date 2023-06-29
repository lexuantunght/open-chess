export type EngineEventMap = {
	UPDATE: number;
};

export type Texture = {
	width?: number;
	height?: number;
	texture?: WebGLTexture | null;
	srcX?: number;
	srcY?: number;
	srcWidth?: number;
	srcHeight?: number;
};

export type Model3D = {
	geometries: unknown[];
	materialLibs: unknown[];
};
