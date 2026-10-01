# @kmamal/gl

This is a simple fork of the [`gl`](https://github.com/stackgl/headless-gl#readme) package with one added feature.
Together with [`@kmamal/sdl`](https://github.com/kmamal/node-sdl#readme), it lets you draw WebGL to real windows.

It should work on Linux (X11 and Wayland), Mac, and Windows.
Prebuilt binaries exist for x64 and arm architectures on all supported platforms.


## Example

```js
const sdl = require('@kmamal/sdl')
const createContext = require('@kmamal/gl')

const window = sdl.video.createWindow({
  title: "Hello, World!",
  opengl: true,
})

// Clear screen to red
const { pixelWidth: width, pixelHeight: height, native } = window
const gl = createContext(width, height, { window: native })
gl.clearColor(1, 0, 0, 1)
gl.clear(gl.COLOR_BUFFER_BIT)
gl.swap()
```
