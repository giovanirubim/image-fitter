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
	render(ctx, world) {
		const { img } = this;
		T.combineTransforms(this.transform, world, t);
		ctx.setTransform(...t);
		ctx.globalAlpha = this.alpha;
		ctx.drawImage(img, img.width*-0.5, img.height*-0.5);
	}
	drawDots(ctx, world) {
		T.combineTransforms(this.transform, world, t);
		for (let dot of this.dots) {
			dot.render(ctx, t);
		}
	}
	addDot(x, y) {
		const v = [ x, y ];
		T.reverseTransform(this.transform, t);
		T.applyTransform(v, t, v);
		this.dots.push(new DotItem(...v));
		return this;
	}
}
