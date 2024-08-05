import * as T from './algebra.js';
import { DotItem } from './dot-item.js';
import { Item } from './item.js';

const t = T.buildTransform();

export class ImageItem extends Item {
	constructor(img = document.createElement('img')) {
		super();
		this.img = img;
		this.alpha = 1;
		this.dots = [];
	}
	render(ctx = new CanvasRenderingContext2D(), world = []) {
		const { img } = this;
		T.combineTransforms(this.transform, world, t);
		ctx.setTransform(...t);
		ctx.globalAlpha = this.alpha;
		ctx.drawImage(img, img.width*-0.5, img.height*-0.5);
		for (let dot of this.dots) {
			dot.render(ctx, t);
		}
	}
	addDot(x, y, world) {
		const v = [ x, y ];
		T.reverseTransform(world, t);
		T.applyTransform(v, t, v);
		T.reverseTransform(this.transform, t);
		T.applyTransform(v, t, v);
		this.dots.push(new DotItem(...v));
		return this;
	}
}
