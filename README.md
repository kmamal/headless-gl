# @kmamal/gl

This is a simple fork of the [`gl`](https://github.com/stackgl/headless-gl#readme) package that adds a single feature: it can work together with [`@kmamal/sdl`](https://github.com/kmamal/node-sdl#readme) to allow WebGL drawing to actual windows.

It should work on Linux, Mac, and Windows. Prebuilt binaries are available for x64 architectures.

Releases of this package start from `v4.9.0` of `gl`. This package's version number tracks the `gl` package's version number and appends a suffix with it's own "release" version such as: `v4.9.0-2` where the `-2` suffix denotes that this is the second release of this package for the `v4.9.0` release of `gl`.

## Example

```js
const sdl = require('@kmamal/sdl')
const createContext = require('@kmamal/gl')

const window = sdl.video.createWindow({ opengl: true })
const { width, height, native } = window
const gl = createContext(width, height, { window: native })

// Clear screen to red
gl.clearColor(1, 0, 0, 1)
gl.clear(gl.COLOR_BUFFER_BIT)
gl.swap()

for (;;) {
  const event = sdl.events.wait()
  if (event?.type === 'quit') { break }
}
```
