import WebglUtils from './webgl-utils';
import m4 from './m4';

export const createParts = (geometries, gl) => {
	return geometries.map(({ data }) => {
		// Because data is just named arrays like this
		//
		// {
		//   position: [...],
		//   texcoord: [...],
		//   normal: [...],
		// }
		//
		// and because those names match the attributes in our vertex
		// shader we can pass it directly into `createBufferInfoFromArrays`
		// from the article "less code more fun".

		if (data.color) {
			if (data.position.length === data.color.length) {
				// it's 3. The our helper library assumes 4 so we need
				// to tell it there are only 3.
				data.color = { numComponents: 3, data: data.color };
			}
		} else {
			// there are no vertex colors so just use constant white
			data.color = { value: [1, 1, 1, 1] };
		}

		// create a buffer for each array by calling
		// gl.createBuffer, gl.bindBuffer, gl.bufferData
		const bufferInfo = WebglUtils.createBufferInfoFromArrays(gl, data);
		return {
			material: {
				u_diffuse: [1, 1, 1, 1],
			},
			bufferInfo,
		};
	});
};

const _getExtents = (positions) => {
	const min = positions.slice(0, 3);
	const max = positions.slice(0, 3);
	for (let i = 3; i < positions.length; i += 3) {
		for (let j = 0; j < 3; ++j) {
			const v = positions[i + j];
			min[j] = Math.min(v, min[j]);
			max[j] = Math.max(v, max[j]);
		}
	}
	return { min, max };
};

export function getGeometriesExtents(geometries) {
	return geometries.reduce(
		({ min, max }, { data }) => {
			const minMax = _getExtents(data.position);
			return {
				min: min.map((min, ndx) => Math.min(minMax.min[ndx], min)),
				max: max.map((max, ndx) => Math.max(minMax.max[ndx], max)),
			};
		},
		{
			min: Array(3).fill(Number.POSITIVE_INFINITY),
			max: Array(3).fill(Number.NEGATIVE_INFINITY),
		}
	);
}

export function createCamera(radius) {
	const cameraTarget = [0, 0, 0];
	const cameraPosition = m4.addVectors(cameraTarget, [0, 0, radius]);
	const up = [0, 1, 0];
	// Compute the camera's matrix using look at.
	const camera = m4.lookAt(cameraPosition, cameraTarget, up);
	return camera;
}
