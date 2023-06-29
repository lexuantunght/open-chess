export interface Vec3 {
	x: number;
	y: number;
	z: number;
}

export interface Size {
	width: number;
	height: number;
	length: number;
}

export class Color {
	red: number;
	green: number;
	blue: number;
	alpha: number;
	/**
	 *
	 * @param red from 0 to 255
	 * @param green from 0 to 255
	 * @param blue from 0 to 255
	 * @param alpha from 0 to 1
	 */
	constructor(red = 0, green = 0, blue = 0, alpha = 1) {
		this.red = red / 255;
		this.blue = blue / 255;
		this.green = green / 255;
		this.alpha = +alpha.toFixed(2);
	}

	static fromHex(hex: string) {
		const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		if (result) {
			return new Color(
				parseInt(result[1], 16),
				parseInt(result[2], 16),
				parseInt(result[3], 16)
			);
		}
		return new Color();
	}

	toNumber = () => {
		return (
			(((this.red * 255) & 0x0ff) << 16) |
			(((this.green * 255) & 0x0ff) << 8) |
			((this.blue * 255) & 0x0ff)
		);
	};

	toHex = () => {
		const hex =
			'#' +
			[this.red * 255, this.green * 255, this.blue * 255]
				.map((x) => {
					const hex = x.toString(16);
					return hex.length === 1 ? '0' + hex : hex;
				})
				.join('');
		if (this.alpha === 0) {
			return hex + '00';
		}
		if (this.alpha !== 1) {
			return hex + this.alpha * 100;
		}
		return hex;
	};
}

export interface Transform {
	rotation: Vec3;
}
