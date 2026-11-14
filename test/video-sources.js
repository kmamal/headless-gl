'use strict'

const tape = require('tape')
const createContext = require('../index')

class FakeVideo {
  constructor (frame) {
    this.width = 0
    this.height = 0
    this.videoWidth = frame ? frame.width : 0
    this.videoHeight = frame ? frame.height : 0
    this.currentFrame = frame
  }
}

function rgbaFrame (width, height) {
  const data = new Uint8Array(width * height * 4)
  for (let i = 0; i < width * height; ++i) data.set([i, 2 * i, 3 * i, 255], i * 4)
  return { width, height, displayWidth: width, displayHeight: height, format: 'rgba', planes: [data], data, timestamp: 0, duration: 0.1, segment: 0 }
}

function readTexture (gl, width, height) {
  const framebuffer = gl.createFramebuffer()
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, gl.getParameter(gl.TEXTURE_BINDING_2D), 0)
  const pixels = new Uint8Array(width * height * 4)
  gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels)
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  gl.deleteFramebuffer(framebuffer)
  return pixels
}

for (const webgl2 of [false, true]) {
  const name = webgl2 ? 'WebGL 2' : 'WebGL 1'

  tape(`${name}: texImage2D uploads a video element's current frame`, function (t) {
    const gl = createContext(4, 4, { createWebGL2Context: webgl2 })
    const frame = rgbaFrame(3, 2)
    gl.bindTexture(gl.TEXTURE_2D, gl.createTexture())
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, new FakeVideo(frame))
    t.equal(gl.getError(), gl.NO_ERROR)
    t.deepEqual(readTexture(gl, 3, 2), frame.data)

    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, new FakeVideo(frame))
    t.equal(gl.getError(), gl.NO_ERROR)

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, new FakeVideo(frame))
    const flipped = readTexture(gl, 3, 2)
    t.deepEqual(flipped.subarray(0, 12), frame.data.subarray(12, 24), 'rows are flipped')
    t.deepEqual(flipped.subarray(12, 24), frame.data.subarray(0, 12), 'rows are flipped')

    gl.getExtension('STACKGL_destroy_context').destroy()
    t.end()
  })

  tape(`${name}: a video element without a frame uploads an empty texture`, function (t) {
    const gl = createContext(4, 4, { createWebGL2Context: webgl2 })
    gl.bindTexture(gl.TEXTURE_2D, gl.createTexture())
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, new FakeVideo(null))
    t.equal(gl.getError(), gl.NO_ERROR)
    gl.getExtension('STACKGL_destroy_context').destroy()
    t.end()
  })

  tape(`${name}: video frames in a planar format are rejected`, function (t) {
    const gl = createContext(4, 4, { createWebGL2Context: webgl2 })
    gl.bindTexture(gl.TEXTURE_2D, gl.createTexture())
    const frame = { ...rgbaFrame(2, 2), format: 'yuv420p', data: undefined }
    t.throws(() => gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, new FakeVideo(frame)), TypeError)
    gl.getExtension('STACKGL_destroy_context').destroy()
    t.end()
  })
}

tape('RGBA UNSIGNED_BYTE image sources are uploaded without per-pixel conversion', function (t) {
  const gl = createContext(4, 4)
  const width = 1920
  const height = 1080
  const data = new Uint8Array(width * height * 4)
  for (let i = 0; i < data.length; i += 4097) data[i] = i & 0xff
  gl.bindTexture(gl.TEXTURE_2D, gl.createTexture())
  const start = process.hrtime.bigint()
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, { width, height, data })
  const elapsed = Number(process.hrtime.bigint() - start) / 1e6
  t.equal(gl.getError(), gl.NO_ERROR)
  t.ok(elapsed < 30, `1080p upload took ${elapsed.toFixed(1)} ms`)

  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true)
  const translucent = new Uint8Array([200, 100, 50, 128])
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, { width: 1, height: 1, data: translucent })
  t.deepEqual(Array.from(readTexture(gl, 1, 1)), [100, 50, 25, 128], 'premultiplied sources still convert')

  gl.getExtension('STACKGL_destroy_context').destroy()
  t.end()
})
