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

const FRAG_SRC = [
  '#version 300 es',
  'precision highp float;',
  'uniform sampler2D tex;',
  'out vec4 fragColor;',
  'void main () {',
  '  fragColor = texture(tex, vec2(0.5, 0.5));',
  '}'
].join('\n')

function destroy (gl) {
  gl.getExtension('STACKGL_destroy_context').destroy()
}

function readPixel (gl, x, y) {
  const pixel = new Uint8Array(4)
  gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel)
  return Array.from(pixel)
}

tape('sampler objects', function (t) {
  const gl = createContext(8, 8, { createWebGL2Context: true })

  const sampler = gl.createSampler()
  t.ok(sampler, 'created')
  t.equal(gl.isSampler(sampler), true)
  t.equal(gl.isSampler(null), false)
  t.equal(gl.getParameter(gl.SAMPLER_BINDING), null)

  gl.bindSampler(0, sampler)
  t.equal(gl.getError(), gl.NO_ERROR)
  t.equal(gl.getParameter(gl.SAMPLER_BINDING), sampler)
  gl.activeTexture(gl.TEXTURE1)
  t.equal(gl.getParameter(gl.SAMPLER_BINDING), null, 'bindings are per unit')
  gl.bindSampler(1, sampler)
  t.equal(gl.getParameter(gl.SAMPLER_BINDING), sampler)
  gl.activeTexture(gl.TEXTURE0)
  gl.bindSampler(0, null)
  t.equal(gl.getParameter(gl.SAMPLER_BINDING), null, 'unbound')
  gl.bindSampler(gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS), sampler)
  t.equal(gl.getError(), gl.INVALID_VALUE, 'unit out of range')
  t.throws(function () {
    gl.bindSampler(0, 5)
  }, TypeError)

  gl.samplerParameteri(sampler, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
  gl.samplerParameteri(sampler, gl.TEXTURE_WRAP_R, gl.MIRRORED_REPEAT)
  gl.samplerParameteri(sampler, gl.TEXTURE_COMPARE_MODE, gl.COMPARE_REF_TO_TEXTURE)
  gl.samplerParameteri(sampler, gl.TEXTURE_COMPARE_FUNC, gl.LEQUAL)
  gl.samplerParameterf(sampler, gl.TEXTURE_MIN_LOD, -1.5)
  gl.samplerParameterf(sampler, gl.TEXTURE_MAX_LOD, 4.5)
  t.equal(gl.getError(), gl.NO_ERROR)
  t.equal(gl.getSamplerParameter(sampler, gl.TEXTURE_MIN_FILTER), gl.NEAREST)
  t.equal(gl.getSamplerParameter(sampler, gl.TEXTURE_MAG_FILTER), gl.LINEAR, 'default magnification filter')
  t.equal(gl.getSamplerParameter(sampler, gl.TEXTURE_WRAP_S), gl.REPEAT, 'default wrap')
  t.equal(gl.getSamplerParameter(sampler, gl.TEXTURE_WRAP_R), gl.MIRRORED_REPEAT)
  t.equal(gl.getSamplerParameter(sampler, gl.TEXTURE_COMPARE_MODE), gl.COMPARE_REF_TO_TEXTURE)
  t.equal(gl.getSamplerParameter(sampler, gl.TEXTURE_COMPARE_FUNC), gl.LEQUAL)
  t.equal(gl.getSamplerParameter(sampler, gl.TEXTURE_MIN_LOD), -1.5)
  t.equal(gl.getSamplerParameter(sampler, gl.TEXTURE_MAX_LOD), 4.5)
  t.equal(gl.getError(), gl.NO_ERROR)

  gl.samplerParameteri(sampler, gl.TEXTURE_BASE_LEVEL, 1)
  t.equal(gl.getError(), gl.INVALID_ENUM, 'texture-only parameters are rejected')
  gl.getSamplerParameter(sampler, gl.TEXTURE_IMMUTABLE_FORMAT)
  t.equal(gl.getError(), gl.INVALID_ENUM)
  gl.samplerParameteri(sampler, gl.TEXTURE_WRAP_S, gl.NEAREST)
  t.equal(gl.getError(), gl.INVALID_ENUM, 'bad parameter value')
  t.throws(function () {
    gl.samplerParameteri(null, gl.TEXTURE_WRAP_S, gl.REPEAT)
  }, TypeError, 'null sampler')

  const other = createContext(8, 8, { createWebGL2Context: true })
  const foreign = other.createSampler()
  gl.bindSampler(0, foreign)
  t.equal(gl.getError(), gl.INVALID_OPERATION, 'samplers of another context')
  gl.getSamplerParameter(foreign, gl.TEXTURE_WRAP_S)
  t.equal(gl.getError(), gl.INVALID_OPERATION)
  destroy(other)

  gl.activeTexture(gl.TEXTURE1)
  gl.deleteSampler(sampler)
  t.equal(gl.getError(), gl.NO_ERROR)
  t.equal(gl.isSampler(sampler), false)
  t.equal(gl.getParameter(gl.SAMPLER_BINDING), null, 'deleting unbinds from every unit')
  gl.bindSampler(1, sampler)
  gl.samplerParameteri(sampler, gl.TEXTURE_WRAP_S, gl.REPEAT)
  t.equal(gl.getError(), gl.INVALID_VALUE, 'deleted samplers are invalid')
  gl.deleteSampler(sampler)
  gl.deleteSampler(null)
  t.equal(gl.getError(), gl.INVALID_OPERATION, 'deleting null is an error')

  destroy(gl)
  t.end()
})

tape('samplers override texture parameters', function (t) {
  const gl = createContext(8, 8, { createWebGL2Context: true })
  const program = makeProgram(gl, VERT_SRC, FRAG_SRC)
  t.ok(gl.getProgramParameter(program, gl.LINK_STATUS), gl.getProgramInfoLog(program))
  gl.useProgram(program)

  const texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 2, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255, 255, 255, 255, 255]))
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)

  drawTriangle(gl)
  const nearest = readPixel(gl, 4, 4)
  t.ok(nearest[0] === 0 || nearest[0] === 255, 'nearest filtering picks a texel')

  const sampler = gl.createSampler()
  gl.samplerParameteri(sampler, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.samplerParameteri(sampler, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.bindSampler(0, sampler)
  drawTriangle(gl)
  const linear = readPixel(gl, 4, 4)
  t.ok(linear[0] > 100 && linear[0] < 156, 'the sampler filters linearly: ' + linear[0])

  gl.bindSampler(0, null)
  drawTriangle(gl)
  t.deepEqual(readPixel(gl, 4, 4), nearest, 'unbinding restores the texture parameters')
  t.equal(gl.getError(), gl.NO_ERROR)

  destroy(gl)
  t.end()
})
