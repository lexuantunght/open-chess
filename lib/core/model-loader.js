import ModelCache from './model-cache';

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
			fetch(url)
				.then((response) => response.text())
				.then((text) => resolve(this._parseModel(text)))
				.catch(reject);
		});
	}

	_parseModel(text) {
		// because indices are base 1 let's just fill in the 0th data
		const objPositions = [[0, 0, 0]];
		const objTexcoords = [[0, 0]];
		const objNormals = [[0, 0, 0]];
		const objColors = [[0, 0, 0]];

		// same order as `f` indices
		const objVertexData = [objPositions, objTexcoords, objNormals, objColors];

		// same order as `f` indices
		let webglVertexData = [
			[], // positions
			[], // texcoords
			[], // normals
			[], // colors
		];

		const materialLibs = [];
		const geometries = [];
		let geometry;
		let groups = ['default'];
		let material = 'default';
		let object = 'default';

		const noop = () => {
			//
		};

		function newGeometry() {
			// If there is an existing geometry and it's
			// not empty then start a new one.
			if (geometry && geometry.data.position.length) {
				geometry = undefined;
			}
		}

		function setGeometry() {
			if (!geometry) {
				const position = [];
				const texcoord = [];
				const normal = [];
				const color = [];
				webglVertexData = [position, texcoord, normal, color];
				geometry = {
					object,
					groups,
					material,
					data: {
						position,
						texcoord,
						normal,
						color,
					},
				};
				geometries.push(geometry);
			}
		}

		function addVertex(vert) {
			const ptn = vert.split('/');
			ptn.forEach((objIndexStr, i) => {
				if (!objIndexStr) {
					return;
				}
				const objIndex = parseInt(objIndexStr);
				const index = objIndex + (objIndex >= 0 ? 0 : objVertexData[i].length);
				webglVertexData[i].push(...objVertexData[i][index]);
				// if this is the position index (index 0) and we parsed
				// vertex colors then copy the vertex colors to the webgl vertex color data
				if (i === 0 && objColors.length > 1) {
					geometry.data.color.push(...objColors[index]);
				}
			});
		}

		const keywords = {
			v(parts) {
				// if there are more than 3 values here they are vertex colors
				if (parts.length > 3) {
					objPositions.push(parts.slice(0, 3).map(parseFloat));
					objColors.push(parts.slice(3).map(parseFloat));
				} else {
					objPositions.push(parts.map(parseFloat));
				}
			},
			vn(parts) {
				objNormals.push(parts.map(parseFloat));
			},
			vt(parts) {
				// should check for missing v and extra w?
				objTexcoords.push(parts.map(parseFloat));
			},
			f(parts) {
				setGeometry();
				const numTriangles = parts.length - 2;
				for (let tri = 0; tri < numTriangles; ++tri) {
					addVertex(parts[0]);
					addVertex(parts[tri + 1]);
					addVertex(parts[tri + 2]);
				}
			},
			s: noop, // smoothing group
			mtllib(parts, unparsedArgs) {
				// the spec says there can be multiple filenames here
				// but many exist with spaces in a single filename
				materialLibs.push(unparsedArgs);
			},
			usemtl(parts, unparsedArgs) {
				material = unparsedArgs;
				newGeometry();
			},
			g(parts) {
				groups = parts;
				newGeometry();
			},
			o(parts, unparsedArgs) {
				object = unparsedArgs;
				newGeometry();
			},
		};

		const keywordRE = /(\w*)(?: )*(.*)/;
		const lines = text.split('\n');
		for (let lineNo = 0; lineNo < lines.length; ++lineNo) {
			const line = lines[lineNo].trim();
			if (line === '' || line.startsWith('#')) {
				continue;
			}
			const m = keywordRE.exec(line);
			if (!m) {
				continue;
			}
			const [, keyword, unparsedArgs] = m;
			const parts = line.split(/\s+/).slice(1);
			const handler = keywords[keyword];
			if (!handler) {
				console.warn('unhandled keyword:', keyword); // eslint-disable-line no-console
				continue;
			}
			handler(parts, unparsedArgs);
		}

		// remove any arrays that have no entries.
		for (const geometry of geometries) {
			geometry.data = Object.fromEntries(
				Object.entries(geometry.data).filter(([, array]) => array.length > 0)
			);
		}

		return {
			geometries,
			materialLibs,
		};
	}
}

export default ModelLoader;
