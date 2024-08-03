export const buildTransform = () => [ 1, 0, 0, 1, 0, 0 ];

export const applyTransform = (v, t, res = []) => {
	const [ x, y ] = v;
	const [ ix, iy, jx, jy, kx, ky ] = t;
	res[0] = x*ix + y*jx + kx;
	res[1] = x*iy + y*jy + ky;
	return res;
};

export const combineTransforms = (a, b, res = []) => {
	const [ aix, aiy, ajx, ajy, akx, aky ] = a;
	const [ bix, biy, bjx, bjy, bkx, bky ] = b;
	res[0] = aix*bix + aiy*bjx;
	res[1] = aix*biy + aiy*bjy;
	res[2] = ajx*bix + ajy*bjx;
	res[3] = ajx*biy + ajy*bjy;
	res[4] = akx*bix + aky*bjx + bkx;
	res[5] = akx*biy + aky*bjy + bky;
	return res;
};

export const rotationTransform = (angle, res = []) => {
	const sin = Math.sin(angle);
	const cos = Math.cos(angle);
	res[0] = cos;
	res[1] = sin;
	res[2] = - sin;
	res[3] = cos;
	res[4] = 0;
	res[5] = 0;
	return res;
};

export const rotateTransformInPlace = (t, angle, res = []) => {
	const sin = Math.sin(angle);
	const cos = Math.cos(angle);
	const [ ix, iy, jx, jy, kx, ky ] = t;
	res[0] = ix*cos - iy*sin;
	res[1] = iy*cos + ix*sin;
	res[2] = jx*cos - jy*sin;
	res[3] = jy*cos + jx*sin;
	res[4] = kx;
	res[5] = ky;
	return res;
};

export const translateTransform = (t, dx, dy, res = []) => {
	const [ ix, iy, jx, jy, kx, ky ] = t;
	res[0] = ix;
	res[1] = iy;
	res[2] = jx;
	res[3] = jy;
	res[4] = kx + dx;
	res[5] = ky + dy;
	return res;
};

export const scaleTransformInPlace = (t, sx, sy, res = []) => {
	const [ ix, iy, jx, jy, kx, ky ] = t;
	res[0] = ix*sx;
	res[1] = iy*sy;
	res[2] = jx*sx;
	res[3] = jy*sy;
	res[4] = kx;
	res[5] = ky;
	return res;
};
