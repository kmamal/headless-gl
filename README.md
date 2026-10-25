# @kmamal/gl

This is a fork of the [`headless-gl`](https://github.com/stackgl/headless-gl#readme) package that works together with [`@kmamal/sdl`](https://github.com/kmamal/node-sdl#readme) to let you draw WebGL to real windows.
Headless use works as in `headless-gl` with [some differences](#differences-from-headless-gl).

It should work on Linux (X11 and Wayland), Mac, and Windows.
Prebuilt binaries exist for x64 and arm64 on Linux and Mac, and for x64 on Windows.


## Example

```js
const sdl = require('@kmamal/sdl')
const createContext = require('@kmamal/gl')

const window = sdl.video.createWindow({
  title: "Hello, World!",
  opengl: true,
})

// Clear screen to red
const { pixelWidth: width, pixelHeight: height } = window
const gl = createContext(width, height, { window })
gl.clearColor(1, 0, 0, 1)
gl.clear(gl.COLOR_BUFFER_BIT)
gl.swap()
```


## Differences from `headless-gl`

### Rendering to a window

Call `createContext` with the `window` option. The window must be have been created with `opengl: true`, otherwise `createContext` throws.

Contexts created this way have these differences from headless contexts:

* `gl.swap()` presents the frame.
* `drawingBufferWidth` and `drawingBufferHeight` do not follow the window. When the window is resized, call `gl.getExtension('STACKGL_resize_drawingbuffer').resize(pixelWidth, pixelHeight)` to update them.
* Destroy the context with `gl.getExtension('STACKGL_destroy_context').destroy()` before destroying the window.
* EGL allows one surface per window, so destroy a window's context before creating another one on the same window.


### Antialiasing

To follow browser behavior more closely, headless and window contexts both enable antialiasing by default.
Pass `antialias: false` to `createContext` to get the previous behavior back.
If antialiasing is enabled, but the platform cannot multisample, the context falls back to a non-antialiased drawing buffer and`getContextAttributes().antialias` reports `false`.


### Worker threads

The library can be loaded in `worker_threads`, and each thread can create and use its own contexts.
A context belongs to the thread that created it and is destroyed when that thread exits.

An SDL window can only be created on the main thread, but a worker can still render to it directly form its own thread.
Post the window's `native` value to the worker, and pass `{ native }` as the `window` option there:

```js
// main thread
const window = sdl.video.createWindow({ opengl: true })
const worker = new Worker('./render.js', { workerData: { native: window.native, width: window.pixelWidth, height: window.pixelHeight } })

// render.js
const { native, width, height } = workerData
const gl = createContext(width, height, { window: { native } })
```

The main thread also has to forward any resize events to the worker, and it must stop the worker before it destroys the window.


#### Limitations

On Linux, ANGLE's default OpenGL backend runs every context on the same native GLX context, so only one thread at a time may hold contexts: rendering from a worker works as long as the main thread has no contexts of its own.
Creating a context while another thread holds some throws an error with `code` set to `'ERR_GL_THREAD_CONFLICT'`, for headless contexts too.
Set `ANGLE_DEFAULT_PLATFORM=vulkan` to use ANGLE's Vulkan backend, which lets several threads render at once.


### WebGL 2

Pass `createWebGL2Context: true` to get a `WebGL2RenderingContext`, headless or in a window.
The implementation does not currently pass the full conformance test, but it's enough to get [Three.js](https://github.com/kmamal/three#readme) working.


### Extensions

These extensions are available in addition to the ones in `headless-gl`:

* `WEBGL_lose_context`: `loseContext()` and `restoreContext()`, together with the `webglcontextlost` and `webglcontextrestored` events.
* `WEBGL_compressed_texture_s3tc`, `WEBGL_compressed_texture_s3tc_srgb`, `WEBGL_compressed_texture_etc`, `WEBGL_compressed_texture_astc`, `EXT_texture_compression_bptc` and `EXT_texture_compression_rgtc`: compressed texture formats. Use `getSupportedExtensions()` to see which ones the platform supports.
* `EXT_color_buffer_half_float`: half-float color buffers, for WebGL 2 contexts.


### Bug fixes

* `readPixels` no longer writes past the end of the destination array.
* `GLintptr` arguments (such as buffer offsets) are no longer truncated to 32 bits.
* `bufferData` and `bufferSubData` accept any `ArrayBufferView` or `SharedArrayBuffer`, and `bufferSubData` can write at the very end of the buffer.
* Buffers pending deletion are treated as deleted, and deleting a buffer no longer resets the attribute state of the bound vertex array object.
* `deleteBuffer`, `deleteFramebuffer`, `deleteRenderbuffer`, `deleteVertexArray` and `deleteVertexArrayOES` ignore `null`.
* `vertexAttrib*fv` checks the index and raises `INVALID_VALUE`.
* `getShaderPrecisionFormat` and `getUniformLocation` return `null` on invalid arguments, and `getUniformLocation` resolves plain array names.
* Uniform arrays can be set starting from any element location, and `uniformMatrix*fv` requires whole matrices.
* Integer uniforms are read with `glGetUniformiv`.
* Cube map faces are rejected when no cube map texture is bound.
* The separate read and draw framebuffers are restored after a resize.
* Invalid framebuffer targets raise `INVALID_ENUM`.
* `UNPACK_FLIP_Y_WEBGL` and `UNPACK_PREMULTIPLY_ALPHA_WEBGL` are ignored for `ImageBitmap` sources.
* `drawBuffersWEBGL([gl.BACK])` works on the default framebuffer.
