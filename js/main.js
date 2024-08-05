import * as T from './algebra.js';
import { ImageItem } from './image-item.js';
import { loadImage } from './load-image.js';

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const items = true ? [] : [ new ImageItem() ];

let world = [ 1, 0, 0, 1, canvas.width*0.5, canvas.height*0.5 ];
let activeItem = null;
let startClick = null;
let command = null;
let cursor = [ 0, 0 ];

const ACTION = {
	MOVE_FRAME: 'moveFrame',
	MOVE_IMAGE: 'moveImage',
	ROTATE_IMAGE: 'rotateImage',
};

const zoom = (value, x, y) => {
	world[0] *= value;
	world[3] *= value;
	world[4] = x - (x - world[4])*value;
	world[5] = y - (y - world[5])*value;
};

const drawCursor = () => {
	const [ x, y ] = T.applyTransform(cursor, world);
	ctx.globalAlpha = 1;
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
	ctx.globalAlpha = 1;
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	for (const item of items) {
		item.render(ctx, world);
		if (item === activeItem) {
			item.drawDots(ctx, world);
		}
	}
	drawCursor();
};

const main = async () => {
	items.push(
		new ImageItem(await loadImage('./img/img-1.png')),
		new ImageItem(await loadImage('./img/img-2.png')),
	);
	items[1].alpha = 0.5;
	activeItem = items[0];
	render();
};

canvas.addEventListener('wheel', e => {
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
	if (e.shiftKey) {
		startClick = {
			action: ACTION.MOVE_FRAME,
			x: e.offsetX,
			y: e.offsetY,
			world: [ ...world ],
		};
		return;
	}
	if (activeItem === null) {
		return;
	}
	if ([ ACTION.MOVE_FRAME, ACTION.ROTATE_IMAGE ].includes(command)) {
		startClick = {
			action: command,
			x: e.offsetX,
			y: e.offsetY,
			vec: getEventVector(e),
			transform: [ ...activeItem.transform ],
		};
	}
});

canvas.addEventListener('mousemove', e => {
	if (!startClick) return;
	if ((e.buttons & 1) === 0) {
		startClick = null;
		return;
	}
	if (startClick.action === ACTION.MOVE_FRAME) {
		const dx = e.offsetX - startClick.x;
		const dy = e.offsetY - startClick.y;
		T.translateTransform(startClick.world, dx, dy, world);
	}
	if (startClick.action === ACTION.MOVE_IMAGE) {
		const dx = (e.offsetX - startClick.x) / world[0];
		const dy = (e.offsetY - startClick.y) / world[3];
		T.translateTransform(startClick.transform, dx, dy, activeItem.transform);
	}
	if (startClick.action === ACTION.ROTATE_IMAGE) {
		const a = T.subVec(startClick.vec, cursor);
		const b = T.subVec(getEventVector(e), cursor);
		const angle = T.angleBetween(a, b);
		T.rotateTransform(startClick.transform, angle, activeItem.transform);
	}
	render();
});

canvas.addEventListener('dblclick', e => {
	const v = [ e.offsetX, e.offsetY ];
	cursor = T.applyTransform(v, T.reverseTransform(world));
	render();
});

window.addEventListener('keydown', e => {
	if (e.code === 'KeyM') {
		command = ACTION.MOVE_IMAGE;
	}
	if (e.code === 'KeyR') {
		command = ACTION.ROTATE_IMAGE;
	}
});

main().catch(console.error);
