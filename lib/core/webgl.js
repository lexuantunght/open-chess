import WebglUtils from './webgl-utils';
import m4 from './m4';
import WebglHelper from './helper';
import { vertexShader, fragmentShader } from './shader';
import ModelLoader from './model-loader';
import * as ModelUtils from './model-utils';
import DrawManager from './draw-manager';
import EventModel from '../utils/event-model';

class WebGLCore extends EventModel {
	constructor(canvas) {
		super();
		this.canvas = canvas;
		this.gl = canvas.getContext('webgl');
		this._modelLoader = new ModelLoader(this.gl);
		this._init();
	}

	_init() {
		this.programInfo = WebglUtils.createProgramInfo(this.gl, [vertexShader, fragmentShader]);
	}

	_draw(objs) {
		//
		WebglUtils.resizeCanvasToDisplaySize(this.canvas, window.devicePixelRatio);
		this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
		this.gl.useProgram(this.programInfo.program);
		this.gl.enable(this.gl.DEPTH_TEST);

		for (const obj of objs) {
			this._drawItem(obj);
		}
	}

	_drawItem(obj) {
		if (!obj) {
			return;
		}
		const extents = ModelUtils.getGeometriesExtents(obj.geometries);
		const range = m4.subtractVectors(extents.max, extents.min);
		const radius = m4.length(range) * 1.2;
		const camera = ModelUtils.createCamera(radius);
		const sharedUniforms = {
			u_lightDirection: m4.normalize([-1, 3, 5]),
			u_view: m4.inverse(camera),
			u_projection: m4.perspective(
				WebglHelper.degToRad(60),
				this.gl.canvas.clientWidth / this.gl.canvas.clientHeight,
				radius / 1000,
				radius * 3
			),
		};
		// calls gl.uniform
		WebglUtils.setUniforms(this.programInfo, sharedUniforms);

		const parts = ModelUtils.createParts(obj.geometries, this.gl);
		for (const { bufferInfo, material } of parts) {
			// calls gl.bindBuffer, gl.enableVertexAttribArray, gl.vertexAttribPointer
			WebglUtils.setBuffersAndAttributes(this.gl, this.programInfo, bufferInfo);
			// calls gl.uniform
			WebglUtils.setUniforms(this.programInfo, {
				u_world: m4.yRotation(0),
				u_diffuse: material.u_diffuse,
			});
			// calls gl.drawArrays or gl.drawElements
			WebglUtils.drawBufferInfo(this.gl, bufferInfo);
		}
	}

	loadTexture(url) {
		return this._modelLoader.loadImageAndCreateTextureInfo(url);
	}

	load3DModel(url) {
		return this._modelLoader.load3DModel(url);
	}

	_render = (time) => {
		const now = time * 0.001;
		const deltaTime = Math.min(0.1, now - this.currentTime);
		this.currentTime = now;

		this.listeners.get(WebGLCoreEvents.UPDATE)?.forEach((cb) => cb(deltaTime));
		this._draw(DrawManager.getInstance().getObjects());

		requestAnimationFrame(this._render);
	};

	run() {
		requestAnimationFrame(this._render);
	}
}

export const WebGLCoreEvents = {
	UPDATE: 'UPDATE',
};

export default WebGLCore;
