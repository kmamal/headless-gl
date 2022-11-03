# @kmamal/gl

This is a simple fork of the [`gl`](https://github.com/stackgl/headless-gl#readme) package that adds a single feature:
it can work together with [`@kmamal/sdl`](https://github.com/kmamal/node-sdl#readme) to allow WebGL drawing to actual windows.

It should work on Linux, Mac, and Windows.
Prebuilt binaries are available for x64 architectures, and arm-based Macs.

Releases of this package start from `v4.9.0` of `gl`.
This package's version number tracks the `gl` package's version number and appends a suffix with it's own "release" version such as:
`v4.9.0-2` where the `-2` suffix denotes that this is the second release of this package for the `v4.9.0` release of `gl`.

## Example

```js
const sdl = require('@kmamal/sdl')
const createContext = require('@kmamal/gl')

const window = sdl.video.createWindow({
  title: "Hello, World!"
  opengl: true,
})

// Clear screen to red
const { width, height, native } = window
const gl = createContext(width, height, { window: native })
gl.clearColor(1, 0, 0, 1)
gl.clear(gl.COLOR_BUFFER_BIT)
gl.swap()
```
