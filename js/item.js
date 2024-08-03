import { buildTransform  } from './algebra.js';

export class Item {
	constructor() {
		this.transform = buildTransform();
	}
	render(ctx = new CanvasRenderingContext2D(), world = []) {
	}
}
