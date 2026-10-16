'use strict'

const tape = require('tape')
const createContext = require('../index')

function destroy (gl) {
  gl.getExtension('STACKGL_destroy_context').destroy()
}

tape('WebGL2 context parameters', function (t) {
  const gl = createContext(8, 8, { createWebGL2Context: true })
  const gl1 = createContext(8, 8)

  t.ok(/^WebGL 2\.0 /.test(gl.getParameter(gl.VERSION)), gl.getParameter(gl.VERSION))
  t.ok(/^WebGL GLSL ES 3\.00 /.test(gl.getParameter(gl.SHADING_LANGUAGE_VERSION)), gl.getParameter(gl.SHADING_LANGUAGE_VERSION))
  t.ok(/^WebGL 1\.0 /.test(gl1.getParameter(gl1.VERSION)), 'WebGL1 keeps its version')

  t.equal(gl.getParameter(gl.VERTEX_ARRAY_BINDING), null)
  const vao = gl.createVertexArray()
  gl.bindVertexArray(vao)
  t.equal(gl.getParameter(gl.VERTEX_ARRAY_BINDING), vao)
  gl.bindVertexArray(null)

  t.ok(gl.getParameter(gl.MAX_ELEMENT_INDEX) >= 16777215, 'MAX_ELEMENT_INDEX')
  t.ok(gl.getParameter(gl.MAX_UNIFORM_BLOCK_SIZE) >= 16384, 'MAX_UNIFORM_BLOCK_SIZE')
  t.ok(gl.getParameter(gl.MAX_SERVER_WAIT_TIMEOUT) >= 0, 'MAX_SERVER_WAIT_TIMEOUT')
  t.ok(gl.getParameter(gl.MAX_COMBINED_VERTEX_UNIFORM_COMPONENTS) >= 50176, 'MAX_COMBINED_VERTEX_UNIFORM_COMPONENTS')
  t.ok(gl.getParameter(gl.MAX_COMBINED_FRAGMENT_UNIFORM_COMPONENTS) >= 50176, 'MAX_COMBINED_FRAGMENT_UNIFORM_COMPONENTS')
  t.ok(gl.getParameter(gl.MAX_TEXTURE_LOD_BIAS) >= 2, 'MAX_TEXTURE_LOD_BIAS')
  t.ok(gl.getParameter(gl.MAX_3D_TEXTURE_SIZE) >= 256, 'MAX_3D_TEXTURE_SIZE')
  t.ok(gl.getParameter(gl.MAX_ARRAY_TEXTURE_LAYERS) >= 256, 'MAX_ARRAY_TEXTURE_LAYERS')
  t.ok(gl.getParameter(gl.MAX_UNIFORM_BUFFER_BINDINGS) >= 24, 'MAX_UNIFORM_BUFFER_BINDINGS')
  t.equal(gl.getError(), gl.NO_ERROR)

  t.equal(gl.getParameter(gl.RASTERIZER_DISCARD), false)
  gl.enable(gl.RASTERIZER_DISCARD)
  t.equal(gl.getParameter(gl.RASTERIZER_DISCARD), true)
  t.equal(gl.isEnabled(gl.RASTERIZER_DISCARD), true)
  gl.disable(gl.RASTERIZER_DISCARD)

  gl.pixelStorei(gl.UNPACK_ROW_LENGTH, 4)
  gl.pixelStorei(gl.UNPACK_SKIP_PIXELS, 1)
  gl.pixelStorei(gl.UNPACK_IMAGE_HEIGHT, 2)
  gl.pixelStorei(gl.PACK_ROW_LENGTH, 8)
  t.equal(gl.getError(), gl.NO_ERROR)
  t.equal(gl.getParameter(gl.UNPACK_ROW_LENGTH), 4)
  t.equal(gl.getParameter(gl.UNPACK_SKIP_PIXELS), 1)
  t.equal(gl.getParameter(gl.UNPACK_IMAGE_HEIGHT), 2)
  t.equal(gl.getParameter(gl.PACK_ROW_LENGTH), 8)
  gl.pixelStorei(gl.UNPACK_ROW_LENGTH, -1)
  t.equal(gl.getError(), gl.INVALID_VALUE, 'negative pack parameters')
  gl.pixelStorei(gl.UNPACK_ROW_LENGTH, 0)
  gl.pixelStorei(gl.UNPACK_SKIP_PIXELS, 0)
  gl.pixelStorei(gl.UNPACK_IMAGE_HEIGHT, 0)
  gl.pixelStorei(gl.PACK_ROW_LENGTH, 0)

  const samples = gl.getInternalformatParameter(gl.RENDERBUFFER, gl.RGBA8, gl.SAMPLES)
  t.ok(samples instanceof Int32Array)
  t.ok(samples.length > 0 && samples[0] >= 4, 'sample counts: ' + Array.from(samples).join(','))
  for (let i = 1; i < samples.length; ++i) {
    t.ok(samples[i] < samples[i - 1], 'descending order')
  }
  gl.getInternalformatParameter(gl.TEXTURE_2D, gl.RGBA8, gl.SAMPLES)
  t.equal(gl.getError(), gl.INVALID_ENUM, 'bad target')
  gl.getInternalformatParameter(gl.RENDERBUFFER, gl.RGBA8, gl.NUM_SAMPLE_COUNTS)
  t.equal(gl.getError(), gl.INVALID_ENUM, 'bad parameter')

  gl.hint(gl.FRAGMENT_SHADER_DERIVATIVE_HINT, gl.NICEST)
  t.equal(gl.getError(), gl.NO_ERROR, 'derivative hint is core')
  gl.hint(gl.FRAGMENT_SHADER_DERIVATIVE_HINT, gl.LINEAR)
  t.equal(gl.getError(), gl.INVALID_ENUM, 'bad hint mode')
  gl1.hint(gl.FRAGMENT_SHADER_DERIVATIVE_HINT, gl1.NICEST)
  t.equal(gl1.getError(), gl1.INVALID_ENUM, 'WebGL1 needs the extension')

  destroy(gl1)
  destroy(gl)
  t.end()
})

tape('WebGL2 extensions', function (t) {
  const gl = createContext(8, 8, { createWebGL2Context: true })
  const gl1 = createContext(8, 8)

  const supported = gl.getSupportedExtensions()
  const core = [
    'ANGLE_instanced_arrays',
    'EXT_blend_minmax',
    'EXT_shader_texture_lod',
    'OES_element_index_uint',
    'OES_standard_derivatives',
    'OES_texture_float',
    'OES_vertex_array_object',
    'WEBGL_draw_buffers'
  ]
  for (const name of core) {
    t.ok(supported.indexOf(name) < 0, name + ' is not listed')
    t.equal(gl.getExtension(name), null, name + ' is not available')
    t.ok(gl1.getExtension(name), name + ' is still available in WebGL1')
  }
  t.ok(supported.indexOf('EXT_color_buffer_float') >= 0, 'EXT_color_buffer_float is listed')
  t.ok(gl.getExtension('EXT_color_buffer_float'), 'EXT_color_buffer_float is available')
  t.ok(gl.getExtension('OES_texture_float_linear'), 'OES_texture_float_linear is available')
  t.ok(gl.getExtension('STACKGL_destroy_context'), 'STACKGL_destroy_context is available')
  t.ok(gl.getExtension('EXT_texture_filter_anisotropic'), 'EXT_texture_filter_anisotropic is available')
  t.equal(gl.getError(), gl.NO_ERROR)

  destroy(gl1)
  destroy(gl)
  t.end()
})

tape('WebGL2-only parameters on a WebGL1 context', function (t) {
  const gl = createContext(8, 8)
  for (const pname of [0x8D6B, 0x9111, 0x8A30, 0x8A31, 0x8A33]) {
    t.equal(gl.getParameter(pname), null, '0x' + pname.toString(16) + ' is null')
    t.equal(gl.getError(), gl.INVALID_ENUM)
  }
  t.equal(gl.getExtension('EXT_color_buffer_half_float'), null, 'EXT_color_buffer_half_float is not available')
  t.equal(gl.getError(), gl.NO_ERROR)
  destroy(gl)
  t.end()
})

tape('MIN and MAX blend equations are core in WebGL2', function (t) {
  const gl = createContext(8, 8, { createWebGL2Context: true })
  gl.blendEquation(gl.MIN)
  t.equal(gl.getError(), gl.NO_ERROR, 'blendEquation MIN')
  t.equal(gl.getParameter(gl.BLEND_EQUATION_RGB), gl.MIN)
  gl.blendEquationSeparate(gl.MAX, gl.MIN)
  t.equal(gl.getError(), gl.NO_ERROR, 'blendEquationSeparate')
  t.equal(gl.getParameter(gl.BLEND_EQUATION_RGB), gl.MAX)
  t.equal(gl.getParameter(gl.BLEND_EQUATION_ALPHA), gl.MIN)

  const gl1 = createContext(8, 8)
  gl1.blendEquation(0x8007)
  t.equal(gl1.getError(), gl1.INVALID_ENUM, 'WebGL1 needs EXT_blend_minmax')
  destroy(gl)
  destroy(gl1)
  t.end()
})
