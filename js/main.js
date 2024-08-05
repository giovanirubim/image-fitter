import * as T from './algebra.js';
import { Item } from './image-item.js';
import { loadImage } from './load-image.js';

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const items = true ? [] : [ new Item() ];

let editWidth = 800;
let editHeight = 600;
let world = [ 1, 0, 0, 1, editWidth*0.5, editHeight*0.5 ];
let activeItem = null;
let startClick = null;
let command = null;
let cursor = [ 0, 0 ];
let opacity = 0.5;
let previewOn = false;

const ACTION = {
	MOVE_FRAME:   'moveFrame',
	MOVE_IMAGE:   'moveImage',
	ROTATE_IMAGE: 'rotateImage',
	SHEAR_X:      'shear-x',
	SHEAR_Y:      'shear-y',
	SCALE:        'scale',
	OPACITY:      'opacity',
};

const zoom = (value, x, y) => {
	world[0] *= value;
	world[3] *= value;
	world[4] = x - (x - world[4])*value;
	world[5] = y - (y - world[5])*value;
};

const drawCursor = () => {
	const [ x, y ] = T.applyTransform(cursor, world);
	ctx.lineCap = 'round';

	ctx.setTransform(1, 0, 0, 1, x, y);
	ctx.beginPath();
	ctx.moveTo(0, -10);
	ctx.lineTo(0, 10);
	ctx.moveTo(-10, 0);
	ctx.lineTo(10, 0);

	ctx.strokeStyle = '#fff';
	ctx.lineWidth = 3;
	ctx.stroke();

	ctx.strokeStyle = '#000';
	ctx.lineWidth = 1;
	ctx.stroke();
};

const render = () => {
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	items[0].render(ctx, world);
	ctx.globalAlpha = opacity;
	items[1].render(ctx, world);
	ctx.globalAlpha = 1;
	if (!previewOn) {
		drawCursor();
	}
};

canvas.addEventListener('wheel', e => {
	if (previewOn) {
		return;
	}
	zoom(1 - e.deltaY*0.001, e.offsetX, e.offsetY);
	render();
});

const getEventVector = (e) => {
	const vec = [ e.offsetX, e.offsetY ];
	T.applyTransform(vec, T.reverseTransform(world), vec);
	return vec;
};

canvas.addEventListener('mousedown', e => {
	if (e.button !== 0) {
		return;
	}
	if (!command && !e.shiftKey) {
		return;
	}
	startClick = {
		opacity,
		action: e.shiftKey ? ACTION.MOVE_FRAME : command,
		x: e.offsetX,
		y: e.offsetY,
		vec: getEventVector(e),
		world: [ ...world ],
		transform: [ ...activeItem.transform ],
	};
});

canvas.addEventListener('mousemove', e => {
	if (!startClick) return;
	if (previewOn) return;
	if ((e.buttons & 1) === 0) {
		startClick = null;
		return;
	}
	switch (startClick.action) {
		case ACTION.MOVE_FRAME: {
			const dx = e.offsetX - startClick.x;
			const dy = e.offsetY - startClick.y;
			T.translateTransform(startClick.world, dx, dy, world);
		} break;
		case ACTION.MOVE_IMAGE: {
			const dx = (e.offsetX - startClick.x) / world[0];
			const dy = (e.offsetY - startClick.y) / world[3];
			T.translateTransform(startClick.transform, dx, dy, activeItem.transform);
		} break;
		case ACTION.ROTATE_IMAGE: {
			const a = T.subVec(startClick.vec, cursor);
			const b = T.subVec(getEventVector(e), cursor);
			const angle = T.angleBetween(a, b);
			const t = activeItem.transform;
			T.translateTransform(startClick.transform, -cursor[0], -cursor[1], t);
			T.rotateTransform(t, angle, t);
			T.translateTransform(t, cursor[0], cursor[1], t);
		} break;
		case ACTION.SHEAR_X: {
			const a = T.subVec(startClick.vec, cursor);
			const b = T.subVec(getEventVector(e), cursor);
			const t = activeItem.transform;
			T.translateTransform(startClick.transform, -cursor[0], -cursor[1], t);
			T.shearXTransform(t, (b[0] - a[0])/a[1], t);
			T.translateTransform(t, cursor[0], cursor[1], t);
		} break;
		case ACTION.SHEAR_Y: {
			const a = T.subVec(startClick.vec, cursor);
			const b = T.subVec(getEventVector(e), cursor);
			const t = activeItem.transform;
			T.translateTransform(startClick.transform, -cursor[0], -cursor[1], t);
			T.shearYTransform(t, (b[1] - a[1])/a[0], t);
			T.translateTransform(t, cursor[0], cursor[1], t);
		} break;
		case ACTION.SCALE: {
			const a = T.subVec(startClick.vec, cursor);
			const b = T.subVec(getEventVector(e), cursor);
			const t = activeItem.transform;
			const l = T.vecLen(a);
			const sx = b[0]/a[0];
			const sy = b[1]/a[1];
			const px = Math.abs(a[0] / l);
			const py = Math.abs(a[1] / l);
			T.translateTransform(startClick.transform, -cursor[0], -cursor[1], t);
			T.scaleTransform(t, (sx - 1)*px + 1, (sy - 1)*py + 1, t);
			T.translateTransform(t, cursor[0], cursor[1], t);
		} break;
		case ACTION.OPACITY: {
			const d = (e.offsetX - startClick.x) / editWidth;
			opacity = Math.max(0, Math.min(1, startClick.opacity + d*1.5));
		} break;
	}
	render();
});

canvas.addEventListener('dblclick', e => {
	const v = [ e.offsetX, e.offsetY ];
	cursor = T.applyTransform(v, T.reverseTransform(world));
	render();
});

const togglePreview = () => {
	if (previewOn) {
		canvas.width = editWidth;
		canvas.height = editHeight;
		world = [ 1, 0, 0, 1, editWidth/2, editHeight/2 ];
		opacity = 0.5;
		previewOn = false;
	} else {
		const { width, height } = items[0].img;
		canvas.width = width;
		canvas.height = height;
		world = [ 1, 0, 0, 1, width/2, height/2 ];
		opacity = 1;
		startClick = null;
		previewOn = true;
	}
	render();
};

window.addEventListener('keydown', e => {
	if (e.code.endsWith('Enter')) {
		togglePreview();
	}
	if (previewOn) {
		return;
	}
	if (e.code === 'KeyM') {
		command = ACTION.MOVE_IMAGE;
	}
	if (e.code === 'KeyR') {
		command = ACTION.ROTATE_IMAGE;
	}
	if (e.code === 'KeyH') {
		command = ACTION.SHEAR_X;
	}
	if (e.code === 'KeyV') {
		command = ACTION.SHEAR_Y;
	}
	if (e.code === 'KeyS') {
		command = ACTION.SCALE;
	}
	if (e.code === 'KeyO') {
		command = ACTION.OPACITY;
	}
});

const resizeCanvas = () => {
	editWidth = window.innerWidth;
	editHeight = window.innerHeight;
	if (previewOn) {
		return;
	}
	canvas.width = editWidth;
	canvas.height = editHeight;
	world = [ 1, 0, 0, 1, editWidth/2, editHeight/2 ];
	render();
};

window.addEventListener('resize', e => {
	resizeCanvas();
});

const main = async () => {
	items.push(
		new Item(await loadImage('./img/base-image.png')),
		new Item(await loadImage('./img/image.png')),
	);
	activeItem = items[1];
	resizeCanvas();
};

main().catch(console.error);
