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


## WebGL 2

Pass `createWebGL2Context: true` to get a `WebGL2RenderingContext`, headless or in a window.
The implementation does not currently pass the full conformance test, but it's enough to get Three.js working.


## Development

```sh
GL_FROM_SOURCE=1 npm install   # build the addon instead of downloading a release
npm test                       # upstream's tape suite, including the WebGL conformance tests
```
