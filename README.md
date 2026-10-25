# @kmamal/gl

This is a fork of the [`headless-gl`](https://github.com/stackgl/headless-gl#readme) package that works together with [`@kmamal/sdl`](https://github.com/kmamal/node-sdl#readme) to lets you draw WebGL to real windows.
Headless use works exactly as in `headless-gl`.

WebGL 2 support has also been improved and some upstream bugs fixed.

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


## Rendering to a window

Call `createContext` with the `window` option. The window must be created with `opengl: true`, otherwise `createContext` throws.

Contexts created this way have these differences from headless contexts:

* `gl.swap()` presents the frame.
* `drawingBufferWidth` and `drawingBufferHeight` do not follow the window. When the window is resized, call `gl.getExtension('STACKGL_resize_drawingbuffer').resize(pixelWidth, pixelHeight)` to update them.
* Destroy the context with `gl.getExtension('STACKGL_destroy_context').destroy()` before destroying the window.
* EGL allows one surface per window, so destroy a window's context before creating another one on the same window.
* With `antialias: false` the context draws straight into the window surface, unless `alpha` is `false` and the window surface has an alpha channel, in which case it draws into an internal framebuffer without one and `gl.swap()` copies it into the window surface. With `antialias: true` (the default) it draws into an internal multisampled framebuffer, the same way headless contexts emulate the default framebuffer, and `gl.swap()` resolves it into the window surface before presenting. Unless `preserveDrawingBuffer` is set, the drawing buffer is cleared after each swap, like in a browser.


## Antialiasing

`antialias` defaults to `true`, as in browsers, for both headless and window contexts. The default framebuffer is then backed by multisampled renderbuffers with `min(4, MAX_SAMPLES)` samples, and `getParameter(SAMPLES)` and `getParameter(SAMPLE_BUFFERS)` report it while it is bound.
Reading from it with `readPixels`, `copyTexImage2D`, `copyTexSubImage2D`, `copyTexSubImage3D` or a color-only `blitFramebuffer` resolves it implicitly first, like a browser does.
Blitting depth or stencil out of it follows the multisample rules (identical rectangles), and blitting into it fails with `INVALID_OPERATION`, as in browsers.
If multisampling is unavailable, `getContextAttributes().antialias` reports `false`.
Pass `antialias: false` to get the previous behavior back.


## Worker threads

The addon can be loaded in `worker_threads`, and each thread can create and use its own contexts.
A context belongs to the thread that created it and is destroyed when that thread exits, even if it was terminated.

An SDL window can only be created on the main thread, but a worker can render to it.
Post the window's `native` value to the worker, and pass `{ native }` as the `window` option there:

```js
// main thread
const window = sdl.video.createWindow({ opengl: true })
const worker = new Worker('./render.js', { workerData: { native: window.native, width: window.pixelWidth, height: window.pixelHeight } })

// render.js
const { native, width, height } = workerData
const gl = createContext(width, height, { window: { native } })
```

The worker can't see the window, so the main thread has to forward the resize events it needs, and it must stop the worker before it destroys the window.

On Linux, ANGLE's default OpenGL backend runs every context on the same native GLX context, so only one thread at a time may hold contexts: rendering from a worker works as long as the main thread has no contexts of its own.
Creating a context while another thread holds some throws an error with `code` set to `'ERR_GL_THREAD_CONFLICT'`, for headless contexts too.
Set `ANGLE_DEFAULT_PLATFORM=vulkan` to use ANGLE's Vulkan backend, which lets several threads render at once.


## WebGL 2

Pass `createWebGL2Context: true` to get a `WebGL2RenderingContext`, headless or in a window.
The implementation does not currently pass the full conformance test, but it's enough to get Three.js working.


## Development

```sh
GL_FROM_SOURCE=1 npm install   # build the addon instead of downloading a release
npm test                       # upstream's tape suite, including the WebGL conformance tests
```
