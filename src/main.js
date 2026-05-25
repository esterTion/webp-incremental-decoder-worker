// import { decode } from '@jsquash/webp';
import Module from './webp_idec/build/webp_idec.js';

const myModule = await Module();
// console.log(myModule);
console.log('webp version', myModule.version().toString(16));


const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

const resp = await fetch('/340390_0.webp');
const buf = await resp.arrayBuffer();
const idec = new myModule.WebPIDec(buf.byteLength);

let consumed = 0;

async function consume() {
	const size = Math.min(Math.round(Math.random() * buf.byteLength / 5), buf.byteLength - consumed);
	// const size = Math.min(512*1024, buf.byteLength - consumed);
	if (size === 0) return;
	const partial = buf.slice(consumed, consumed + size);
	consumed += size;
	console.log(`consumed ${size} bytes, total ${consumed}/${buf.byteLength}`);
	const image = await idec.append(partial);
	if (!image) return;
	canvas.width = image.width;
	canvas.height = image.height;
	ctx.putImageData(image, 0, 0);
}

document.body.appendChild(canvas);

consume();

window.consume = consume;
window.clean = function () {
	idec.delete();
}
