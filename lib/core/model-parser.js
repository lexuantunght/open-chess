import * as FBXParser from 'fbx-parser';

export const parseObj = (arrayBuffer) => {
	const decoder = new TextDecoder('utf-8');
	const text = decoder.decode(arrayBuffer);
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
};

export const parseFbx = (arrayBuffer) => {
	const result = FBXParser.parseBinary(new Uint8Array(arrayBuffer));

	function extractGeometries(fbxData) {
		const geometries = {};

		// Traverse the FBX data and extract geometries
		for (const node of fbxData) {
			if (node.name === 'Geometry') {
				const geometryId = node.props[0];
				const geometryData = extractGeometryData(node.nodes);
				geometries[geometryId] = geometryData;
			}
		}

		return geometries;
	}

	function extractGeometryData(nodes) {
		const geometryData = {
			vertices: [],
			normals: [],
			uvs: [],
			indices: [],
		};

		for (const node of nodes) {
			if (node.name === 'Vertices') {
				geometryData.vertices = node.props;
			} else if (node.name === 'PolygonVertexIndex') {
				geometryData.indices = parseIndices(node.props);
			} else if (node.name === 'LayerElementNormal') {
				geometryData.normals = extractLayerElementData(node.nodes);
			} else if (node.name === 'LayerElementUV') {
				geometryData.uvs = extractLayerElementData(node.nodes);
			}
		}

		return geometryData;
	}

	function extractLayerElementData(nodes) {
		const data = [];

		for (const node of nodes) {
			if (
				node.name === 'MappingInformationType' ||
				node.name === 'ReferenceInformationType'
			) {
				// Extract mapping and reference information if needed
			} else if (node.name === 'Normals' || node.name === 'UV') {
				data.push(node.props);
			}
		}

		return data;
	}

	function parseIndices(indices) {
		// Parse the polygon vertex indices to obtain face indices
		const faceIndices = [];
		let currentIndex = 0;

		for (const index of indices) {
			if (index < 0) {
				// Negative index indicates the end of a face
				faceIndices.push(Math.abs(index) - 1);
				currentIndex = 0;
			} else {
				// Positive index represents a vertex index
				faceIndices.push(index);
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				currentIndex++;
			}
		}

		return faceIndices;
	}

	function extractMaterialLibraries(fbxData) {
		const materialLibs = {};

		// Traverse the FBX data and extract material libraries
		for (const node of fbxData) {
			if (node.name === 'Material') {
				const materialLibId = node.props[0];
				const materials = extractMaterials(node.nodes);
				materialLibs[materialLibId] = materials;
			}
		}

		return materialLibs;
	}

	function extractMaterials(nodes) {
		const materials = {};

		for (const node of nodes) {
			if (node.name === 'Material') {
				const materialId = node.props[0];
				const materialData = extractMaterialData(node.nodes);
				materials[materialId] = materialData;
			}
		}

		return materials;
	}

	function extractMaterialData(nodes) {
		const materialData = {};

		for (const node of nodes) {
			if (node.name === 'Property') {
				const propName = node.props[0];
				const propValue = node.props[1];
				materialData[propName] = propValue;
			}
		}

		return materialData;
	}

	// Extract the geometries and material libraries from the parsed result
	const objNode = result.find((v) => v.name === 'Objects');
	const geometries = extractGeometries(objNode.nodes);
	const materialLibs = extractMaterialLibraries(objNode.nodes);

	// Return the extracted data
	return {
		geometries: Object.values(geometries),
		materialLibs: Object.values(materialLibs),
	};
};
