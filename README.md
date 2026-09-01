# @kmamal/gl

This is a simple fork of the [`gl`](https://github.com/stackgl/headless-gl#readme) package that adds a single feature:
it can work together with [`@kmamal/sdl`](https://github.com/kmamal/node-sdl#readme) to allow WebGL drawing to actual windows.

It should work on Linux, Mac, and Windows.
Prebuilt binaries are available for x64 architectures, and arm-based Macs.

On Linux, both X11 and Wayland windows are supported (matching `window.native.subsystem` from `@kmamal/sdl`).
Wayland rendering goes through ANGLE's Vulkan backend, so it needs a working Vulkan driver.
The Linux native-window payload is an ABI contract shared with `@kmamal/sdl`: versions of this package from 10 on require `@kmamal/sdl` >= 0.12, and older versions only work with older sdl.

## Example

```js
const sdl = require('@kmamal/sdl')
const createContext = require('@kmamal/gl')

const window = sdl.video.createWindow({
  title: "Hello, World!"
  opengl: true,
})

// Clear screen to red
const { pixelWidth: width, pixelHeight: height, native } = window
const gl = createContext(width, height, { window: native })
gl.clearColor(1, 0, 0, 1)
gl.clear(gl.COLOR_BUFFER_BIT)
gl.swap()
```
