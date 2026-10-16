'use strict'

const tape = require('tape')
const createContext = require('../index')

function createGL (t) {
  const gl = createContext(8, 8, { createWebGL2Context: true })
  t.ok(gl, 'created a WebGL2 context')
  return gl
}

function destroy (gl) {
  gl.getExtension('STACKGL_destroy_context').destroy()
}

tape('WebGL2 buffer targets', function (t) {
  const gl = createGL(t)

  const targets = [
    ['COPY_READ_BUFFER', 'COPY_READ_BUFFER_BINDING'],
    ['COPY_WRITE_BUFFER', 'COPY_WRITE_BUFFER_BINDING'],
    ['PIXEL_PACK_BUFFER', 'PIXEL_PACK_BUFFER_BINDING'],
    ['PIXEL_UNPACK_BUFFER', 'PIXEL_UNPACK_BUFFER_BINDING'],
    ['TRANSFORM_FEEDBACK_BUFFER', 'TRANSFORM_FEEDBACK_BUFFER_BINDING'],
    ['UNIFORM_BUFFER', 'UNIFORM_BUFFER_BINDING']
  ]
  for (const [target, binding] of targets) {
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl[target], buffer)
    t.equal(gl.getError(), gl.NO_ERROR, 'bind to ' + target)
    t.equal(gl.getParameter(gl[binding]), buffer, binding + ' reports the buffer')
    gl.bufferData(gl[target], 16, gl.STATIC_DRAW)
    t.equal(gl.getBufferParameter(gl[target], gl.BUFFER_SIZE), 16, 'bufferData on ' + target)
    gl.bindBuffer(gl[target], null)
    t.equal(gl.getParameter(gl[binding]), null, binding + ' cleared')
  }

  gl.bindBuffer(0x1234, gl.createBuffer())
  t.equal(gl.getError(), gl.INVALID_ENUM, 'unknown target')

  const vertex = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, vertex)
  gl.bindBuffer(gl.COPY_READ_BUFFER, vertex)
  t.equal(gl.getError(), gl.NO_ERROR, 'a vertex buffer can be a copy source')
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertex)
  t.equal(gl.getError(), gl.INVALID_OPERATION, 'but not an element array buffer')

  const index = gl.createBuffer()
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index)
  gl.bindBuffer(gl.COPY_WRITE_BUFFER, index)
  t.equal(gl.getError(), gl.NO_ERROR, 'an element array buffer can be a copy target')
  gl.bindBuffer(gl.ARRAY_BUFFER, index)
  t.equal(gl.getError(), gl.INVALID_OPERATION, 'but stays an element array buffer')
  const copied = gl.createBuffer()
  gl.bindBuffer(gl.COPY_READ_BUFFER, copied)
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, copied)
  t.equal(gl.getError(), gl.INVALID_OPERATION, 'a first bind to a copy target types the buffer as non-element')

  for (const usage of ['STREAM_READ', 'STREAM_COPY', 'STATIC_READ', 'STATIC_COPY', 'DYNAMIC_READ', 'DYNAMIC_COPY']) {
    gl.bufferData(gl.ARRAY_BUFFER, 4, gl[usage])
    t.equal(gl.getError(), gl.NO_ERROR, usage)
    t.equal(gl.getBufferParameter(gl.ARRAY_BUFFER, gl.BUFFER_USAGE), gl[usage], usage + ' reported')
  }

  destroy(gl)

  const gl1 = createContext(8, 8)
  gl1.bindBuffer(gl.COPY_READ_BUFFER, gl1.createBuffer())
  t.equal(gl1.getError(), gl1.INVALID_ENUM, 'WebGL1 rejects WebGL2 targets')
  gl1.bindBuffer(gl1.ARRAY_BUFFER, gl1.createBuffer())
  gl1.bufferData(gl1.ARRAY_BUFFER, 4, gl.STATIC_READ)
  t.equal(gl1.getError(), gl1.INVALID_ENUM, 'WebGL1 rejects WebGL2 usages')
  destroy(gl1)

  t.end()
})

tape('bufferData and bufferSubData with srcOffset and length', function (t) {
  const gl = createGL(t)
  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  const data = new Float32Array([1, 2, 3, 4, 5, 6])

  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW, 2)
  t.equal(gl.getError(), gl.NO_ERROR)
  t.equal(gl.getBufferParameter(gl.ARRAY_BUFFER, gl.BUFFER_SIZE), 16, 'srcOffset drops the head')

  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW, 1, 3)
  t.equal(gl.getBufferParameter(gl.ARRAY_BUFFER, gl.BUFFER_SIZE), 12, 'length limits the tail')
  const readback = new Float32Array(3)
  gl.getBufferSubData(gl.ARRAY_BUFFER, 0, readback)
  t.deepEqual(Array.from(readback), [2, 3, 4])

  gl.bufferSubData(gl.ARRAY_BUFFER, 4, data, 4, 2)
  t.equal(gl.getError(), gl.NO_ERROR)
  gl.getBufferSubData(gl.ARRAY_BUFFER, 0, readback)
  t.deepEqual(Array.from(readback), [2, 5, 6], 'bufferSubData honors srcOffset and length')

  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW, 7)
  t.equal(gl.getError(), gl.INVALID_VALUE, 'srcOffset past the end')
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW, 4, 3)
  t.equal(gl.getError(), gl.INVALID_VALUE, 'srcOffset + length past the end')
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, data, 5, 2)
  t.equal(gl.getError(), gl.INVALID_VALUE, 'bufferSubData range past the end')
  t.throws(function () {
    gl.bufferData(gl.ARRAY_BUFFER, data.buffer, gl.STATIC_DRAW, 1)
  }, TypeError, 'srcOffset needs a view')

  destroy(gl)
  t.end()
})

tape('copyBufferSubData', function (t) {
  const gl = createGL(t)

  const src = gl.createBuffer()
  gl.bindBuffer(gl.COPY_READ_BUFFER, src)
  gl.bufferData(gl.COPY_READ_BUFFER, new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]), gl.STATIC_DRAW)
  const dst = gl.createBuffer()
  gl.bindBuffer(gl.COPY_WRITE_BUFFER, dst)
  gl.bufferData(gl.COPY_WRITE_BUFFER, 8, gl.STATIC_DRAW)

  gl.copyBufferSubData(gl.COPY_READ_BUFFER, gl.COPY_WRITE_BUFFER, 2, 4, 4)
  t.equal(gl.getError(), gl.NO_ERROR)
  const result = new Uint8Array(8)
  gl.getBufferSubData(gl.COPY_WRITE_BUFFER, 0, result)
  t.deepEqual(Array.from(result), [0, 0, 0, 0, 3, 4, 5, 6])

  gl.copyBufferSubData(gl.COPY_READ_BUFFER, gl.COPY_WRITE_BUFFER, 6, 0, 4)
  t.equal(gl.getError(), gl.INVALID_VALUE, 'read range past the end')
  gl.copyBufferSubData(gl.COPY_READ_BUFFER, gl.COPY_WRITE_BUFFER, 0, 6, 4)
  t.equal(gl.getError(), gl.INVALID_VALUE, 'write range past the end')
  gl.copyBufferSubData(gl.COPY_READ_BUFFER, gl.COPY_WRITE_BUFFER, -1, 0, 4)
  t.equal(gl.getError(), gl.INVALID_VALUE, 'negative offset')
  gl.copyBufferSubData(gl.COPY_READ_BUFFER, 0x1234, 0, 0, 4)
  t.equal(gl.getError(), gl.INVALID_ENUM, 'bad target')

  gl.bindBuffer(gl.COPY_WRITE_BUFFER, src)
  gl.copyBufferSubData(gl.COPY_READ_BUFFER, gl.COPY_WRITE_BUFFER, 0, 2, 4)
  t.equal(gl.getError(), gl.INVALID_VALUE, 'overlapping ranges of the same buffer')
  gl.copyBufferSubData(gl.COPY_READ_BUFFER, gl.COPY_WRITE_BUFFER, 0, 4, 4)
  t.equal(gl.getError(), gl.NO_ERROR, 'disjoint ranges of the same buffer')
  gl.getBufferSubData(gl.COPY_READ_BUFFER, 0, result)
  t.deepEqual(Array.from(result), [1, 2, 3, 4, 1, 2, 3, 4])

  gl.bindBuffer(gl.COPY_WRITE_BUFFER, null)
  gl.copyBufferSubData(gl.COPY_READ_BUFFER, gl.COPY_WRITE_BUFFER, 0, 0, 4)
  t.equal(gl.getError(), gl.INVALID_OPERATION, 'nothing bound to the write target')

  const index = gl.createBuffer()
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index)
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, 8, gl.STATIC_DRAW)
  gl.copyBufferSubData(gl.COPY_READ_BUFFER, gl.ELEMENT_ARRAY_BUFFER, 0, 0, 4)
  t.equal(gl.getError(), gl.INVALID_OPERATION, 'vertex data cannot be copied into an element array buffer')

  destroy(gl)
  t.end()
})

tape('getBufferSubData', function (t) {
  const gl = createGL(t)
  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([1, 2, 3, 4]), gl.STATIC_DRAW)

  const dst = new Float32Array(2)
  gl.getBufferSubData(gl.ARRAY_BUFFER, 0, dst, 5)
  t.equal(gl.getError(), gl.INVALID_VALUE, 'dstOffset past the end')
  gl.getBufferSubData(gl.ARRAY_BUFFER, 0, dst, 1, 2)
  t.equal(gl.getError(), gl.INVALID_VALUE, 'dstOffset + length past the end')
  gl.getBufferSubData(gl.ARRAY_BUFFER, 12, dst)
  t.equal(gl.getError(), gl.INVALID_VALUE, 'read past the end of the buffer')
  gl.getBufferSubData(gl.ARRAY_BUFFER, 8, dst)
  t.equal(gl.getError(), gl.NO_ERROR, 'valid read')
  t.deepEqual(Array.from(dst), [3, 4])

  const all = new Float32Array(6)
  gl.getBufferSubData(gl.ARRAY_BUFFER, 4, all, 1, 3)
  t.deepEqual(Array.from(all), [0, 2, 3, 4, 0, 0], 'dstOffset and length')
  const view = new Uint8Array(new ArrayBuffer(12), 4, 8)
  gl.getBufferSubData(gl.ARRAY_BUFFER, 0, view)
  t.deepEqual(Array.from(new Float32Array(view.buffer, 4, 2)), [1, 2], 'byte offset of the view is honored')

  gl.bindBuffer(gl.ARRAY_BUFFER, null)
  gl.getBufferSubData(gl.ARRAY_BUFFER, 0, dst)
  t.equal(gl.getError(), gl.INVALID_OPERATION, 'nothing bound')
  gl.getBufferSubData(0x1234, 0, dst)
  t.equal(gl.getError(), gl.INVALID_ENUM, 'bad target')
  t.throws(function () {
    gl.getBufferSubData(gl.ARRAY_BUFFER, 0, [1, 2])
  }, TypeError, 'destination must be a view')

  destroy(gl)
  t.end()
})

tape('indexed buffer bindings', function (t) {
  const gl = createGL(t)
  const alignment = gl.getParameter(gl.UNIFORM_BUFFER_OFFSET_ALIGNMENT)
  const max = gl.getParameter(gl.MAX_UNIFORM_BUFFER_BINDINGS)
  t.ok(max > 0, 'there are uniform buffer binding points')

  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.UNIFORM_BUFFER, buffer)
  gl.bufferData(gl.UNIFORM_BUFFER, alignment * 4, gl.DYNAMIC_DRAW)
  gl.bindBuffer(gl.UNIFORM_BUFFER, null)

  gl.bindBufferBase(gl.UNIFORM_BUFFER, 1, buffer)
  t.equal(gl.getError(), gl.NO_ERROR)
  t.equal(gl.getIndexedParameter(gl.UNIFORM_BUFFER_BINDING, 1), buffer, 'indexed binding')
  t.equal(gl.getIndexedParameter(gl.UNIFORM_BUFFER_BINDING, 0), null, 'other points stay empty')
  t.equal(gl.getParameter(gl.UNIFORM_BUFFER_BINDING), buffer, 'bindBufferBase also sets the generic binding')
  t.equal(gl.getIndexedParameter(gl.UNIFORM_BUFFER_START, 1), 0)
  t.equal(gl.getIndexedParameter(gl.UNIFORM_BUFFER_SIZE, 1), 0)

  gl.bindBufferRange(gl.UNIFORM_BUFFER, 2, buffer, alignment, alignment * 2)
  t.equal(gl.getError(), gl.NO_ERROR)
  t.equal(gl.getIndexedParameter(gl.UNIFORM_BUFFER_BINDING, 2), buffer)
  t.equal(gl.getIndexedParameter(gl.UNIFORM_BUFFER_START, 2), alignment)
  t.equal(gl.getIndexedParameter(gl.UNIFORM_BUFFER_SIZE, 2), alignment * 2)

  gl.bindBufferRange(gl.UNIFORM_BUFFER, 2, buffer, 1, alignment)
  t.equal(gl.getError(), gl.INVALID_VALUE, 'offset must respect the alignment')
  gl.bindBufferRange(gl.UNIFORM_BUFFER, 2, buffer, 0, 0)
  t.equal(gl.getError(), gl.INVALID_VALUE, 'size must be positive')
  gl.bindBufferBase(gl.UNIFORM_BUFFER, max, buffer)
  t.equal(gl.getError(), gl.INVALID_VALUE, 'index out of range')
  gl.bindBufferBase(gl.ARRAY_BUFFER, 0, buffer)
  t.equal(gl.getError(), gl.INVALID_ENUM, 'not an indexed target')
  gl.getIndexedParameter(gl.ARRAY_BUFFER_BINDING, 0)
  t.equal(gl.getError(), gl.INVALID_ENUM, 'not an indexed parameter')
  gl.getIndexedParameter(gl.UNIFORM_BUFFER_BINDING, max)
  t.equal(gl.getError(), gl.INVALID_VALUE, 'query index out of range')

  gl.bindBufferBase(gl.UNIFORM_BUFFER, 1, null)
  t.equal(gl.getIndexedParameter(gl.UNIFORM_BUFFER_BINDING, 1), null, 'unbound')

  gl.deleteBuffer(buffer)
  t.equal(gl.getIndexedParameter(gl.UNIFORM_BUFFER_BINDING, 2), null, 'deleting the buffer clears the indexed binding')
  t.equal(gl.getParameter(gl.UNIFORM_BUFFER_BINDING), null, 'and the generic one')
  t.equal(gl.getError(), gl.NO_ERROR)

  const indexed = gl.createBuffer()
  gl.bindBufferBase(gl.UNIFORM_BUFFER, 0, indexed)
  const generic = gl.createBuffer()
  gl.bindBuffer(gl.UNIFORM_BUFFER, generic)
  gl.deleteBuffer(indexed)
  t.equal(gl.getIndexedParameter(gl.UNIFORM_BUFFER_BINDING, 0), null, 'deleting an indexed buffer clears its binding point')
  t.equal(gl.getParameter(gl.UNIFORM_BUFFER_BINDING), generic, 'but keeps another buffer on the generic binding')
  t.equal(gl.getError(), gl.NO_ERROR)
  gl.deleteBuffer(generic)

  destroy(gl)
  t.end()
})

tape('pixel pack and unpack buffers', function (t) {
  const gl = createGL(t)

  gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, 0)
  t.equal(gl.getError(), gl.INVALID_OPERATION, 'offset without a pack buffer')
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, 0)
  t.equal(gl.getError(), gl.INVALID_OPERATION, 'offset without an unpack buffer')

  gl.clearColor(1, 0, 0, 1)
  gl.clear(gl.COLOR_BUFFER_BIT)
  const pack = gl.createBuffer()
  gl.bindBuffer(gl.PIXEL_PACK_BUFFER, pack)
  gl.bufferData(gl.PIXEL_PACK_BUFFER, 8, gl.STREAM_READ)
  gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4))
  t.equal(gl.getError(), gl.INVALID_OPERATION, 'view with a pack buffer bound')
  gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, 4)
  t.equal(gl.getError(), gl.NO_ERROR, 'read into the pack buffer')
  const packed = new Uint8Array(8)
  gl.getBufferSubData(gl.PIXEL_PACK_BUFFER, 0, packed)
  t.deepEqual(Array.from(packed), [0, 0, 0, 0, 255, 0, 0, 255], 'pixels land at the offset')
  gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null)

  const unpack = gl.createBuffer()
  gl.bindBuffer(gl.PIXEL_UNPACK_BUFFER, unpack)
  gl.bufferData(gl.PIXEL_UNPACK_BUFFER, new Uint8Array([9, 9, 9, 9, 0, 0, 255, 255]), gl.STATIC_DRAW)
  const texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4))
  t.equal(gl.getError(), gl.INVALID_OPERATION, 'view with an unpack buffer bound')
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, 4)
  t.equal(gl.getError(), gl.NO_ERROR, 'upload from the unpack buffer')
  gl.bindBuffer(gl.PIXEL_UNPACK_BUFFER, null)

  const framebuffer = gl.createFramebuffer()
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)
  const pixel = new Uint8Array(4)
  gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel)
  t.deepEqual(Array.from(pixel), [0, 0, 255, 255], 'texture holds the buffer contents')

  destroy(gl)
  t.end()
})
