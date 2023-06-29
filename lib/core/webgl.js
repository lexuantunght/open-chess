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
		this.program = WebglUtils.createProgramFromSources(this.gl, [vertexShader, fragmentShader]);
		this.programInfo = WebglUtils.createProgramInfo(this.gl, [vertexShader, fragmentShader]);

		// look up where the vertex data needs to go.
		const positionAttributeLocation = this.gl.getAttribLocation(this.program, 'a_position');
		const texcoordAttributeLocation = this.gl.getAttribLocation(this.program, 'a_texcoord');

		// lookup uniforms
		this.matrixLocation = this.gl.getUniformLocation(this.program, 'u_matrix');
		this.textureLocation = this.gl.getUniformLocation(this.program, 'u_texture');

		// create the position buffer, make it the current ARRAY_BUFFER
		// and copy in the color values
		const positionBuffer = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
		// Put a unit quad in the buffer
		const positions = [0, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1];
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.STATIC_DRAW);

		// Turn on the attribute
		this.gl.enableVertexAttribArray(positionAttributeLocation);

		// Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
		var size = 2; // 2 components per iteration
		var type = this.gl.FLOAT; // the data is 32bit floats
		var normalize = false; // don't normalize the data
		var stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
		var offset = 0; // start at the beginning of the buffer
		this.gl.vertexAttribPointer(
			positionAttributeLocation,
			size,
			type,
			normalize,
			stride,
			offset
		);

		// create the texcoord buffer, make it the current ARRAY_BUFFER
		// and copy in the texcoord values
		var texcoordBuffer = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, texcoordBuffer);
		// Put texcoords in the buffer
		var texcoords = [0, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1];
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(texcoords), this.gl.STATIC_DRAW);

		// Turn on the attribute
		this.gl.enableVertexAttribArray(texcoordAttributeLocation);

		// Tell the attribute how to get data out of texcoordBuffer (ARRAY_BUFFER)
		this.gl.vertexAttribPointer(
			texcoordAttributeLocation,
			size,
			type,
			normalize,
			stride,
			offset
		);

		this.gl.enable(this.gl.BLEND);
		this.gl.blendFunc(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);
		this.gl.pixelStorei(this.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
	}

	_draw(objs) {
		//
		WebglUtils.resizeCanvasToDisplaySize(this.canvas, window.devicePixelRatio);
		this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
		this.gl.useProgram(this.programInfo.program);

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
		const camera = ModelUtils.createCamera();
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
