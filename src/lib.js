import Module from './webp_idec/build/webp_idec.js';

const loadTask = Module();

const objPool = {};
let objCount = 0;

onmessage = async function (e) {
	const myModule = await loadTask;
	const { id, objId, buf, size, isLastChunk } = e.data;
	const idec = objId ? objPool(objId) : new myModule.WebPIDec(size);
	if (!idec) {
		postMessage({ id, error: objId ? 'invalid object id' : 'create decoder failed' });
		return;
	}
	const resultObjId = objId ?? objCount++;
	const image = await idec.append(buf);
	if (!image) {
		postMessage({ id, objId: resultObjId, canvas: null });
		return;
	}
	const canvas = new OffscreenCanvas(image.width, image.height);
	const ctx = canvas.getContext('2d');
	ctx.putImageData(image, 0, 0);
	postMessage({ id, objId: resultObjId, canvas }, [canvas]);

	if (isLastChunk) {
		idec.delete();
		delete objPool[resultObjId];
	}
}
