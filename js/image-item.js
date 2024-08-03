import * as T from './algebra.js';
import { Item } from './item.js';

const t = T.buildTransform();

export class ImageItem extends Item {
	constructor(img = document.createElement('img')) {
		super();
		this.img = img;
		this.alpha = 1;
	}
	render(ctx = new CanvasRenderingContext2D(), world = []) {
		const { img } = this;
		T.combineTransforms(this.transform, world, t);
		ctx.setTransform(...t);
		ctx.globalAlpha = this.alpha;
		ctx.drawImage(img, img.width*-0.5, img.height*-0.5);
	}
}
