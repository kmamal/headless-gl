'use strict'

const tape = require('tape')
const createContext = require('../index')

class FakeBitmap {
  constructor (width, height, data) {
    this.width = width
    this.height = height
    this.data = data
  }

  get [Symbol.toStringTag] () {
    return 'ImageBitmap'
  }
}

function upload (gl, source) {
  const texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source)
  const framebuffer = gl.createFramebuffer()
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)
  const pixels = new Uint8Array(2 * 2 * 4)
  gl.readPixels(0, 0, 2, 2, gl.RGBA, gl.UNSIGNED_BYTE, pixels)
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  return pixels
}

const data = new Uint8ClampedArray([
  1, 0, 0, 255, 2, 0, 0, 255,
  3, 0, 0, 255, 4, 0, 0, 255
])

tape('UNPACK_FLIP_Y_WEBGL is ignored for ImageBitmap sources', function (t) {
  const gl = createContext(4, 4, { createWebGL2Context: true })
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)

  const bitmap = upload(gl, new FakeBitmap(2, 2, data))
  t.deepEqual([bitmap[0], bitmap[4], bitmap[8], bitmap[12]], [1, 2, 3, 4], 'bitmap rows are not flipped')

  const imageData = upload(gl, { width: 2, height: 2, data })
  t.deepEqual([imageData[0], imageData[4], imageData[8], imageData[12]], [3, 4, 1, 2], 'other sources are still flipped')

  gl.getExtension('STACKGL_destroy_context').destroy()
  t.end()
})

tape('UNPACK_PREMULTIPLY_ALPHA_WEBGL is ignored for ImageBitmap sources', function (t) {
  const gl = createContext(4, 4, { createWebGL2Context: true })
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true)
  const translucent = new Uint8ClampedArray(2 * 2 * 4)
  for (let i = 0; i < translucent.length; i += 4) translucent.set([200, 100, 50, 128], i)

  const bitmap = upload(gl, new FakeBitmap(2, 2, translucent))
  t.deepEqual(Array.from(bitmap.subarray(0, 4)), [200, 100, 50, 128], 'bitmap is not premultiplied')

  const imageData = upload(gl, { width: 2, height: 2, data: translucent })
  t.deepEqual(Array.from(imageData.subarray(0, 4)), [100, 50, 25, 128], 'other sources are still premultiplied')

  gl.getExtension('STACKGL_destroy_context').destroy()
  t.end()
})
