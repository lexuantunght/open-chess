import ModelCache from './model-cache';
import * as ModelParser from './model-parser';

export const SupportedModelFormat = {
	FBX: '.fbx',
	OBJ: '.obj',
};

class ModelLoader {
	constructor(gl) {
		this.gl = gl;
	}

	loadImageAndCreateTextureInfo = (url) => {
		return new Promise((resolve, reject) => {
			const cache = ModelCache.getInstance();
			if (cache.hasLoaded(url)) {
				resolve(cache.getTexture(url));
				return;
			}
			const gl = this.gl;
			const tex = gl.createTexture();
			gl.bindTexture(gl.TEXTURE_2D, tex);
			// Fill the texture with a 1x1 blue pixel.
			gl.texImage2D(
				gl.TEXTURE_2D,
				0,
				gl.RGBA,
				1,
				1,
				0,
				gl.RGBA,
				gl.UNSIGNED_BYTE,
				new Uint8Array([0, 0, 255, 255])
			);

			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

			const textureInfo = {
				width: 1, // we don't know the size until it loads
				height: 1,
				texture: tex,
			};
			const img = new Image();
			img.crossOrigin = 'anonymous';
			img.loading = 'eager';
			img.addEventListener('load', () => {
				textureInfo.width = img.width;
				textureInfo.height = img.height;

				gl.bindTexture(gl.TEXTURE_2D, textureInfo.texture);
				gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
				gl.generateMipmap(gl.TEXTURE_2D);
				cache.setTexture(url, textureInfo);
				resolve(textureInfo);
			});
			img.addEventListener('error', () => {
				reject(`Load assets ${url} failed`);
			});
			img.src = url;
		});
	};

	load3DModel(url) {
		return new Promise((resolve, reject) => {
			fetch(url, { mode: 'no-cors' })
				.then((response) => response.arrayBuffer())
				.then((arrayBuffer) => resolve(this._parseModel(arrayBuffer, url)))
				.catch(reject);
		});
	}

	_parseModel(arrayBuffer, url = '') {
		let model = null;
		if (url.endsWith(SupportedModelFormat.OBJ)) {
			model = ModelParser.parseObj(arrayBuffer);
		}
		if (url.endsWith(SupportedModelFormat.FBX)) {
			model = ModelParser.parseFbx(arrayBuffer);
		}
		if (model) {
			ModelCache.getInstance().setTexture(url, model);
			return model;
		}
		throw Error('Invalid model file or file is not supported');
	}
}

export default ModelLoader;
