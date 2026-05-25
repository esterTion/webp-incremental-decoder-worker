### Building

build wasm:  
```shell
# install emcc and setup env
git submodule --init
pushd src/webp_idec
bash build.sh
popd
```

build worker:  
```
pnpm install
pnpm build
```

### Usage

```JavaScript
// wasm usage
import Module from './webp_idec/build/webp_idec.js';
const myModule = await Module();

const idec = new myModule.WebPIDec(imageDataSize);

// null if too few data, ImageData otherwise
// should have enough data after 25 bytes
const image = idec.append(buffer);
canvas.width = image.width;
canvas.height = image.height;
ctx.putImageData(image, 0, 0);
```

```JavaScript
// worker usage
worker.postMessage({
	id, // message id
	objId, // decoeer object id, leave undefined for first chunk
	buf, // arraybuffer of data to append
	size, // total image data size
	isLastChunk, // decoder will be destroyed if true
});

worker.onmessage = e => {
	const { id } = e.data; // same id as above
	const { error } = e.data; // error string if decoder is destroyed or failed
	const { objId } = e.data; // decoder object id
	const { canvas } = e.data; // OffscreenCanvas object containing decoded image so far, or null if too few data
}
```

### License
[MIT License](LICENSE)

### Credits

[libwebp](https://github.com/webmproject/libwebp)  
[emscripten](https://emscripten.org/)  
