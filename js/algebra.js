export const buildTransform = () => {
	return [ 1, 0, 0, 1, 0, 0 ];
};

export const resetTransform = (t) => {
	t[0] = t[3] = 1;
	t[1] = t[2] = t[4] = t[5] = 0;
	return t;
};

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

export const rotateTransform = (t, angle, res = []) => {
	const sin = Math.sin(angle);
	const cos = Math.cos(angle);
	const [ ix, iy, jx, jy, kx, ky ] = t;
	res[0] = ix*cos - iy*sin;
	res[1] = iy*cos + ix*sin;
	res[2] = jx*cos - jy*sin;
	res[3] = jy*cos + jx*sin;
	res[4] = kx*cos - ky*sin;
	res[5] = ky*cos + kx*sin;
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

export const scaleTransform = (t, sx, sy, res = []) => {
	const [ ix, iy, jx, jy, kx, ky ] = t;
	res[0] = ix*sx;
	res[1] = iy*sy;
	res[2] = jx*sx;
	res[3] = jy*sy;
	res[4] = kx*sx;
	res[5] = ky*sy;
	return res;
};

const copy = (src, dst, n) => {
	for (let i=0; i<n; ++i) {
		dst[i] = src[i];
	}
	return dst;
};

const setIYTo0 = (a, b) => {
	const c = a[1]/a[0];

	a[1] = 0;
	a[3] -= a[2]*c;
	a[5] -= a[4]*c;

	b[1] -= b[0]*c;
	b[3] -= b[2]*c;
	b[5] -= b[4]*c;
};

const setJXTo0 = (a, b) => {
	const c = a[2]/a[3];

	a[0] -= a[1]*c;
	a[2] = 0;
	a[4] -= a[5]*c;

	b[0] -= b[1]*c;
	b[2] -= b[3]*c;
	b[4] -= b[5]*c;
};

const aux = buildTransform();
export const reverseTransform = (t, res = []) => {
	copy(t, aux, 6);
	resetTransform(res);
	setIYTo0(aux, res);
	setJXTo0(aux, res);
	scaleTransform(res, 1/aux[0], 1/aux[3], res);
	scaleTransform(aux, 1/aux[0], 1/aux[3], aux);
	res[4] -= aux[4];
	res[5] -= aux[5];
	return res;
};

export const subVec = ([ ax, ay ], [ bx, by ], res = new Array(2)) => {
	res[0] = ax - bx;
	res[1] = ay - by;
	return res;
};

export const angleBetween = ([ ax, ay ], [ bx, by ]) => {
	const la = Math.sqrt(ax**2 + ay**2);
	ax /= la;
	ay /= la;

	const lb = Math.sqrt(bx**2 + by**2);
	bx /= lb;
	by /= lb;

	const cos = ax*bx + ay*by;
	const mag = by*ax - bx*ay < 0 ? -1 : 1;
	return Math.acos(cos) * mag;
};

export const shearXTransform = (t, value, res = []) => {
	const [ ix, iy, jx, jy, kx, ky ] = t;
	res[0] = ix + value*iy;
	res[1] = iy;
	res[2] = jx + value*jy;
	res[3] = jy;
	res[4] = kx + value*ky;
	res[5] = ky;
	return res;
};

export const shearYTransform = (t, value, res = []) => {
	const [ ix, iy, jx, jy, kx, ky ] = t;
	res[0] = ix;
	res[1] = iy + value*ix;
	res[2] = jx;
	res[3] = jy + value*jx;
	res[4] = kx;
	res[5] = ky + value*kx;
	return res;
};

export const vecLen = ([ x, y ]) => {
	return Math.sqrt(x**2 + y**2);
};