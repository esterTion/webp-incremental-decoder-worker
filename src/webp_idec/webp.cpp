#include "emscripten.h"
#include "emscripten/bind.h"
#include "emscripten/val.h"
#include <stdlib.h>
#include "src/webp/decode.h"

#include <stdio.h>

EMSCRIPTEN_KEEPALIVE
int version() {
    return WebPGetDecoderVersion();
}

using namespace emscripten;
thread_local const val Uint8ClampedArray = val::global("Uint8ClampedArray");
thread_local const val ImageData = val::global("ImageData");


class WebPIDec {
public:
    WebPIDec(uint32_t size) {
        idec = NULL;
        memset(&decBuffer, 0, sizeof(decBuffer));
        data = (uint8_t*)malloc(size);
        totalSize = size;
        currentSize = 0;
        rgba = NULL;
        width = 0;
        height = 0;
    }
    ~WebPIDec() {
        if (idec != NULL) {
            WebPIDelete(idec);
            WebPFreeDecBuffer(&decBuffer);
        }
        if (rgba != NULL) {
            free(rgba);
        }
        free(data);
    }

    val append(std::string buffer) {
        VP8StatusCode status;

        uint32_t bufferSize = buffer.size();
        uint32_t copySize = ((bufferSize) < (totalSize - currentSize)) ? (bufferSize) : (totalSize - currentSize);
        memcpy(data + currentSize, buffer.c_str(), copySize);
        currentSize += buffer.size();
        if (!rgba) {
            WebPGetInfo(data, currentSize, &width, &height);
            if (width == 0 || height == 0) return val::null();
            rgba = (uint8_t*)malloc(width * height * 4);
            memset(rgba, 0, width * height * 4);
            WebPInitDecBuffer(&decBuffer);
            decBuffer.width = width;
            decBuffer.height = height;
            decBuffer.colorspace = MODE_RGBA;
            decBuffer.u.RGBA.rgba = rgba;
            decBuffer.u.RGBA.size = width * height * 4;
            decBuffer.u.RGBA.stride = width * 4;
            decBuffer.is_external_memory = 1;
            idec = WebPINewDecoder(&decBuffer);
        }

        status = WebPIUpdate(idec, data, currentSize);
        if (status != VP8_STATUS_OK && status != VP8_STATUS_SUSPENDED) {
            return val::null();
        }
        if (width == 0 || height == 0) return val::null();
        return rgba
            ? ImageData.new_(
                Uint8ClampedArray.new_(
                    typed_memory_view(width * height * 4, rgba)),
                    width,
                    height
                )
            : val::null();
    }

private:
    WebPIDecoder* idec;
    WebPDecBuffer decBuffer;
    uint8_t* data;
    uint32_t totalSize;
    uint32_t currentSize;
    uint8_t* rgba;
    int width;
    int height;
};

EMSCRIPTEN_BINDINGS(my_module) {
    function("version", &version);
    class_<WebPIDec>("WebPIDec")
        .constructor<uint32_t>()
        .function("append", &WebPIDec::append);
}
