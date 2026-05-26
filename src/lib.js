import Module from './webp_idec/build/webp_idec.js';

const loadTask = Module();

const objPool = {};
let objCount = 0;

onmessage = async function (e) {
	const myModule = await loadTask;
	const { id, objId, buf, size, deleteObject } = e.data;
	const idec = objId ? objPool[objId] : new myModule.WebPIDec(size);
	if (!idec) {
		postMessage({ id, error: objId ? 'invalid object id' : 'create decoder failed' });
		return;
	}
	const resultObjId = objId ?? ++objCount;
	if (deleteObject) {
		idec.delete();
		delete objPool[resultObjId];
		postMessage({ id, objId: resultObjId });
		return;
	}
	if (!objPool[resultObjId]) {
		objPool[resultObjId] = idec;
	}
	const image = await idec.append(buf);
	if (!image) {
		postMessage({ id, objId: resultObjId, image: null });
		return;
	}
	postMessage({ id, objId: resultObjId, image }, [image.data.buffer]);
}
