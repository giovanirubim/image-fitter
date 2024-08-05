import * as T from './algebra.js';

const t = T.buildTransform();

export class Item {
	constructor(img = document.createElement('img')) {
		this.transform = T.buildTransform();
		this.img = img;
		this.dots = [];
	}
	render(ctx, world) {
		const { img } = this;
		T.combineTransforms(this.transform, world, t);
		ctx.setTransform(...t);
		ctx.drawImage(img, img.width*-0.5, img.height*-0.5);
	}
}
