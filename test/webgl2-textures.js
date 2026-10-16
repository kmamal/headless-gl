'use strict'

const tape = require('tape')
const createContext = require('../index')
const makeProgram = require('./util/make-program')
const drawTriangle = require('./util/draw-triangle')

const VERT_SRC = [
  '#version 300 es',
  'layout(location = 0) in vec2 position;',
  'void main () {',
  '  gl_Position = vec4(position, 0.0, 1.0);',
  '}'
].join('\n')

const FRAG_3D_SRC = [
  '#version 300 es',
  'precision highp float;',
  'precision highp sampler3D;',
  'uniform sampler3D tex;',
  'uniform vec3 coord;',
  'out vec4 fragColor;',
  'void main () {',
  '  fragColor = texture(tex, coord);',
  '}'
].join('\n')

function createGL (t) {
  const gl = createContext(8, 8, { createWebGL2Context: true })
  t.ok(gl, 'created a WebGL2 context')
  return gl
}

function destroy (gl) {
  gl.getExtension('STACKGL_destroy_context').destroy()
}

function readPixel (gl, x, y) {
  const pixel = new Uint8Array(4)
  gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel)
  return Array.from(pixel)
}

function nearest (gl, target) {
  gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
  gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
}

tape('3D textures', function (t) {
  const gl = createGL(t)
  const program = makeProgram(gl, VERT_SRC, FRAG_3D_SRC)
  t.ok(gl.getProgramParameter(program, gl.LINK_STATUS), gl.getProgramInfoLog(program))
  gl.useProgram(program)
  const coord = gl.getUniformLocation(program, 'coord')

  const texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_3D, texture)
  t.equal(gl.getParameter(gl.TEXTURE_BINDING_3D), texture)
  t.equal(gl.getParameter(gl.TEXTURE_BINDING_2D), null)
  nearest(gl, gl.TEXTURE_3D)
  const voxels = new Uint8Array(2 * 2 * 2 * 4)
  for (let i = 0; i < 8; ++i) {
    voxels[i * 4] = (i & 1) * 255
    voxels[i * 4 + 1] = (i >> 1 & 1) * 255
    voxels[i * 4 + 2] = (i >> 2 & 1) * 255
    voxels[i * 4 + 3] = 255
  }
  gl.texImage3D(gl.TEXTURE_3D, 0, gl.RGBA8, 2, 2, 2, 0, gl.RGBA, gl.UNSIGNED_BYTE, voxels)
  t.equal(gl.getError(), gl.NO_ERROR)

  gl.uniform3f(coord, 0.25, 0.25, 0.25)
  drawTriangle(gl)
  t.deepEqual(readPixel(gl, 4, 4), [0, 0, 0, 255], 'voxel (0, 0, 0)')
  gl.uniform3f(coord, 0.75, 0.25, 0.75)
  drawTriangle(gl)
  t.deepEqual(readPixel(gl, 4, 4), [255, 0, 255, 255], 'voxel (1, 0, 1)')

  const prefixed = new Uint8Array(4 + voxels.length)
  prefixed.set(voxels, 4)
  gl.texImage3D(gl.TEXTURE_3D, 0, gl.RGBA8, 2, 2, 2, 0, gl.RGBA, gl.UNSIGNED_BYTE, prefixed, 4)
  t.equal(gl.getError(), gl.NO_ERROR, 'srcOffset')
  gl.uniform3f(coord, 0.25, 0.75, 0.25)
  drawTriangle(gl)
  t.deepEqual(readPixel(gl, 4, 4), [0, 255, 0, 255], 'voxel (0, 1, 0) after an offset upload')

  gl.texSubImage3D(gl.TEXTURE_3D, 0, 0, 0, 0, 1, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([9, 9, 9, 9, 255, 255, 255, 255]), 4)
  t.equal(gl.getError(), gl.NO_ERROR, 'texSubImage3D with srcOffset')
  gl.uniform3f(coord, 0.25, 0.25, 0.25)
  drawTriangle(gl)
  t.deepEqual(readPixel(gl, 4, 4), [255, 255, 255, 255], 'voxel (0, 0, 0) replaced')

  const unpack = gl.createBuffer()
  gl.bindBuffer(gl.PIXEL_UNPACK_BUFFER, unpack)
  gl.bufferData(gl.PIXEL_UNPACK_BUFFER, new Uint8Array([1, 2, 3, 4, 0, 255, 255, 255]), gl.STATIC_DRAW)
  gl.texSubImage3D(gl.TEXTURE_3D, 0, 0, 0, 0, 1, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, voxels)
  t.equal(gl.getError(), gl.INVALID_OPERATION, 'view with an unpack buffer bound')
  gl.texSubImage3D(gl.TEXTURE_3D, 0, 0, 0, 0, 1, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, 4)
  t.equal(gl.getError(), gl.NO_ERROR, 'texSubImage3D from an unpack buffer')
  gl.texImage3D(gl.TEXTURE_3D, 0, gl.RGBA8, 1, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, 4)
  t.equal(gl.getError(), gl.NO_ERROR, 'texImage3D from an unpack buffer')
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true)
  gl.texImage3D(gl.TEXTURE_3D, 0, gl.RGBA8, 1, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, 4)
  t.equal(gl.getError(), gl.INVALID_OPERATION, 'premultiplyAlpha is not supported for unpack buffer uploads')
  gl.texSubImage3D(gl.TEXTURE_3D, 0, 0, 0, 0, 1, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, 4)
  t.equal(gl.getError(), gl.INVALID_OPERATION, 'nor for texSubImage3D')
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false)
  gl.bindBuffer(gl.PIXEL_UNPACK_BUFFER, null)
  gl.uniform3f(coord, 0.5, 0.5, 0.5)
  drawTriangle(gl)
  t.deepEqual(readPixel(gl, 4, 4), [0, 255, 255, 255], 'texel from the unpack buffer')

  gl.texImage3D(gl.TEXTURE_3D, 0, gl.RGBA8, 2, 2, 2, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
  t.equal(gl.getError(), gl.NO_ERROR, 'null data')
  gl.texImage3D(gl.TEXTURE_3D, 0, gl.RGBA8, 2, 2, 2, 0, gl.RGBA, gl.UNSIGNED_BYTE, 4)
  t.equal(gl.getError(), gl.INVALID_OPERATION, 'offset without an unpack buffer')
  gl.texImage3D(gl.TEXTURE_2D, 0, gl.RGBA8, 2, 2, 2, 0, gl.RGBA, gl.UNSIGNED_BYTE, voxels)
  t.equal(gl.getError(), gl.INVALID_ENUM, 'bad target')
  gl.texImage3D(gl.TEXTURE_3D, 0, gl.RGBA8, 2, 2, 2, 0, gl.RGBA, gl.UNSIGNED_BYTE, voxels, 100)
  t.equal(gl.getError(), gl.INVALID_OPERATION, 'srcOffset past the end')
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
  gl.texImage3D(gl.TEXTURE_3D, 0, gl.RGBA8, 2, 2, 2, 0, gl.RGBA, gl.UNSIGNED_BYTE, voxels)
  t.equal(gl.getError(), gl.INVALID_OPERATION, 'flipY is not supported for 3D uploads')
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)
  t.throws(function () {
    gl.texImage3D(gl.TEXTURE_3D, 0, gl.RGBA8, 2, 2, 2, 0, gl.RGBA, gl.UNSIGNED_BYTE, [1, 2, 3, 4])
  }, TypeError)
  gl.activeTexture(gl.TEXTURE1)
  gl.texImage3D(gl.TEXTURE_3D, 0, gl.RGBA8, 2, 2, 2, 0, gl.RGBA, gl.UNSIGNED_BYTE, voxels)
  t.equal(gl.getError(), gl.INVALID_OPERATION, 'no texture bound')

  destroy(gl)
  t.end()
})

tape('2D array textures with texStorage3D', function (t) {
  const gl = createGL(t)

  const texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D_ARRAY, texture)
  t.equal(gl.getParameter(gl.TEXTURE_BINDING_2D_ARRAY), texture)
  nearest(gl, gl.TEXTURE_2D_ARRAY)
  t.equal(gl.getTexParameter(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_IMMUTABLE_FORMAT), false)
  gl.texStorage3D(gl.TEXTURE_2D_ARRAY, 1, gl.RGBA8, 2, 2, 3)
  t.equal(gl.getError(), gl.NO_ERROR)
  t.equal(gl.getTexParameter(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_IMMUTABLE_FORMAT), true)
  t.equal(gl.getTexParameter(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_IMMUTABLE_LEVELS), 1)

  const red = new Uint8Array([255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255])
  gl.texSubImage3D(gl.TEXTURE_2D_ARRAY, 0, 0, 0, 1, 2, 2, 1, gl.RGBA, gl.UNSIGNED_BYTE, red)
  t.equal(gl.getError(), gl.NO_ERROR)

  const framebuffer = gl.createFramebuffer()
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
  gl.framebufferTextureLayer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, texture, 0, 1)
  t.equal(gl.checkFramebufferStatus(gl.FRAMEBUFFER), gl.FRAMEBUFFER_COMPLETE)
  t.deepEqual(readPixel(gl, 0, 0), [255, 0, 0, 255], 'layer 1')
  t.equal(gl.getFramebufferAttachmentParameter(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.FRAMEBUFFER_ATTACHMENT_TEXTURE_LAYER), 1)
  gl.framebufferTextureLayer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, texture, 0, 0)
  t.deepEqual(readPixel(gl, 0, 0), [0, 0, 0, 0], 'layer 0 is untouched')

  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  gl.clearColor(0, 0, 1, 1)
  gl.clear(gl.COLOR_BUFFER_BIT)
  gl.copyTexSubImage3D(gl.TEXTURE_2D_ARRAY, 0, 0, 0, 2, 0, 0, 2, 2)
  t.equal(gl.getError(), gl.NO_ERROR, 'copyTexSubImage3D')
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
  gl.framebufferTextureLayer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, texture, 0, 2)
  t.deepEqual(readPixel(gl, 1, 1), [0, 0, 255, 255], 'layer 2 holds the copied pixels')

  gl.texImage3D(gl.TEXTURE_2D_ARRAY, 0, gl.RGBA8, 2, 2, 3, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
  t.equal(gl.getError(), gl.INVALID_OPERATION, 'immutable textures cannot be respecified')
  gl.texStorage3D(gl.TEXTURE_2D_ARRAY, 1, gl.RGBA8, 2, 2, 3)
  t.equal(gl.getError(), gl.INVALID_OPERATION, 'or given storage again')

  gl.texStorage3D(gl.TEXTURE_2D, 1, gl.RGBA8, 2, 2, 3)
  t.equal(gl.getError(), gl.INVALID_ENUM, 'bad target')
  gl.bindTexture(gl.TEXTURE_2D_ARRAY, gl.createTexture())
  gl.texStorage3D(gl.TEXTURE_2D_ARRAY, 0, gl.RGBA8, 2, 2, 3)
  t.equal(gl.getError(), gl.INVALID_VALUE, 'levels must be positive')
  gl.texStorage3D(gl.TEXTURE_2D_ARRAY, 1, gl.RGBA8, 2, 2, 0)
  t.equal(gl.getError(), gl.INVALID_VALUE, 'depth must be positive')
  gl.texStorage3D(gl.TEXTURE_2D_ARRAY, 3, gl.RGBA8, 2, 2, 3)
  t.equal(gl.getError(), gl.INVALID_OPERATION, 'too many levels for the size')
  gl.bindTexture(gl.TEXTURE_2D_ARRAY, null)
  gl.texStorage3D(gl.TEXTURE_2D_ARRAY, 1, gl.RGBA8, 2, 2, 3)
  t.equal(gl.getError(), gl.INVALID_OPERATION, 'no texture bound')

  destroy(gl)
  t.end()
})

tape('texStorage2D', function (t) {
  const gl = createGL(t)

  const texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, texture)
  nearest(gl, gl.TEXTURE_2D)
  gl.texStorage2D(gl.TEXTURE_2D, 3, gl.RGBA8, 4, 4)
  t.equal(gl.getError(), gl.NO_ERROR)
  t.equal(gl.getTexParameter(gl.TEXTURE_2D, gl.TEXTURE_IMMUTABLE_FORMAT), true)
  t.equal(gl.getTexParameter(gl.TEXTURE_2D, gl.TEXTURE_IMMUTABLE_LEVELS), 3)
  const green = new Uint8Array(4 * 4 * 4)
  for (let i = 0; i < 16; ++i) {
    green.set([0, 255, 0, 255], i * 4)
  }
  gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 4, 4, gl.RGBA, gl.UNSIGNED_BYTE, green)
  gl.generateMipmap(gl.TEXTURE_2D)
  t.equal(gl.getError(), gl.NO_ERROR, 'subimage and mipmaps on immutable storage')

  const framebuffer = gl.createFramebuffer()
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 2)
  t.equal(gl.checkFramebufferStatus(gl.FRAMEBUFFER), gl.FRAMEBUFFER_COMPLETE)
  t.deepEqual(readPixel(gl, 0, 0), [0, 255, 0, 255], 'the last mip level exists')

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 4, 4, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
  t.equal(gl.getError(), gl.INVALID_OPERATION, 'immutable textures cannot be respecified')
  gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RGBA8, 4, 4)
  t.equal(gl.getError(), gl.INVALID_OPERATION, 'or given storage again')

  const cube = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, cube)
  gl.texStorage2D(gl.TEXTURE_CUBE_MAP, 1, gl.RGBA8, 2, 2)
  t.equal(gl.getError(), gl.NO_ERROR, 'cube maps')

  const plain = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, plain)
  gl.texStorage2D(gl.TEXTURE_2D, 0, gl.RGBA8, 4, 4)
  t.equal(gl.getError(), gl.INVALID_VALUE, 'levels must be positive')
  gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RGBA8, 0, 4)
  t.equal(gl.getError(), gl.INVALID_VALUE, 'size must be positive')
  gl.texStorage2D(gl.TEXTURE_2D, 4, gl.RGBA8, 4, 4)
  t.equal(gl.getError(), gl.INVALID_OPERATION, 'too many levels for the size')
  gl.texStorage2D(gl.TEXTURE_3D, 1, gl.RGBA8, 4, 4)
  t.equal(gl.getError(), gl.INVALID_ENUM, 'bad target')
  gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RGBA, 4, 4)
  t.equal(gl.getError(), gl.INVALID_ENUM, 'unsized formats are rejected')
  gl.bindTexture(gl.TEXTURE_2D, null)
  gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RGBA8, 4, 4)
  t.equal(gl.getError(), gl.INVALID_OPERATION, 'no texture bound')

  destroy(gl)
  t.end()
})

tape('texImage2D and texSubImage2D with srcOffset', function (t) {
  const gl = createGL(t)

  const texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, texture)
  nearest(gl, gl.TEXTURE_2D)
  const data = new Uint8Array([9, 9, 9, 9, 255, 0, 0, 255, 0, 255, 0, 255])
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, data, 4)
  t.equal(gl.getError(), gl.NO_ERROR)
  const framebuffer = gl.createFramebuffer()
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)
  t.deepEqual(readPixel(gl, 0, 0), [255, 0, 0, 255], 'texImage2D srcOffset')
  gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, data, 8)
  t.equal(gl.getError(), gl.NO_ERROR)
  t.deepEqual(readPixel(gl, 0, 0), [0, 255, 0, 255], 'texSubImage2D srcOffset')
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_SHORT_4_4_4_4, new Uint16Array([0, 0xF00F]), 1)
  t.equal(gl.getError(), gl.NO_ERROR)
  t.deepEqual(readPixel(gl, 0, 0), [255, 0, 0, 255], 'srcOffset counts elements of the view')
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint32Array(data.buffer), 1)
  t.equal(gl.getError(), gl.INVALID_OPERATION, 'the view type must match the pixel type')
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(2))
  t.equal(gl.getError(), gl.INVALID_OPERATION, 'the view must be large enough')
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, data, 13)
  t.equal(gl.getError(), gl.INVALID_OPERATION, 'srcOffset past the end')
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, data)
  t.equal(gl.getError(), gl.NO_ERROR, 'the nine argument form still works')
  t.throws(function () {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, data.buffer, 4)
  }, TypeError)

  destroy(gl)
  t.end()
})

tape('WebGL2 texture parameters', function (t) {
  const gl = createGL(t)

  const texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_3D, texture)
  gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_BASE_LEVEL, 1)
  gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAX_LEVEL, 5)
  gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_COMPARE_MODE, gl.COMPARE_REF_TO_TEXTURE)
  gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_COMPARE_FUNC, gl.GREATER)
  gl.texParameterf(gl.TEXTURE_3D, gl.TEXTURE_MIN_LOD, -2.5)
  gl.texParameterf(gl.TEXTURE_3D, gl.TEXTURE_MAX_LOD, 3.5)
  t.equal(gl.getError(), gl.NO_ERROR)
  t.equal(gl.getTexParameter(gl.TEXTURE_3D, gl.TEXTURE_WRAP_R), gl.CLAMP_TO_EDGE)
  t.equal(gl.getTexParameter(gl.TEXTURE_3D, gl.TEXTURE_BASE_LEVEL), 1)
  t.equal(gl.getTexParameter(gl.TEXTURE_3D, gl.TEXTURE_MAX_LEVEL), 5)
  t.equal(gl.getTexParameter(gl.TEXTURE_3D, gl.TEXTURE_COMPARE_MODE), gl.COMPARE_REF_TO_TEXTURE)
  t.equal(gl.getTexParameter(gl.TEXTURE_3D, gl.TEXTURE_COMPARE_FUNC), gl.GREATER)
  t.equal(gl.getTexParameter(gl.TEXTURE_3D, gl.TEXTURE_MIN_LOD), -2.5)
  t.equal(gl.getTexParameter(gl.TEXTURE_3D, gl.TEXTURE_MAX_LOD), 3.5)
  t.equal(gl.getTexParameter(gl.TEXTURE_3D, gl.TEXTURE_WRAP_S), gl.REPEAT, 'WebGL1 parameters still work')
  t.equal(gl.getError(), gl.NO_ERROR)
  gl.getTexParameter(gl.TEXTURE_3D, 0x1234)
  t.equal(gl.getError(), gl.INVALID_ENUM, 'unknown parameter')
  gl.bindTexture(gl.TEXTURE_3D, null)
  gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_R, gl.REPEAT)
  t.equal(gl.getError(), gl.INVALID_OPERATION, 'no texture bound')
  destroy(gl)

  const gl1 = createContext(8, 8)
  gl1.bindTexture(gl1.TEXTURE_2D, gl1.createTexture())
  gl1.texParameteri(gl1.TEXTURE_2D, gl.TEXTURE_WRAP_R, gl1.CLAMP_TO_EDGE)
  t.equal(gl1.getError(), gl1.INVALID_ENUM, 'WebGL1 rejects WebGL2 parameters')
  destroy(gl1)

  t.end()
})

tape('deleteTexture unbinds 3D and array textures', function (t) {
  const gl = createGL(t)

  const texture = gl.createTexture()
  const array = gl.createTexture()
  gl.activeTexture(gl.TEXTURE1)
  gl.bindTexture(gl.TEXTURE_3D, texture)
  gl.bindTexture(gl.TEXTURE_2D_ARRAY, array)
  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_3D, texture)
  gl.deleteTexture(texture)
  t.equal(gl.getError(), gl.NO_ERROR)
  t.equal(gl.getParameter(gl.ACTIVE_TEXTURE), gl.TEXTURE0, 'the active unit is restored')
  t.equal(gl.getParameter(gl.TEXTURE_BINDING_3D), null)
  gl.activeTexture(gl.TEXTURE1)
  t.equal(gl.getParameter(gl.TEXTURE_BINDING_3D), null, 'unbound from every unit')
  t.equal(gl.getParameter(gl.TEXTURE_BINDING_2D_ARRAY), array)
  gl.deleteTexture(array)
  t.equal(gl.getParameter(gl.TEXTURE_BINDING_2D_ARRAY), null)
  t.equal(gl.getParameter(gl.ACTIVE_TEXTURE), gl.TEXTURE1)
  t.equal(gl.getError(), gl.NO_ERROR)

  destroy(gl)
  t.end()
})

tape('image sources with explicit dimensions', function (t) {
  const gl = createContext(8, 8, { createWebGL2Context: true })
  const image = {
    width: 2,
    height: 2,
    data: new Uint8ClampedArray([
      255, 0, 0, 255, 0, 255, 0, 255,
      0, 0, 255, 255, 255, 255, 255, 255
    ])
  }
  const texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 3, 3, 0, gl.RGBA, gl.UNSIGNED_BYTE, image)
  t.equal(gl.getError(), gl.INVALID_OPERATION, 'dimensions larger than the image')

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 2, 0, gl.RGBA, gl.UNSIGNED_BYTE, image)
  t.equal(gl.getError(), gl.NO_ERROR, 'dimensions smaller than the image')
  const framebuffer = gl.createFramebuffer()
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)
  t.equal(gl.checkFramebufferStatus(gl.FRAMEBUFFER), gl.FRAMEBUFFER_COMPLETE)
  const pixels = new Uint8Array(8)
  gl.readPixels(0, 0, 1, 2, gl.RGBA, gl.UNSIGNED_BYTE, pixels)
  t.deepEqual(Array.from(pixels), [255, 0, 0, 255, 0, 0, 255, 255], 'left column of the image')

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 2, 2, 0, gl.RGBA, gl.UNSIGNED_BYTE, image)
  t.equal(gl.getError(), gl.NO_ERROR)
  gl.texSubImage2D(gl.TEXTURE_2D, 0, 1, 1, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, image)
  t.equal(gl.getError(), gl.NO_ERROR, 'texSubImage2D crops as well')
  const all = new Uint8Array(16)
  gl.readPixels(0, 0, 2, 2, gl.RGBA, gl.UNSIGNED_BYTE, all)
  t.deepEqual(Array.from(all.subarray(12)), [255, 0, 0, 255], 'top-left pixel written at offset')

  t.throws(function () {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 2, 2, 0, gl.RGBA, gl.UNSIGNED_BYTE, { nothing: true })
  }, TypeError)
  t.throws(function () {
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 2, 2, gl.RGBA, gl.UNSIGNED_BYTE, { nothing: true })
  }, TypeError)

  const gl1 = createContext(8, 8)
  gl1.bindTexture(gl1.TEXTURE_2D, gl1.createTexture())
  t.throws(function () {
    gl1.texImage2D(gl1.TEXTURE_2D, 0, gl1.RGBA, 2, 2, 0, gl1.RGBA, gl1.UNSIGNED_BYTE, image)
  }, TypeError, 'WebGL 1 has no such overload')
  t.throws(function () {
    gl1.texSubImage2D(gl1.TEXTURE_2D, 0, 0, 0, 2, 2, gl1.RGBA, gl1.UNSIGNED_BYTE, image)
  }, TypeError)
  destroy(gl1)

  destroy(gl)
  t.end()
})

function imageOf (width, height, pixel) {
  const data = new Uint8ClampedArray(width * height * 4)
  for (let y = 0; y < height; ++y) {
    for (let x = 0; x < width; ++x) {
      data.set(pixel(x, y), (y * width + x) * 4)
    }
  }
  return { width, height, data }
}

function readTexture (gl, texture, width, height, type) {
  const framebuffer = gl.createFramebuffer()
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)
  const pixels = type === gl.FLOAT ? new Float32Array(width * height * 4) : new Uint8Array(width * height * 4)
  gl.readPixels(0, 0, width, height, gl.RGBA, type, pixels)
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  gl.deleteFramebuffer(framebuffer)
  return Array.from(pixels)
}

tape('image sources are converted to the requested format and type', function (t) {
  const gl = createGL(t)
  gl.getExtension('EXT_color_buffer_float')
  const image = imageOf(2, 1, (x) => [x * 255, 0, 51, 255])
  const cases = [
    [gl.RGBA32F, gl.RGBA, gl.FLOAT],
    [gl.RGBA16F, gl.RGBA, gl.HALF_FLOAT],
    [gl.RGB8, gl.RGB, gl.UNSIGNED_BYTE],
    [gl.RGB565, gl.RGB, gl.UNSIGNED_SHORT_5_6_5],
    [gl.RGBA4, gl.RGBA, gl.UNSIGNED_SHORT_4_4_4_4],
    [gl.RGB5_A1, gl.RGBA, gl.UNSIGNED_SHORT_5_5_5_1],
    [gl.R11F_G11F_B10F, gl.RGB, gl.UNSIGNED_INT_10F_11F_11F_REV],
    [gl.RGB9_E5, gl.RGB, gl.HALF_FLOAT],
    [gl.RGB10_A2, gl.RGBA, gl.UNSIGNED_INT_2_10_10_10_REV],
    [gl.RG8, gl.RG, gl.UNSIGNED_BYTE],
    [gl.R16F, gl.RED, gl.HALF_FLOAT],
    [gl.RGBA8UI, gl.RGBA_INTEGER, gl.UNSIGNED_BYTE],
    [gl.LUMINANCE_ALPHA, gl.LUMINANCE_ALPHA, gl.UNSIGNED_BYTE]
  ]
  for (const [internalFormat, format, type] of cases) {
    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, 2, 1, 0, format, type, image)
    t.equal(gl.getError(), gl.NO_ERROR, 'upload 0x' + internalFormat.toString(16))
  }

  const float = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, float)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, 2, 1, 0, gl.RGBA, gl.FLOAT, image)
  t.deepEqual(readTexture(gl, float, 2, 1, gl.FLOAT).map((v) => Math.round(v * 255)), [0, 0, 51, 255, 255, 0, 51, 255], 'float values')

  const half = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, half)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, 2, 1, 0, gl.RGBA, gl.HALF_FLOAT, image)
  t.deepEqual(readTexture(gl, half, 2, 1, gl.FLOAT).map((v) => Math.round(v * 255)), [0, 0, 51, 255, 255, 0, 51, 255], 'half float values')

  const packed = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, packed)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB10_A2, 2, 1, 0, gl.RGBA, gl.UNSIGNED_INT_2_10_10_10_REV, image)
  t.deepEqual(readTexture(gl, packed, 2, 1, gl.UNSIGNED_BYTE), [0, 0, 51, 255, 255, 0, 51, 255], '2_10_10_10 values')

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB9_E5, 2, 1, 0, gl.RGB, gl.UNSIGNED_INT_5_9_9_9_REV, image)
  t.equal(gl.getError(), gl.INVALID_OPERATION, 'unsupported image source type')
  destroy(gl)
  t.end()
})

tape('image sources ignore alignment and honor skip parameters', function (t) {
  const gl = createGL(t)
  const image = imageOf(3, 3, (x, y) => [x * 100, y * 100, 0, 255])
  const texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, 3, 3, 0, gl.RED, gl.UNSIGNED_BYTE, image)
  t.equal(gl.getError(), gl.NO_ERROR, 'UNPACK_ALIGNMENT is ignored')

  gl.pixelStorei(gl.UNPACK_SKIP_PIXELS, 1)
  gl.pixelStorei(gl.UNPACK_SKIP_ROWS, 1)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 2, 2, 0, gl.RGBA, gl.UNSIGNED_BYTE, image)
  t.equal(gl.getError(), gl.NO_ERROR)
  t.deepEqual(readTexture(gl, texture, 2, 1, gl.UNSIGNED_BYTE), [100, 100, 0, 255, 200, 100, 0, 255], 'sub-rectangle selected by the skip parameters')
  t.equal(gl.getParameter(gl.UNPACK_SKIP_PIXELS), 1, 'unpack state is preserved')
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 3, 3, 0, gl.RGBA, gl.UNSIGNED_BYTE, image)
  t.equal(gl.getError(), gl.INVALID_OPERATION, 'sub-rectangle outside the image')
  gl.pixelStorei(gl.UNPACK_SKIP_PIXELS, 0)
  gl.pixelStorei(gl.UNPACK_SKIP_ROWS, 0)

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true)
  const translucent = imageOf(1, 2, (x, y) => y === 0 ? [200, 0, 0, 128] : [0, 200, 0, 255])
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 2, 0, gl.RGBA, gl.UNSIGNED_BYTE, translucent)
  t.deepEqual(readTexture(gl, texture, 1, 2, gl.UNSIGNED_BYTE), [0, 200, 0, 255, 100, 0, 0, 128], 'flipped and premultiplied')
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false)

  const volume = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_3D, volume)
  gl.texImage3D(gl.TEXTURE_3D, 0, gl.RGBA8, 3, 1, 3, 0, gl.RGBA, gl.UNSIGNED_BYTE, image)
  t.equal(gl.getError(), gl.NO_ERROR, 'texImage3D accepts image sources')
  gl.texSubImage3D(gl.TEXTURE_3D, 0, 0, 0, 0, 3, 1, 3, gl.RGBA, gl.UNSIGNED_BYTE, image)
  t.equal(gl.getError(), gl.NO_ERROR, 'texSubImage3D accepts image sources')
  gl.texImage3D(gl.TEXTURE_3D, 0, gl.RGBA8, 3, 1, 4, 0, gl.RGBA, gl.UNSIGNED_BYTE, image)
  t.equal(gl.getError(), gl.INVALID_OPERATION, 'not enough rows for every slice')
  destroy(gl)
  t.end()
})

tape('image sources are flipped as a whole before the sub-rectangle is selected', function (t) {
  const gl = createGL(t)
  const image = imageOf(1, 4, (x, y) => [y * 10, 0, 0, 255])
  const texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
  gl.pixelStorei(gl.UNPACK_SKIP_ROWS, 1)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 2, 0, gl.RGBA, gl.UNSIGNED_BYTE, image)
  t.equal(gl.getError(), gl.NO_ERROR)
  t.deepEqual(readTexture(gl, texture, 1, 2, gl.UNSIGNED_BYTE).filter((_, i) => i % 4 === 0), [20, 10], 'skip rows count from the bottom')
  gl.pixelStorei(gl.UNPACK_SKIP_ROWS, 0)

  const volume = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_3D, volume)
  gl.texImage3D(gl.TEXTURE_3D, 0, gl.RGBA8, 1, 2, 2, 0, gl.RGBA, gl.UNSIGNED_BYTE, image)
  t.equal(gl.getError(), gl.NO_ERROR)
  const framebuffer = gl.createFramebuffer()
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
  const slices = []
  for (let layer = 0; layer < 2; ++layer) {
    gl.framebufferTextureLayer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, volume, 0, layer)
    const pixels = new Uint8Array(8)
    gl.readPixels(0, 0, 1, 2, gl.RGBA, gl.UNSIGNED_BYTE, pixels)
    slices.push([pixels[0], pixels[4]])
  }
  t.deepEqual(slices, [[30, 20], [10, 0]], 'the whole volume is flipped')
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)

  gl.texImage3D(gl.TEXTURE_3D, 0, gl.RGBA8, 1, 2, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, image)
  t.equal(gl.getError(), gl.INVALID_OPERATION, 'depth must be at least 1')
  destroy(gl)
  t.end()
})

tape('image sources honor UNPACK_SKIP_IMAGES and UNPACK_IMAGE_HEIGHT in 3D uploads', function (t) {
  const gl = createGL(t)
  const image = imageOf(1, 4, (x, y) => [(y + 1) * 10, 0, 0, 255])
  const volume = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_3D, volume)
  const framebuffer = gl.createFramebuffer()
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
  const readSlices = (count) => {
    const slices = []
    for (let layer = 0; layer < count; ++layer) {
      gl.framebufferTextureLayer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, volume, 0, layer)
      const pixels = new Uint8Array(4)
      gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels)
      slices.push(pixels[0])
    }
    return slices
  }

  gl.pixelStorei(gl.UNPACK_IMAGE_HEIGHT, 1)
  gl.pixelStorei(gl.UNPACK_SKIP_IMAGES, 2)
  gl.texImage3D(gl.TEXTURE_3D, 0, gl.RGBA8, 1, 1, 2, 0, gl.RGBA, gl.UNSIGNED_BYTE, image)
  t.equal(gl.getError(), gl.NO_ERROR)
  t.deepEqual(readSlices(2), [30, 40], 'skipped images are not uploaded')
  gl.texSubImage3D(gl.TEXTURE_3D, 0, 0, 0, 1, 1, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, image)
  t.equal(gl.getError(), gl.NO_ERROR)
  t.deepEqual(readSlices(2), [30, 30], 'texSubImage3D skips images too')

  gl.pixelStorei(gl.UNPACK_SKIP_IMAGES, 3)
  gl.texImage3D(gl.TEXTURE_3D, 0, gl.RGBA8, 1, 1, 2, 0, gl.RGBA, gl.UNSIGNED_BYTE, image)
  t.equal(gl.getError(), gl.INVALID_OPERATION, 'skipped images count towards the image size')
  gl.pixelStorei(gl.UNPACK_SKIP_IMAGES, 0)

  gl.texImage3D(gl.TEXTURE_3D, 0, gl.RGBA8, 1, 2, 2, 0, gl.RGBA, gl.UNSIGNED_BYTE, image)
  t.equal(gl.getError(), gl.INVALID_OPERATION, 'UNPACK_IMAGE_HEIGHT must hold the rows of an image')
  gl.pixelStorei(gl.UNPACK_IMAGE_HEIGHT, 0)

  gl.pixelStorei(gl.UNPACK_SKIP_IMAGES, 1)
  gl.bindTexture(gl.TEXTURE_2D, gl.createTexture())
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 4, 0, gl.RGBA, gl.UNSIGNED_BYTE, image)
  t.equal(gl.getError(), gl.NO_ERROR, '2D uploads ignore UNPACK_SKIP_IMAGES')
  gl.pixelStorei(gl.UNPACK_SKIP_IMAGES, 0)

  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  destroy(gl)
  t.end()
})

tape('3D uploads reject a bare ArrayBuffer', function (t) {
  const gl = createGL(t)
  gl.bindTexture(gl.TEXTURE_3D, gl.createTexture())
  gl.texImage3D(gl.TEXTURE_3D, 0, gl.RGBA8, 1, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
  t.throws(() => gl.texImage3D(gl.TEXTURE_3D, 0, gl.RGBA8, 1, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new ArrayBuffer(4)), TypeError)
  t.throws(() => gl.texSubImage3D(gl.TEXTURE_3D, 0, 0, 0, 0, 1, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, new ArrayBuffer(4)), TypeError)
  destroy(gl)
  t.end()
})

tape('binding a deleted texture', function (t) {
  const gl = createGL(t)
  const texture = gl.createTexture()
  gl.deleteTexture(texture)
  gl.bindTexture(gl.TEXTURE_2D, texture)
  t.equal(gl.getError(), gl.INVALID_OPERATION)
  t.equal(gl.getParameter(gl.TEXTURE_BINDING_2D), null)
  destroy(gl)
  t.end()
})
