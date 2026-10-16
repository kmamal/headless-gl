'use strict'

const tape = require('tape')
const createContext = require('../index')
const makeShader = require('./util/make-shader')

const VERT_SRC = [
  '#version 300 es',
  'layout(location = 0) in float value;',
  'out float doubled;',
  'out float negated;',
  'void main () {',
  '  doubled = value * 2.0;',
  '  negated = -value;',
  '  gl_Position = vec4(0.0, 0.0, 0.0, 1.0);',
  '  gl_PointSize = 1.0;',
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

function destroy (gl) {
  gl.getExtension('STACKGL_destroy_context').destroy()
}

function makeFeedbackProgram (gl, varyings, mode) {
  const program = gl.createProgram()
  gl.attachShader(program, makeShader(gl, gl.VERTEX_SHADER, VERT_SRC))
  gl.attachShader(program, makeShader(gl, gl.FRAGMENT_SHADER, FRAG_SRC))
  gl.transformFeedbackVaryings(program, varyings, mode)
  gl.linkProgram(program)
  return program
}

function readFloats (gl, target, count) {
  const out = new Float32Array(count)
  gl.getBufferSubData(target, 0, out)
  return Array.from(out)
}

tape('transform feedback', function (t) {
  const gl = createContext(8, 8, { createWebGL2Context: true })

  const program = makeFeedbackProgram(gl, ['doubled'], gl.SEPARATE_ATTRIBS)
  t.ok(gl.getProgramParameter(program, gl.LINK_STATUS), gl.getProgramInfoLog(program))
  t.equal(gl.getProgramParameter(program, gl.TRANSFORM_FEEDBACK_VARYINGS), 1)
  t.equal(gl.getProgramParameter(program, gl.TRANSFORM_FEEDBACK_BUFFER_MODE), gl.SEPARATE_ATTRIBS)
  const varying = gl.getTransformFeedbackVarying(program, 0)
  t.equal(varying.name, 'doubled')
  t.equal(varying.type, gl.FLOAT)
  t.equal(varying.size, 1)
  t.equal(gl.getTransformFeedbackVarying(program, 1), null)
  t.equal(gl.getError(), gl.INVALID_VALUE, 'varying index out of range')

  const input = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, input)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([1, 2, 3, 4]), gl.STATIC_DRAW)
  gl.enableVertexAttribArray(0)
  gl.vertexAttribPointer(0, 1, gl.FLOAT, false, 0, 0)

  const output = gl.createBuffer()
  gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER, output)
  gl.bufferData(gl.TRANSFORM_FEEDBACK_BUFFER, 16, gl.STATIC_READ)
  gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER, null)

  const tf = gl.createTransformFeedback()
  t.ok(tf, 'created')
  t.equal(gl.getParameter(gl.TRANSFORM_FEEDBACK_BINDING), null)
  gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, tf)
  t.equal(gl.getError(), gl.NO_ERROR)
  t.equal(gl.isTransformFeedback(tf), true)
  t.equal(gl.getParameter(gl.TRANSFORM_FEEDBACK_BINDING), tf)
  t.equal(gl.getParameter(gl.TRANSFORM_FEEDBACK_ACTIVE), false)
  t.equal(gl.getParameter(gl.TRANSFORM_FEEDBACK_PAUSED), false)

  gl.useProgram(program)
  gl.beginTransformFeedback(gl.POINTS)
  t.equal(gl.getError(), gl.INVALID_OPERATION, 'no buffer bound to the feedback point')

  gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, output)
  t.equal(gl.getIndexedParameter(gl.TRANSFORM_FEEDBACK_BUFFER_BINDING, 0), output)
  gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null)
  t.equal(gl.getIndexedParameter(gl.TRANSFORM_FEEDBACK_BUFFER_BINDING, 0), null, 'indexed bindings belong to the feedback object')
  gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, tf)
  t.equal(gl.getIndexedParameter(gl.TRANSFORM_FEEDBACK_BUFFER_BINDING, 0), output)

  const query = gl.createQuery()
  gl.enable(gl.RASTERIZER_DISCARD)
  gl.beginQuery(gl.TRANSFORM_FEEDBACK_PRIMITIVES_WRITTEN, query)
  gl.beginTransformFeedback(gl.POINTS)
  t.equal(gl.getError(), gl.NO_ERROR)
  t.equal(gl.getParameter(gl.TRANSFORM_FEEDBACK_ACTIVE), true)
  gl.beginTransformFeedback(gl.POINTS)
  t.equal(gl.getError(), gl.INVALID_OPERATION, 'already active')
  gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null)
  t.equal(gl.getError(), gl.INVALID_OPERATION, 'cannot rebind while active')
  gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, output)
  t.equal(gl.getError(), gl.INVALID_OPERATION, 'cannot rebind buffers while active')
  gl.useProgram(null)
  t.equal(gl.getError(), gl.INVALID_OPERATION, 'cannot switch programs while active')
  gl.linkProgram(program)
  t.equal(gl.getError(), gl.INVALID_OPERATION, 'cannot relink the program while active')
  gl.resumeTransformFeedback()
  t.equal(gl.getError(), gl.INVALID_OPERATION, 'not paused')

  gl.drawArrays(gl.POINTS, 0, 2)
  gl.pauseTransformFeedback()
  t.equal(gl.getError(), gl.NO_ERROR)
  t.equal(gl.getParameter(gl.TRANSFORM_FEEDBACK_PAUSED), true)
  gl.pauseTransformFeedback()
  t.equal(gl.getError(), gl.INVALID_OPERATION, 'already paused')
  gl.resumeTransformFeedback()
  t.equal(gl.getParameter(gl.TRANSFORM_FEEDBACK_PAUSED), false)
  gl.drawArrays(gl.POINTS, 2, 2)
  gl.endTransformFeedback()
  gl.endQuery(gl.TRANSFORM_FEEDBACK_PRIMITIVES_WRITTEN)
  gl.disable(gl.RASTERIZER_DISCARD)
  t.equal(gl.getError(), gl.NO_ERROR)
  t.equal(gl.getParameter(gl.TRANSFORM_FEEDBACK_ACTIVE), false)
  gl.endTransformFeedback()
  t.equal(gl.getError(), gl.INVALID_OPERATION, 'not active')
  gl.pauseTransformFeedback()
  t.equal(gl.getError(), gl.INVALID_OPERATION, 'cannot pause when inactive')

  t.deepEqual(readFloats(gl, gl.TRANSFORM_FEEDBACK_BUFFER, 4), [2, 4, 6, 8], 'captured values')
  gl.finish()
  t.equal(gl.getQueryParameter(query, gl.QUERY_RESULT), 4, 'primitives written')

  gl.beginTransformFeedback(gl.LINE_STRIP)
  t.equal(gl.getError(), gl.INVALID_ENUM, 'bad primitive mode')
  gl.useProgram(null)
  gl.beginTransformFeedback(gl.POINTS)
  t.equal(gl.getError(), gl.INVALID_OPERATION, 'no program')
  gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK_BUFFER, tf)
  t.equal(gl.getError(), gl.INVALID_ENUM, 'bad target')
  t.throws(function () {
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, 5)
  }, TypeError)
  t.throws(function () {
    gl.transformFeedbackVaryings(program, 'doubled', gl.SEPARATE_ATTRIBS)
  }, TypeError)
  gl.transformFeedbackVaryings(program, ['doubled'], gl.POINTS)
  t.equal(gl.getError(), gl.INVALID_ENUM, 'bad buffer mode')
  const tooMany = new Array(gl.getParameter(gl.MAX_TRANSFORM_FEEDBACK_SEPARATE_ATTRIBS) + 1).fill('doubled')
  gl.transformFeedbackVaryings(program, tooMany, gl.SEPARATE_ATTRIBS)
  t.equal(gl.getError(), gl.INVALID_VALUE, 'too many separate varyings')

  gl.deleteTransformFeedback(tf)
  t.equal(gl.getError(), gl.NO_ERROR)
  t.equal(gl.getParameter(gl.TRANSFORM_FEEDBACK_BINDING), null, 'deleting unbinds')
  t.equal(gl.isTransformFeedback(tf), false)
  gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, tf)
  t.equal(gl.getError(), gl.INVALID_OPERATION, 'deleted objects cannot be bound')

  destroy(gl)
  t.end()
})

tape('interleaved transform feedback', function (t) {
  const gl = createContext(8, 8, { createWebGL2Context: true })
  const program = makeFeedbackProgram(gl, ['doubled', 'negated'], gl.INTERLEAVED_ATTRIBS)
  t.ok(gl.getProgramParameter(program, gl.LINK_STATUS), gl.getProgramInfoLog(program))
  t.equal(gl.getProgramParameter(program, gl.TRANSFORM_FEEDBACK_VARYINGS), 2)
  t.equal(gl.getTransformFeedbackVarying(program, 1).name, 'negated')

  const input = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, input)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([1, 2, 3]), gl.STATIC_DRAW)
  gl.enableVertexAttribArray(0)
  gl.vertexAttribPointer(0, 1, gl.FLOAT, false, 0, 0)

  const output = gl.createBuffer()
  gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, output)
  gl.bufferData(gl.TRANSFORM_FEEDBACK_BUFFER, 24, gl.STATIC_READ)

  gl.useProgram(program)
  gl.enable(gl.RASTERIZER_DISCARD)
  gl.beginTransformFeedback(gl.POINTS)
  gl.drawArrays(gl.POINTS, 0, 3)
  gl.endTransformFeedback()
  gl.disable(gl.RASTERIZER_DISCARD)
  t.equal(gl.getError(), gl.NO_ERROR, 'the default transform feedback object works')
  t.deepEqual(readFloats(gl, gl.TRANSFORM_FEEDBACK_BUFFER, 6), [2, -1, 4, -2, 6, -3], 'interleaved values')

  const active = gl.createTransformFeedback()
  gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, active)
  gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, output)
  gl.beginTransformFeedback(gl.POINTS)
  gl.deleteTransformFeedback(active)
  t.equal(gl.getError(), gl.INVALID_OPERATION, 'cannot delete an active object')
  gl.pauseTransformFeedback()
  gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null)
  t.equal(gl.getError(), gl.NO_ERROR, 'a paused object can be unbound')
  t.equal(gl.getParameter(gl.TRANSFORM_FEEDBACK_ACTIVE), false, 'the default object is not active')
  gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, active)
  t.equal(gl.getParameter(gl.TRANSFORM_FEEDBACK_ACTIVE), true)
  t.equal(gl.getParameter(gl.TRANSFORM_FEEDBACK_PAUSED), true)
  gl.resumeTransformFeedback()
  gl.endTransformFeedback()
  t.equal(gl.getError(), gl.NO_ERROR)

  destroy(gl)
  t.end()
})

tape('buffers bound to an active transform feedback', function (t) {
  const gl = createContext(8, 8, { createWebGL2Context: true })
  const program = makeFeedbackProgram(gl, ['doubled'], gl.SEPARATE_ATTRIBS)
  gl.useProgram(program)
  const tf = gl.createTransformFeedback()
  gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, tf)
  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER, buffer)
  gl.bufferData(gl.TRANSFORM_FEEDBACK_BUFFER, 16, gl.STATIC_DRAW)
  gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, buffer)
  const other = gl.createBuffer()
  gl.bindBuffer(gl.COPY_WRITE_BUFFER, other)
  gl.bufferData(gl.COPY_WRITE_BUFFER, 16, gl.STATIC_DRAW)
  gl.beginTransformFeedback(gl.POINTS)
  t.equal(gl.getError(), gl.NO_ERROR)

  gl.copyBufferSubData(gl.TRANSFORM_FEEDBACK_BUFFER, gl.COPY_WRITE_BUFFER, 0, 0, 16)
  t.equal(gl.getError(), gl.INVALID_OPERATION, 'copying from a buffer in use is an error')
  gl.copyBufferSubData(gl.COPY_WRITE_BUFFER, gl.TRANSFORM_FEEDBACK_BUFFER, 0, 0, 16)
  t.equal(gl.getError(), gl.INVALID_OPERATION, 'copying into a buffer in use is an error')

  gl.deleteBuffer(buffer)
  t.equal(gl.getError(), gl.NO_ERROR, 'deleting a buffer in use is allowed')
  t.equal(gl.getIndexedParameter(gl.TRANSFORM_FEEDBACK_BUFFER_BINDING, 0), null, 'the binding is cleared')
  gl.endTransformFeedback()
  t.equal(gl.getError(), gl.NO_ERROR)
  destroy(gl)
  t.end()
})

tape('programs used by a paused transform feedback cannot be relinked', function (t) {
  const gl = createContext(8, 8, { createWebGL2Context: true })
  const program = gl.createProgram()
  gl.attachShader(program, makeShader(gl, gl.VERTEX_SHADER, [
    '#version 300 es',
    'uniform float scale;',
    'out float scaled;',
    'void main () {',
    '  scaled = scale;',
    '  gl_Position = vec4(0.0, 0.0, 0.0, 1.0);',
    '}'
  ].join('\n')))
  gl.attachShader(program, makeShader(gl, gl.FRAGMENT_SHADER, FRAG_SRC))
  gl.transformFeedbackVaryings(program, ['scaled'], gl.SEPARATE_ATTRIBS)
  gl.linkProgram(program)
  gl.useProgram(program)
  const location = gl.getUniformLocation(program, 'scale')
  const tf = gl.createTransformFeedback()
  gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, tf)
  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER, buffer)
  gl.bufferData(gl.TRANSFORM_FEEDBACK_BUFFER, 16, gl.STATIC_DRAW)
  gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, buffer)
  gl.beginTransformFeedback(gl.POINTS)
  gl.pauseTransformFeedback()
  gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null)
  t.equal(gl.getError(), gl.NO_ERROR)

  gl.linkProgram(program)
  t.equal(gl.getError(), gl.INVALID_OPERATION, 'linking is refused')
  t.ok(gl.getProgramParameter(program, gl.LINK_STATUS), 'the program stays linked')
  gl.uniform1f(location, 2)
  t.equal(gl.getError(), gl.NO_ERROR, 'uniform locations stay valid')

  gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, tf)
  gl.resumeTransformFeedback()
  gl.endTransformFeedback()
  t.equal(gl.getError(), gl.NO_ERROR)
  destroy(gl)
  t.end()
})

tape('transform feedback varyings', function (t) {
  const gl = createContext(8, 8, { createWebGL2Context: true })
  const program = makeFeedbackProgram(gl, new Set(['doubled', 'negated']), gl.INTERLEAVED_ATTRIBS)
  t.ok(gl.getProgramParameter(program, gl.LINK_STATUS), gl.getProgramInfoLog(program))
  t.equal(gl.getProgramParameter(program, gl.TRANSFORM_FEEDBACK_VARYINGS), 2, 'any sequence of names')
  t.throws(() => gl.transformFeedbackVaryings(program, 'doubled', gl.INTERLEAVED_ATTRIBS), TypeError, 'a string is not a sequence')
  t.throws(() => gl.getTransformFeedbackVarying(null, 0), TypeError, 'getTransformFeedbackVarying requires a program')
  t.equal(gl.getError(), gl.NO_ERROR)
  destroy(gl)
  t.end()
})
