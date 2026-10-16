'use strict'

const tape = require('tape')
const createContext = require('../index')
const makeProgram = require('./util/make-program')
const drawTriangle = require('./util/draw-triangle')

const VERT_SRC = [
  '#version 300 es',
  'layout(location = 0) in vec2 position;',
  'layout(location = 1) in ivec4 icolor;',
  'layout(location = 2) in vec4 fcolor;',
  'flat out ivec4 vicolor;',
  'out vec4 vfcolor;',
  'void main () {',
  '  gl_Position = vec4(position, 0.0, 1.0);',
  '  vicolor = icolor;',
  '  vfcolor = fcolor;',
  '}'
].join('\n')

const INSTANCED_VERT_SRC = [
  '#version 300 es',
  'layout(location = 0) in vec2 position;',
  'layout(location = 1) in ivec4 icolor;',
  'layout(location = 2) in vec4 fcolor;',
  'flat out ivec4 vicolor;',
  'out vec4 vfcolor;',
  'void main () {',
  '  gl_Position = vec4(position + vec2(float(gl_InstanceID), 0.0), 0.0, 1.0);',
  '  vicolor = icolor;',
  '  vfcolor = fcolor;',
  '}'
].join('\n')

const FRAG_SRC = [
  '#version 300 es',
  'precision mediump float;',
  'flat in ivec4 vicolor;',
  'in vec4 vfcolor;',
  'uniform bool useInt;',
  'out vec4 fragColor;',
  'void main () {',
  '  fragColor = useInt ? vec4(vicolor) / 255.0 : vfcolor;',
  '}'
].join('\n')

function setup (t, vertSrc) {
  const gl = createContext(8, 8, { createWebGL2Context: true })
  const program = makeProgram(gl, vertSrc || VERT_SRC, FRAG_SRC)
  t.ok(gl.getProgramParameter(program, gl.LINK_STATUS), gl.getProgramInfoLog(program))
  gl.useProgram(program)
  gl.vertexAttribI4i(1, 0, 0, 0, 1)
  return { gl, program }
}

function destroy (gl) {
  gl.getExtension('STACKGL_destroy_context').destroy()
}

function readPixel (gl, x, y) {
  const pixel = new Uint8Array(4)
  gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel)
  return Array.from(pixel)
}

tape('integer vertex attribute values are remembered', function (t) {
  const gl = createContext(8, 8, { createWebGL2Context: true })

  t.ok(gl.getVertexAttrib(1, gl.CURRENT_VERTEX_ATTRIB) instanceof Float32Array, 'starts as floats')
  gl.vertexAttribI4i(1, -1, 2, -3, 4)
  let value = gl.getVertexAttrib(1, gl.CURRENT_VERTEX_ATTRIB)
  t.ok(value instanceof Int32Array)
  t.deepEqual(Array.from(value), [-1, 2, -3, 4])
  gl.vertexAttribI4uiv(1, [1, 2, 3, 4294967295])
  value = gl.getVertexAttrib(1, gl.CURRENT_VERTEX_ATTRIB)
  t.ok(value instanceof Uint32Array)
  t.deepEqual(Array.from(value), [1, 2, 3, 4294967295])
  gl.vertexAttribI4iv(1, new Int32Array([5, 6, 7, 8, 9]))
  t.deepEqual(Array.from(gl.getVertexAttrib(1, gl.CURRENT_VERTEX_ATTRIB)), [5, 6, 7, 8], 'extra values are ignored')
  gl.vertexAttribI4ui(1, 9, 8, 7, 6)
  t.deepEqual(Array.from(gl.getVertexAttrib(1, gl.CURRENT_VERTEX_ATTRIB)), [9, 8, 7, 6])
  gl.vertexAttribI4iv(1, [1, 2])
  t.equal(gl.getError(), gl.INVALID_VALUE, 'too few values')
  gl.vertexAttribI4i(gl.getParameter(gl.MAX_VERTEX_ATTRIBS), 0, 0, 0, 0)
  t.equal(gl.getError(), gl.INVALID_VALUE, 'index out of range')
  t.throws(function () {
    gl.vertexAttribI4iv(1, 5)
  }, TypeError)
  gl.vertexAttrib4f(1, 0.5, 0, 0, 1)
  value = gl.getVertexAttrib(1, gl.CURRENT_VERTEX_ATTRIB)
  t.ok(value instanceof Float32Array, 'float attribs reset the integer value')
  t.deepEqual(Array.from(value), [0.5, 0, 0, 1])

  destroy(gl)
  t.end()
})

tape('vertexAttribIPointer', function (t) {
  const { gl, program } = setup(t)
  const useInt = gl.getUniformLocation(program, 'useInt')
  gl.uniform1i(useInt, 1)

  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Int32Array([255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255]), gl.STATIC_DRAW)
  gl.enableVertexAttribArray(1)
  gl.vertexAttribIPointer(1, 4, gl.INT, 0, 0)
  t.equal(gl.getError(), gl.NO_ERROR)
  t.equal(gl.getVertexAttrib(1, gl.VERTEX_ATTRIB_ARRAY_INTEGER), true)
  t.equal(gl.getVertexAttrib(1, gl.VERTEX_ATTRIB_ARRAY_TYPE), gl.INT)
  t.equal(gl.getVertexAttrib(1, gl.VERTEX_ATTRIB_ARRAY_SIZE), 4)
  t.equal(gl.getVertexAttrib(1, gl.VERTEX_ATTRIB_ARRAY_STRIDE), 0)
  t.equal(gl.getVertexAttrib(1, gl.VERTEX_ATTRIB_ARRAY_BUFFER_BINDING), buffer)
  t.equal(gl.getVertexAttrib(1, gl.VERTEX_ATTRIB_ARRAY_NORMALIZED), false)
  t.equal(gl.getVertexAttribOffset(1, gl.VERTEX_ATTRIB_ARRAY_POINTER), 0)

  drawTriangle(gl)
  t.equal(gl.getError(), gl.NO_ERROR)
  t.deepEqual(readPixel(gl, 4, 4), [255, 0, 0, 255], 'integer attribute array')

  gl.disableVertexAttribArray(1)
  gl.vertexAttribI4i(1, 0, 255, 0, 255)
  drawTriangle(gl)
  t.deepEqual(readPixel(gl, 4, 4), [0, 255, 0, 255], 'integer attribute current value')

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.vertexAttribPointer(1, 4, gl.INT, false, 0, 0)
  t.equal(gl.getError(), gl.NO_ERROR)
  t.equal(gl.getVertexAttrib(1, gl.VERTEX_ATTRIB_ARRAY_INTEGER), false, 'vertexAttribPointer resets the integer flag')

  gl.vertexAttribIPointer(1, 4, gl.FLOAT, 0, 0)
  t.equal(gl.getError(), gl.INVALID_ENUM, 'float type')
  gl.vertexAttribIPointer(1, 4, gl.HALF_FLOAT, 0, 0)
  t.equal(gl.getError(), gl.INVALID_ENUM, 'half float type')
  gl.vertexAttribIPointer(1, 5, gl.INT, 0, 0)
  t.equal(gl.getError(), gl.INVALID_VALUE, 'bad size')
  gl.vertexAttribIPointer(1, 4, gl.INT, 256, 0)
  t.equal(gl.getError(), gl.INVALID_VALUE, 'stride too large')
  gl.vertexAttribIPointer(1, 4, gl.INT, 0, -4)
  t.equal(gl.getError(), gl.INVALID_VALUE, 'negative offset')
  gl.vertexAttribIPointer(1, 4, gl.INT, 0, 2)
  t.equal(gl.getError(), gl.INVALID_OPERATION, 'misaligned offset')
  gl.vertexAttribIPointer(1, 4, gl.INT, 6, 0)
  t.equal(gl.getError(), gl.INVALID_OPERATION, 'misaligned stride')
  gl.vertexAttribIPointer(1, 2, gl.SHORT, 2, 2)
  t.equal(gl.getError(), gl.NO_ERROR, 'short attributes')
  gl.bindBuffer(gl.ARRAY_BUFFER, null)
  gl.vertexAttribIPointer(1, 4, gl.INT, 0, 0)
  t.equal(gl.getError(), gl.NO_ERROR, 'no array buffer bound with a zero offset detaches the buffer')
  t.equal(gl.getVertexAttrib(1, gl.VERTEX_ATTRIB_ARRAY_BUFFER_BINDING), null)
  gl.vertexAttribIPointer(1, 4, gl.INT, 0, 4)
  t.equal(gl.getError(), gl.INVALID_OPERATION, 'no array buffer bound with an offset')
  gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 0, 4)
  t.equal(gl.getError(), gl.INVALID_OPERATION, 'no array buffer bound with an offset (float)')

  destroy(gl)
  t.end()
})

tape('vertexAttribPointer accepts the WebGL2 types', function (t) {
  const { gl } = setup(t)
  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Int32Array([0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1]), gl.STATIC_DRAW)

  for (const type of ['INT', 'UNSIGNED_INT', 'HALF_FLOAT', 'INT_2_10_10_10_REV', 'UNSIGNED_INT_2_10_10_10_REV']) {
    gl.vertexAttribPointer(2, 4, gl[type], false, 0, 0)
    t.equal(gl.getError(), gl.NO_ERROR, type)
    t.equal(gl.getVertexAttrib(2, gl.VERTEX_ATTRIB_ARRAY_TYPE), gl[type], type + ' reported')
  }
  gl.vertexAttribPointer(2, 3, gl.INT_2_10_10_10_REV, false, 0, 0)
  t.equal(gl.getError(), gl.INVALID_OPERATION, 'packed types need size 4')
  gl.vertexAttribPointer(2, 2, gl.HALF_FLOAT, false, 0, 1)
  t.equal(gl.getError(), gl.INVALID_OPERATION, 'half float offsets must be even')
  gl.vertexAttribPointer(2, 4, 0x1234, false, 0, 0)
  t.equal(gl.getError(), gl.INVALID_ENUM, 'unknown type')

  gl.enableVertexAttribArray(2)
  gl.vertexAttribPointer(2, 4, gl.INT, false, 0, 0)
  drawTriangle(gl)
  t.deepEqual(readPixel(gl, 4, 4), [0, 0, 255, 255], 'integer data in a float attribute')

  destroy(gl)

  const gl1 = createContext(8, 8)
  gl1.bindBuffer(gl1.ARRAY_BUFFER, gl1.createBuffer())
  gl1.vertexAttribPointer(0, 4, gl1.INT, false, 0, 0)
  t.equal(gl1.getError(), gl1.INVALID_ENUM, 'WebGL1 still rejects INT')
  destroy(gl1)

  t.end()
})

tape('vertexAttribDivisor and instanced drawing', function (t) {
  const { gl } = setup(t, INSTANCED_VERT_SRC)

  const positions = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, positions)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 0, -1, -1, 1, -1, 1, 0, -1, 0, 1]), gl.STATIC_DRAW)
  gl.enableVertexAttribArray(0)
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)

  const colors = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, colors)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([1, 0, 0, 1, 0, 1, 0, 1]), gl.STATIC_DRAW)
  gl.enableVertexAttribArray(2)
  gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 0, 0)
  gl.vertexAttribDivisor(2, 1)
  t.equal(gl.getError(), gl.NO_ERROR)
  t.equal(gl.getVertexAttrib(2, gl.VERTEX_ATTRIB_ARRAY_DIVISOR), 1)
  t.equal(gl.getVertexAttrib(0, gl.VERTEX_ATTRIB_ARRAY_DIVISOR), 0)

  gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, 2)
  t.equal(gl.getError(), gl.NO_ERROR)
  t.deepEqual(readPixel(gl, 1, 4), [255, 0, 0, 255], 'first instance')
  t.deepEqual(readPixel(gl, 6, 4), [0, 255, 0, 255], 'second instance')

  gl.clearColor(0, 0, 0, 0)
  gl.clear(gl.COLOR_BUFFER_BIT)
  const indices = gl.createBuffer()
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indices)
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 3, 4, 5]), gl.STATIC_DRAW)
  gl.drawElementsInstanced(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0, 2)
  t.equal(gl.getError(), gl.NO_ERROR)
  t.deepEqual(readPixel(gl, 1, 4), [255, 0, 0, 255], 'first instance (indexed)')
  t.deepEqual(readPixel(gl, 6, 4), [0, 255, 0, 255], 'second instance (indexed)')

  gl.clear(gl.COLOR_BUFFER_BIT)
  gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, 1)
  t.deepEqual(readPixel(gl, 6, 4), [0, 0, 0, 0], 'instance count is honored')

  gl.clear(gl.COLOR_BUFFER_BIT)
  gl.drawRangeElements(gl.TRIANGLES, 0, 5, 6, gl.UNSIGNED_SHORT, 0)
  t.equal(gl.getError(), gl.NO_ERROR)
  t.deepEqual(readPixel(gl, 1, 4), [255, 0, 0, 255], 'drawRangeElements')
  gl.drawRangeElements(gl.TRIANGLES, 5, 0, 6, gl.UNSIGNED_SHORT, 0)
  t.equal(gl.getError(), gl.INVALID_VALUE, 'end before start')

  gl.vertexAttribDivisor(gl.getParameter(gl.MAX_VERTEX_ATTRIBS), 1)
  t.equal(gl.getError(), gl.INVALID_VALUE, 'index out of range')

  const vao = gl.createVertexArray()
  gl.bindVertexArray(vao)
  t.equal(gl.getVertexAttrib(2, gl.VERTEX_ATTRIB_ARRAY_DIVISOR), 0, 'divisor is vertex array state')
  gl.bindVertexArray(null)
  t.equal(gl.getVertexAttrib(2, gl.VERTEX_ATTRIB_ARRAY_DIVISOR), 1)

  destroy(gl)
  t.end()
})
