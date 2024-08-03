import { Item } from './item.js';
import * as T from './algebra.js';

const t = T.buildTransform();

export class DotItem extends Item {
	constructor(x, y) {
		super();
		this.transform[4] = x;
		this.transform[5] = y;
	}
	render(ctx, world) {
		T.combineTransforms(this.transform, world, t);
		const x = t[4];
		const y = t[5];
		ctx.globalAlpha = 1;
		ctx.fillStyle = '#fff';
		ctx.strokeStyle = '#000';
		ctx.setTransform(1, 0, 0, 1, x, y);
		ctx.beginPath();
		ctx.arc(0, 0, 2.5, 0, Math.PI*2);
		ctx.fill();
		ctx.stroke();
	}
}
