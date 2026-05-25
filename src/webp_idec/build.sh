mkdir -p build

emcc.bat -O3 -s WASM=1 \
  -s EXPORT_ES6=1 \
  -s MODULARIZE=1 \
  -s ENVIRONMENT=web,worker \
  -sALLOW_MEMORY_GROWTH \
  -o build/webp_idec.js \
  -I libwebp \
  -I libwebp/src \
  -lembind \
  webp.cpp \
  libwebp/src/{dec,dsp,demux,enc,mux,utils}/*.c \
  libwebp/sharpyuv/*.c
