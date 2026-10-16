'use strict'

const tape = require('tape')
const createContext = require('../index')
const makeProgram = require('./util/make-program')
const drawTriangle = require('./util/draw-triangle')

const VERT_SRC = [
  '#version 300 es',
  'layout(location = 0) in vec2 position;',
  'uniform uint u1;',
  'uniform uvec2 u2;',
  'uniform uvec3 u3;',
  'uniform uvec4 u4;',
  'uniform uint ua[3];',
  'uniform float fa[4];',
  'uniform mat2 m2;',
  'uniform mat3 m3;',
  'uniform mat4 m4;',
  'uniform mat2x3 m23;',
  'uniform mat3x2 m32;',
  'uniform mat2x4 m24;',
  'uniform mat4x2 m42;',
  'uniform mat3x4 m34;',
  'uniform mat4x3 m43;',
  'void main () {',
  '  float s = float(u1 + u2.x + u3.x + u4.x + ua[0] + ua[1] + ua[2]);',
  '  s += fa[0] + fa[1] + fa[2] + fa[3];',
  '  s += m2[0][0] + m3[0][0] + m4[0][0] + m23[0][0] + m32[0][0] + m24[0][0] + m42[0][0] + m34[0][0] + m43[0][0];',
  '  gl_Position = vec4(position, 0.0, 1.0);',
  '  gl_PointSize = s;',
  '}'
].join('\n')

const FRAG_SRC = [
  '#version 300 es',
  'precision mediump float;',
  'out vec4 fragColor;',
  'void main () {',
  '  fragColor = vec4(1.0);',
  '}'
].join('\n')

const BLOCK_SRC = [
  'layout(std140) uniform Block {',
  '  vec4 color;',
  '  float scale[2];',
  '  mat2 m;',
  '};'
].join('\n')

const BLOCK_VERT_SRC = [
  '#version 300 es',
  'layout(location = 0) in vec2 position;',
  BLOCK_SRC,
  'void main () {',
  '  gl_Position = vec4(position * scale[0] * m[0][0], 0.0, 1.0);',
  '}'
].join('\n')

const BLOCK_FRAG_SRC = [
  '#version 300 es',
  'precision highp float;',
  BLOCK_SRC,
  'out vec4 fragColor;',
  'void main () {',
  '  fragColor = color * scale[1];',
  '}'
].join('\n')

function setup (t) {
  const gl = createContext(8, 8, { createWebGL2Context: true })
  const program = makeProgram(gl, VERT_SRC, FRAG_SRC)
  t.ok(gl.getProgramParameter(program, gl.LINK_STATUS), gl.getProgramInfoLog(program))
  gl.useProgram(program)
  const loc = (name) => gl.getUniformLocation(program, name)
  return { gl, program, loc }
}

function destroy (gl) {
  gl.getExtension('STACKGL_destroy_context').destroy()
}

tape('unsigned integer uniforms', function (t) {
  const { gl, program, loc } = setup(t)

  gl.uniform1ui(loc('u1'), 7)
  gl.uniform2ui(loc('u2'), 1, 2)
  gl.uniform3ui(loc('u3'), 3, 4, 5)
  gl.uniform4ui(loc('u4'), 6, 7, 8, 4294967295)
  t.equal(gl.getError(), gl.NO_ERROR, 'scalar setters')
  t.equal(gl.getUniform(program, loc('u1')), 7)
  t.deepEqual(Array.from(gl.getUniform(program, loc('u2'))), [1, 2])
  t.deepEqual(Array.from(gl.getUniform(program, loc('u3'))), [3, 4, 5])
  t.deepEqual(Array.from(gl.getUniform(program, loc('u4'))), [6, 7, 8, 4294967295], 'full 32-bit range')
  t.ok(gl.getUniform(program, loc('u2')) instanceof Uint32Array, 'getUniform returns Uint32Array')

  gl.uniform1uiv(loc('u1'), new Uint32Array([9]))
  gl.uniform2uiv(loc('u2'), [10, 11])
  gl.uniform3uiv(loc('u3'), new Float32Array([12, 13, 14]))
  gl.uniform4uiv(loc('u4'), new Uint32Array([0, 15, 16, 17, 18, 0]), 1, 4)
  t.equal(gl.getError(), gl.NO_ERROR, 'vector setters')
  t.equal(gl.getUniform(program, loc('u1')), 9)
  t.deepEqual(Array.from(gl.getUniform(program, loc('u2'))), [10, 11], 'plain arrays')
  t.deepEqual(Array.from(gl.getUniform(program, loc('u3'))), [12, 13, 14], 'other typed arrays are converted')
  t.deepEqual(Array.from(gl.getUniform(program, loc('u4'))), [15, 16, 17, 18], 'srcOffset and srcLength')

  gl.uniform1uiv(loc('ua[0]'), [20, 21, 22])
  t.equal(gl.getError(), gl.NO_ERROR, 'array uniform')
  t.equal(gl.getUniform(program, loc('ua[0]')), 20)
  t.equal(gl.getUniform(program, loc('ua[1]')), 21)
  t.equal(gl.getUniform(program, loc('ua[2]')), 22)

  gl.uniform2uiv(loc('u2'), new Uint32Array([1, 2, 3]))
  t.equal(gl.getError(), gl.INVALID_VALUE, 'length must be a multiple of the vector size')
  gl.uniform1uiv(loc('u1'), [1, 2])
  t.equal(gl.getError(), gl.INVALID_OPERATION, 'too many values for a scalar')
  gl.uniform1uiv(loc('u1'), [1, 2], 3)
  t.equal(gl.getError(), gl.INVALID_VALUE, 'srcOffset past the end')
  gl.uniform1uiv(loc('u1'), [1, 2], 1, 2)
  t.equal(gl.getError(), gl.INVALID_VALUE, 'srcLength past the end')
  gl.uniform1ui(null, 1)
  gl.uniform1uiv(null, [1])
  t.equal(gl.getError(), gl.NO_ERROR, 'null locations are ignored')
  t.throws(function () {
    gl.uniform1uiv(loc('u1'), 5)
  }, TypeError, 'value must be an array')
  t.throws(function () {
    gl.uniform1ui(5, 1)
  }, TypeError, 'location must be a WebGLUniformLocation')

  const other = makeProgram(gl, VERT_SRC, FRAG_SRC)
  const otherLoc = gl.getUniformLocation(other, 'u1')
  gl.uniform1ui(otherLoc, 1)
  t.equal(gl.getError(), gl.INVALID_OPERATION, 'location of another program')
  gl.uniform1uiv(otherLoc, [1])
  t.equal(gl.getError(), gl.INVALID_OPERATION, 'location of another program (vector)')

  gl.uniform1ui(loc('fa[0]'), 1)
  t.equal(gl.getError(), gl.INVALID_OPERATION, 'type mismatch')

  destroy(gl)
  t.end()
})

tape('float and integer uniform vectors with srcOffset and srcLength', function (t) {
  const { gl, program, loc } = setup(t)

  gl.uniform1fv(loc('fa[0]'), [0, 1, 2, 3, 4, 0], 1, 4)
  t.equal(gl.getError(), gl.NO_ERROR)
  t.equal(gl.getUniform(program, loc('fa[0]')), 1)
  t.equal(gl.getUniform(program, loc('fa[3]')), 4)
  gl.uniform1fv(loc('fa[0]'), new Float32Array([5, 6]), 1)
  t.equal(gl.getUniform(program, loc('fa[0]')), 6, 'srcOffset without srcLength')
  gl.uniform1fv(loc('fa[0]'), [1, 2], 3)
  t.equal(gl.getError(), gl.INVALID_VALUE, 'srcOffset past the end')
  gl.uniform1fv(loc('fa[0]'), [7, 8, 9, 10])
  t.equal(gl.getError(), gl.NO_ERROR, 'the WebGL1 form still works')
  t.equal(gl.getUniform(program, loc('fa[2]')), 9)

  destroy(gl)
  t.end()
})

tape('non-square matrix uniforms', function (t) {
  const { gl, program, loc } = setup(t)

  const matrices = [
    ['uniformMatrix2x3fv', 'm23', 6, [1, 3, 5, 2, 4, 6]],
    ['uniformMatrix3x2fv', 'm32', 6, [1, 4, 2, 5, 3, 6]],
    ['uniformMatrix2x4fv', 'm24', 8, [1, 3, 5, 7, 2, 4, 6, 8]],
    ['uniformMatrix4x2fv', 'm42', 8, [1, 5, 2, 6, 3, 7, 4, 8]],
    ['uniformMatrix3x4fv', 'm34', 12, [1, 4, 7, 10, 2, 5, 8, 11, 3, 6, 9, 12]],
    ['uniformMatrix4x3fv', 'm43', 12, [1, 5, 9, 2, 6, 10, 3, 7, 11, 4, 8, 12]]
  ]
  for (const [method, name, size, transposed] of matrices) {
    const data = []
    for (let i = 1; i <= size; ++i) {
      data.push(i)
    }
    gl[method](loc(name), false, data)
    t.equal(gl.getError(), gl.NO_ERROR, method)
    t.deepEqual(Array.from(gl.getUniform(program, loc(name))), data, method + ' column-major')
    gl[method](loc(name), true, new Float64Array(data))
    t.equal(gl.getError(), gl.NO_ERROR, method + ' transposed')
    t.deepEqual(Array.from(gl.getUniform(program, loc(name))), transposed, method + ' transposes')
    gl[method](loc(name), false, [0].concat(data), 1)
    t.deepEqual(Array.from(gl.getUniform(program, loc(name))), data, method + ' srcOffset')
    gl[method](loc(name), false, data.concat([0]), 0, size)
    t.deepEqual(Array.from(gl.getUniform(program, loc(name))), data, method + ' srcLength')
    gl[method](loc(name), false, data.slice(1))
    t.equal(gl.getError(), gl.INVALID_VALUE, method + ' wrong length')
    gl[method](loc(name), false, data, size)
    t.equal(gl.getError(), gl.INVALID_VALUE, method + ' srcOffset leaves nothing')
    gl[method](loc(name), false, data.concat(data))
    t.equal(gl.getError(), gl.INVALID_OPERATION, method + ' several matrices for a non-array uniform')
    gl[method](null, false, data)
    t.equal(gl.getError(), gl.NO_ERROR, method + ' null location')
  }

  destroy(gl)
  t.end()
})

tape('square matrix uniforms accept transpose in WebGL2', function (t) {
  const { gl, program, loc } = setup(t)

  gl.uniformMatrix2fv(loc('m2'), true, [1, 2, 3, 4])
  t.equal(gl.getError(), gl.NO_ERROR)
  t.deepEqual(Array.from(gl.getUniform(program, loc('m2'))), [1, 3, 2, 4])
  gl.uniformMatrix3fv(loc('m3'), false, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 1)
  t.deepEqual(Array.from(gl.getUniform(program, loc('m3'))), [1, 2, 3, 4, 5, 6, 7, 8, 9], 'srcOffset')
  const m4 = []
  for (let i = 0; i < 16; ++i) {
    m4.push(i)
  }
  gl.uniformMatrix4fv(loc('m4'), false, new Float32Array(m4))
  t.deepEqual(Array.from(gl.getUniform(program, loc('m4'))), m4)
  gl.uniformMatrix4fv(loc('m4'), false, m4.slice(1))
  t.equal(gl.getError(), gl.INVALID_VALUE, 'wrong length')

  destroy(gl)

  const gl1 = createContext(8, 8)
  const program1 = makeProgram(gl1, [
    'attribute vec2 position;',
    'uniform mat2 m2;',
    'void main () {',
    '  gl_Position = vec4(position, m2[0][0], 1.0);',
    '}'
  ].join('\n'), 'void main () { gl_FragColor = vec4(1.0); }')
  gl1.useProgram(program1)
  gl1.uniformMatrix2fv(gl1.getUniformLocation(program1, 'm2'), true, [1, 2, 3, 4])
  t.equal(gl1.getError(), gl1.INVALID_VALUE, 'WebGL1 still rejects transpose')
  destroy(gl1)

  t.end()
})

tape('uniform blocks', function (t) {
  const gl = createContext(8, 8, { createWebGL2Context: true })
  const program = makeProgram(gl, BLOCK_VERT_SRC, BLOCK_FRAG_SRC)
  t.ok(gl.getProgramParameter(program, gl.LINK_STATUS), gl.getProgramInfoLog(program))

  t.equal(gl.getProgramParameter(program, gl.ACTIVE_UNIFORM_BLOCKS), 1)
  const blockIndex = gl.getUniformBlockIndex(program, 'Block')
  t.equal(blockIndex, 0)
  t.equal(gl.getUniformBlockIndex(program, 'Nope'), gl.INVALID_INDEX)
  t.equal(gl.getActiveUniformBlockName(program, blockIndex), 'Block')
  t.equal(gl.getActiveUniformBlockName(program, 1), null)
  t.equal(gl.getError(), gl.INVALID_VALUE, 'block index out of range')

  t.equal(gl.getActiveUniformBlockParameter(program, blockIndex, gl.UNIFORM_BLOCK_BINDING), 0)
  t.equal(gl.getActiveUniformBlockParameter(program, blockIndex, gl.UNIFORM_BLOCK_DATA_SIZE), 80, 'std140 size')
  t.equal(gl.getActiveUniformBlockParameter(program, blockIndex, gl.UNIFORM_BLOCK_ACTIVE_UNIFORMS), 3)
  t.equal(gl.getActiveUniformBlockParameter(program, blockIndex, gl.UNIFORM_BLOCK_REFERENCED_BY_VERTEX_SHADER), true)
  t.equal(gl.getActiveUniformBlockParameter(program, blockIndex, gl.UNIFORM_BLOCK_REFERENCED_BY_FRAGMENT_SHADER), true)
  const activeIndices = gl.getActiveUniformBlockParameter(program, blockIndex, gl.UNIFORM_BLOCK_ACTIVE_UNIFORM_INDICES)
  t.ok(activeIndices instanceof Uint32Array)
  t.equal(activeIndices.length, 3)
  gl.getActiveUniformBlockParameter(program, blockIndex, gl.UNIFORM_TYPE)
  t.equal(gl.getError(), gl.INVALID_ENUM, 'bad block parameter')
  t.equal(gl.getActiveUniformBlockParameter(program, 1, gl.UNIFORM_BLOCK_BINDING), null)
  t.equal(gl.getError(), gl.INVALID_VALUE, 'block index out of range')

  const indices = gl.getUniformIndices(program, ['color', 'scale[0]', 'm', 'nope'])
  t.equal(indices.length, 4)
  t.equal(indices[3], gl.INVALID_INDEX, 'unknown name')
  t.deepEqual(indices.slice(0, 3).sort(), Array.from(activeIndices).sort(), 'the block lists the same uniforms')
  const known = indices.slice(0, 3)
  t.deepEqual(gl.getActiveUniforms(program, known, gl.UNIFORM_TYPE), [gl.FLOAT_VEC4, gl.FLOAT, gl.FLOAT_MAT2])
  t.deepEqual(gl.getActiveUniforms(program, known, gl.UNIFORM_SIZE), [1, 2, 1])
  t.deepEqual(gl.getActiveUniforms(program, known, gl.UNIFORM_BLOCK_INDEX), [blockIndex, blockIndex, blockIndex])
  t.deepEqual(gl.getActiveUniforms(program, known, gl.UNIFORM_IS_ROW_MAJOR), [false, false, false])
  const offsets = gl.getActiveUniforms(program, known, gl.UNIFORM_OFFSET)
  const arrayStrides = gl.getActiveUniforms(program, known, gl.UNIFORM_ARRAY_STRIDE)
  const matrixStrides = gl.getActiveUniforms(program, known, gl.UNIFORM_MATRIX_STRIDE)
  t.deepEqual(offsets, [0, 16, 48], 'std140 offsets')
  t.deepEqual(arrayStrides, [0, 16, 0])
  t.deepEqual(matrixStrides, [0, 0, 16])
  gl.getActiveUniforms(program, known, gl.UNIFORM_BLOCK_BINDING)
  t.equal(gl.getError(), gl.INVALID_ENUM, 'bad uniform parameter')
  t.equal(gl.getActiveUniforms(program, [7], gl.UNIFORM_TYPE), null)
  t.equal(gl.getError(), gl.INVALID_VALUE, 'uniform index out of range')
  t.throws(function () {
    gl.getUniformIndices(program, 'color')
  }, TypeError)
  t.throws(function () {
    gl.getActiveUniforms(program, 0, gl.UNIFORM_TYPE)
  }, TypeError)

  t.equal(gl.getFragDataLocation(program, 'fragColor'), 0)
  t.equal(gl.getFragDataLocation(program, 'nope'), -1)

  const data = new Float32Array(20)
  data.set([0, 0, 1, 1], offsets[0] / 4)
  data[offsets[1] / 4] = 1
  data[(offsets[1] + arrayStrides[1]) / 4] = 1
  data.set([1, 0], offsets[2] / 4)
  data.set([0, 1], (offsets[2] + matrixStrides[2]) / 4)
  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.UNIFORM_BUFFER, buffer)
  gl.bufferData(gl.UNIFORM_BUFFER, data, gl.STATIC_DRAW)

  gl.useProgram(program)
  gl.uniformBlockBinding(program, blockIndex, 2)
  t.equal(gl.getActiveUniformBlockParameter(program, blockIndex, gl.UNIFORM_BLOCK_BINDING), 2)
  gl.bindBufferBase(gl.UNIFORM_BUFFER, 2, buffer)
  drawTriangle(gl)
  t.equal(gl.getError(), gl.NO_ERROR)
  const pixel = new Uint8Array(4)
  gl.readPixels(4, 4, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel)
  t.deepEqual(Array.from(pixel), [0, 0, 255, 255], 'the block feeds the shader')

  destroy(gl)
  t.end()
})

tape('uniform query methods require a program', function (t) {
  const gl = createContext(8, 8, { createWebGL2Context: true })
  t.throws(() => gl.getUniformIndices(null, ['u1']), TypeError, 'getUniformIndices')
  t.throws(() => gl.getActiveUniforms(null, [0], gl.UNIFORM_TYPE), TypeError, 'getActiveUniforms')
  t.throws(() => gl.getUniformBlockIndex(null, 'Block'), TypeError, 'getUniformBlockIndex')
  t.throws(() => gl.uniformBlockBinding(null, 0, 0), TypeError, 'uniformBlockBinding')
  t.throws(() => gl.getActiveUniformBlockParameter(null, 0, gl.UNIFORM_BLOCK_BINDING), TypeError, 'getActiveUniformBlockParameter')
  t.throws(() => gl.getActiveUniformBlockName(null, 0), TypeError, 'getActiveUniformBlockName')
  t.throws(() => gl.getFragDataLocation(null, 'fragColor'), TypeError, 'getFragDataLocation')
  t.equal(gl.getError(), gl.NO_ERROR)
  destroy(gl)
  t.end()
})
