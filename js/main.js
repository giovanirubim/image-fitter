import * as T from './algebra.js';
import { DotItem } from './dot-item.js';
import { ImageItem } from './image-item.js';
import { Item } from './item.js';
import { loadImage } from './load-image.js';

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const items = true ? [] : [ new Item() ];

let world = [ 1, 0, 0, 1, canvas.width*0.5, canvas.height*0.5 ];

const zoom = (value, x, y) => {
	world[0] *= value;
	world[3] *= value;
	world[4] = x - (x - world[4])*value;
	world[5] = y - (y - world[5])*value;
};

const render = () => {
	ctx.globalAlpha = 1;
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	for (const item of items) {
		item.render(ctx, world);
	}
};

const main = async () => {
	items.push(
		new ImageItem(await loadImage('./img/img-1.png')),
		new ImageItem(await loadImage('./img/img-2.png')),
		new DotItem(0, 0),
	);
	items[1].alpha = 0.5;
	render();
};

let startClick = null;

canvas.addEventListener('wheel', e => {
	zoom(1 - e.deltaY*0.001, e.offsetX, e.offsetY);
	render();
});

canvas.addEventListener('mousedown', e => {
	if (e.button === 0 && e.shiftKey) {
		startClick = {
			action: 'moveFrame',
			x: e.offsetX,
			y: e.offsetY,
			world: [ ...world ],
		};
	}
});

canvas.addEventListener('mousemove', e => {
	if (!startClick) return;
	if (startClick.action === 'moveFrame') {
		if ((e.buttons & 1) === 0) {
			startClick = null;
			return;
		}
		const dx = e.offsetX - startClick.x;
		const dy = e.offsetY - startClick.y;
		T.translateTransform(startClick.world, dx, dy, world);
		render();
		return;
	}
});

main().catch(console.error);
