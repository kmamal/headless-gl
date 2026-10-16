'use strict'

const tape = require('tape')
const createContext = require('../index')

const SIZE = 8

const createGL = () => createContext(SIZE, SIZE, { createWebGL2Context: true, preserveDrawingBuffer: true })

const compile = (gl, type, source) => {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { throw new Error(gl.getShaderInfoLog(shader)) }
  return shader
}

const sampler = (gl, samplerType, fetch) => {
  const program = gl.createProgram()
  gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, `#version 300 es
    out vec2 uv;
    void main() {
      vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
      uv = p;
      gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
    }`))
  gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, `#version 300 es
    precision highp float;
    precision highp sampler2DArray;
    uniform ${samplerType} tex;
    in vec2 uv;
    out vec4 color;
    void main() { color = ${fetch}; }`))
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) { throw new Error(gl.getProgramInfoLog(program)) }
  return program
}

const drawAndRead = (gl, program, x, y) => {
  gl.useProgram(program)
  gl.viewport(0, 0, SIZE, SIZE)
  gl.clearColor(0, 0, 0, 0)
  gl.clear(gl.COLOR_BUFFER_BIT)
  gl.drawArrays(gl.TRIANGLES, 0, 3)
  const out = new Uint8Array(4)
  gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, out)
  return Array.from(out)
}

const nearest = (gl, target) => {
  gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
  gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
}

const sample2D = (gl, x = 4, y = 4) => drawAndRead(gl, sampler(gl, 'sampler2D', 'texture(tex, uv)'), x, y)

const near = (t, actual, expected, tolerance = 3) => {
  actual.forEach((value, channel) => t.ok(Math.abs(value - expected[channel]) <= tolerance, `got ${actual} expected ${expected}`))
}

const dxt1Block = (color0, color1 = 0, indices = 0) => new Uint8Array([color0 & 255, color0 >> 8, color1 & 255, color1 >> 8, indices & 255, (indices >> 8) & 255, (indices >> 16) & 255, (indices >> 24) & 255])

const RED565 = 0xF800
const GREEN565 = 0x07E0
const BLUE565 = 0x001F

const upload = (gl, internalFormat, width, height, data, ...rest) => {
  const texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, texture)
  nearest(gl, gl.TEXTURE_2D)
  gl.compressedTexImage2D(gl.TEXTURE_2D, 0, internalFormat, width, height, 0, data, ...rest)
  return texture
}

tape('compressed texture extensions are advertised', function (t) {
  const supported = createGL().getSupportedExtensions()
  for (const name of ['WEBGL_compressed_texture_s3tc', 'WEBGL_compressed_texture_s3tc_srgb', 'WEBGL_compressed_texture_etc', 'WEBGL_compressed_texture_astc', 'EXT_texture_compression_bptc', 'EXT_texture_compression_rgtc']) {
    t.ok(supported.includes(name), name)
  }
  t.end()
})

tape('compressed texture extensions expose the specified constants', function (t) {
  const gl = createGL()
  t.equal(gl.getExtension('WEBGL_compressed_texture_s3tc').COMPRESSED_RGBA_S3TC_DXT5_EXT, 0x83F3)
  t.equal(gl.getExtension('WEBGL_compressed_texture_s3tc_srgb').COMPRESSED_SRGB_S3TC_DXT1_EXT, 0x8C4C)
  t.equal(gl.getExtension('WEBGL_compressed_texture_etc').COMPRESSED_RGB8_ETC2, 0x9274)
  const astc = gl.getExtension('WEBGL_compressed_texture_astc')
  t.equal(astc.COMPRESSED_RGBA_ASTC_4x4_KHR, 0x93B0)
  t.equal(astc.COMPRESSED_RGBA_ASTC_12x12_KHR, 0x93BD)
  t.equal(astc.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR, 0x93D0)
  t.deepEqual(astc.getSupportedProfiles(), ['ldr'])
  t.equal(gl.getExtension('EXT_texture_compression_bptc').COMPRESSED_RGBA_BPTC_UNORM_EXT, 0x8E8C)
  t.equal(gl.getExtension('EXT_texture_compression_rgtc').COMPRESSED_RED_RGTC1_EXT, 0x8DBB)
  gl.getExtension('STACKGL_destroy_context').destroy()
  t.end()
})

tape('compressed texture extensions list only the formats of enabled extensions', function (t) {
  const gl = createGL()
  t.equal(gl.getParameter(gl.COMPRESSED_TEXTURE_FORMATS).length, 0)
  gl.getExtension('WEBGL_compressed_texture_s3tc')
  t.deepEqual(Array.from(gl.getParameter(gl.COMPRESSED_TEXTURE_FORMATS)), [0x83F0, 0x83F1, 0x83F2, 0x83F3])
  gl.getExtension('EXT_texture_compression_rgtc')
  t.equal(gl.getParameter(gl.COMPRESSED_TEXTURE_FORMATS).length, 8)
  gl.getExtension('STACKGL_destroy_context').destroy()
  t.end()
})

tape('compressed texture extensions reject uploads until the extension is enabled', function (t) {
  const gl = createGL()
  const texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.compressedTexImage2D(gl.TEXTURE_2D, 0, 0x83F0, 4, 4, 0, dxt1Block(RED565))
  t.equal(gl.getError(), gl.INVALID_ENUM)
  gl.getExtension('STACKGL_destroy_context').destroy()
  t.end()
})

tape('compressedTexImage2D uploads BC1 (DXT1)', function (t) {
  const gl = createGL()
  const ext = gl.getExtension('WEBGL_compressed_texture_s3tc')
  upload(gl, ext.COMPRESSED_RGB_S3TC_DXT1_EXT, 4, 4, dxt1Block(RED565))
  t.equal(gl.getError(), gl.NO_ERROR)
  near(t, sample2D(gl), [255, 0, 0, 255])
  gl.getExtension('STACKGL_destroy_context').destroy()
  t.end()
})

tape('compressedTexImage2D uploads BC3 (DXT5) with alpha', function (t) {
  const gl = createGL()
  const ext = gl.getExtension('WEBGL_compressed_texture_s3tc')
  const block = new Uint8Array(16)
  block.set([128, 0], 0)
  block.set(dxt1Block(GREEN565), 8)
  upload(gl, ext.COMPRESSED_RGBA_S3TC_DXT5_EXT, 4, 4, block)
  t.equal(gl.getError(), gl.NO_ERROR)
  near(t, sample2D(gl), [0, 255, 0, 128], 4)
  gl.getExtension('STACKGL_destroy_context').destroy()
  t.end()
})

tape('compressedTexImage2D uploads BC4 (RGTC1)', function (t) {
  const gl = createGL()
  const ext = gl.getExtension('EXT_texture_compression_rgtc')
  upload(gl, ext.COMPRESSED_RED_RGTC1_EXT, 4, 4, new Uint8Array([255, 0, 0, 0, 0, 0, 0, 0]))
  t.equal(gl.getError(), gl.NO_ERROR)
  near(t, sample2D(gl), [255, 0, 0, 255])
  gl.getExtension('STACKGL_destroy_context').destroy()
  t.end()
})

tape('compressedTexImage2D uploads ETC2', function (t) {
  const gl = createGL()
  const ext = gl.getExtension('WEBGL_compressed_texture_etc')
  upload(gl, ext.COMPRESSED_RGB8_ETC2, 4, 4, new Uint8Array([0xF8, 0, 0, 0x02, 0, 0, 0, 0]))
  t.equal(gl.getError(), gl.NO_ERROR)
  near(t, sample2D(gl), [255, 2, 2, 255], 4)
  gl.getExtension('STACKGL_destroy_context').destroy()
  t.end()
})

tape('compressedTexImage2D uploads an ASTC void-extent block', function (t) {
  const gl = createGL()
  const ext = gl.getExtension('WEBGL_compressed_texture_astc')
  const block = new Uint8Array([0xFC, 0xFD, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0, 0, 0, 0, 0xFF, 0xFF])
  upload(gl, ext.COMPRESSED_RGBA_ASTC_4x4_KHR, 4, 4, block)
  t.equal(gl.getError(), gl.NO_ERROR)
  near(t, sample2D(gl), [255, 0, 0, 255])
  gl.getExtension('STACKGL_destroy_context').destroy()
  t.end()
})

tape('compressedTexImage2D honors srcOffset and srcLengthOverride', function (t) {
  const gl = createGL()
  const ext = gl.getExtension('WEBGL_compressed_texture_s3tc')
  const padded = new Uint8Array(24)
  padded.set(dxt1Block(BLUE565), 8)
  upload(gl, ext.COMPRESSED_RGB_S3TC_DXT1_EXT, 4, 4, padded, 8, 8)
  t.equal(gl.getError(), gl.NO_ERROR)
  near(t, sample2D(gl), [0, 0, 255, 255])
  gl.getExtension('STACKGL_destroy_context').destroy()
  t.end()
})

tape('compressedTexImage2D accepts other view types and honors the view byte offset', function (t) {
  const gl = createGL()
  const ext = gl.getExtension('WEBGL_compressed_texture_s3tc')
  const bytes = new Uint8Array(16)
  bytes.set(dxt1Block(GREEN565), 8)
  upload(gl, ext.COMPRESSED_RGB_S3TC_DXT1_EXT, 4, 4, new DataView(bytes.buffer, 8, 8))
  t.equal(gl.getError(), gl.NO_ERROR)
  near(t, sample2D(gl), [0, 255, 0, 255])
  upload(gl, ext.COMPRESSED_RGB_S3TC_DXT1_EXT, 4, 4, bytes.subarray(8))
  t.equal(gl.getError(), gl.NO_ERROR)
  near(t, sample2D(gl), [0, 255, 0, 255])
  gl.getExtension('STACKGL_destroy_context').destroy()
  t.end()
})

tape('compressedTexImage2D raises INVALID_VALUE when the data size does not match', function (t) {
  const gl = createGL()
  const ext = gl.getExtension('WEBGL_compressed_texture_s3tc')
  upload(gl, ext.COMPRESSED_RGB_S3TC_DXT1_EXT, 4, 4, new Uint8Array(4))
  t.equal(gl.getError(), gl.INVALID_VALUE)
  gl.getExtension('STACKGL_destroy_context').destroy()
  t.end()
})

tape('compressedTexImage2D raises INVALID_OPERATION without a bound texture or with non-view data', function (t) {
  const gl = createGL()
  const ext = gl.getExtension('WEBGL_compressed_texture_s3tc')
  gl.compressedTexImage2D(gl.TEXTURE_2D, 0, ext.COMPRESSED_RGB_S3TC_DXT1_EXT, 4, 4, 0, dxt1Block(RED565))
  t.equal(gl.getError(), gl.INVALID_OPERATION)
  const texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.compressedTexImage2D(gl.TEXTURE_2D, 0, ext.COMPRESSED_RGB_S3TC_DXT1_EXT, 4, 4, 0, 8)
  t.equal(gl.getError(), gl.INVALID_OPERATION)
  gl.getExtension('STACKGL_destroy_context').destroy()
  t.end()
})

tape('compressedTexImage2D uploads every mip level', function (t) {
  const gl = createGL()
  const ext = gl.getExtension('WEBGL_compressed_texture_s3tc')
  const texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
  const level0 = new Uint8Array(32)
  for (let block = 0; block < 4; block++) level0.set(dxt1Block(RED565), block * 8)
  gl.compressedTexImage2D(gl.TEXTURE_2D, 0, ext.COMPRESSED_RGB_S3TC_DXT1_EXT, 8, 8, 0, level0)
  gl.compressedTexImage2D(gl.TEXTURE_2D, 1, ext.COMPRESSED_RGB_S3TC_DXT1_EXT, 4, 4, 0, dxt1Block(GREEN565))
  gl.compressedTexImage2D(gl.TEXTURE_2D, 2, ext.COMPRESSED_RGB_S3TC_DXT1_EXT, 2, 2, 0, dxt1Block(BLUE565))
  gl.compressedTexImage2D(gl.TEXTURE_2D, 3, ext.COMPRESSED_RGB_S3TC_DXT1_EXT, 1, 1, 0, dxt1Block(BLUE565))
  t.equal(gl.getError(), gl.NO_ERROR)
  const program = sampler(gl, 'sampler2D', 'textureLod(tex, uv, 1.0)')
  near(t, drawAndRead(gl, program, 4, 4), [0, 255, 0, 255])
  near(t, drawAndRead(gl, sampler(gl, 'sampler2D', 'textureLod(tex, uv, 0.0)'), 4, 4), [255, 0, 0, 255])
  gl.getExtension('STACKGL_destroy_context').destroy()
  t.end()
})

tape('compressedTexSubImage2D replaces a block of an existing texture', function (t) {
  const gl = createGL()
  const ext = gl.getExtension('WEBGL_compressed_texture_s3tc')
  const data = new Uint8Array(16)
  data.set(dxt1Block(RED565), 0)
  data.set(dxt1Block(BLUE565), 8)
  upload(gl, ext.COMPRESSED_RGB_S3TC_DXT1_EXT, 8, 4, data)
  gl.compressedTexSubImage2D(gl.TEXTURE_2D, 0, 4, 0, 4, 4, ext.COMPRESSED_RGB_S3TC_DXT1_EXT, dxt1Block(GREEN565))
  t.equal(gl.getError(), gl.NO_ERROR)
  const program = sampler(gl, 'sampler2D', 'texture(tex, uv)')
  near(t, drawAndRead(gl, program, 1, 4), [255, 0, 0, 255])
  near(t, drawAndRead(gl, program, 6, 4), [0, 255, 0, 255])
  gl.getExtension('STACKGL_destroy_context').destroy()
  t.end()
})

tape('compressedTexSubImage2D raises INVALID_OPERATION with non-view data', function (t) {
  const gl = createGL()
  const ext = gl.getExtension('WEBGL_compressed_texture_s3tc')
  upload(gl, ext.COMPRESSED_RGB_S3TC_DXT1_EXT, 4, 4, dxt1Block(RED565))
  gl.compressedTexSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 4, 4, ext.COMPRESSED_RGB_S3TC_DXT1_EXT, 8)
  t.equal(gl.getError(), gl.INVALID_OPERATION)
  gl.getExtension('STACKGL_destroy_context').destroy()
  t.end()
})

const unpackBuffer = (gl, data) => {
  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.PIXEL_UNPACK_BUFFER, buffer)
  gl.bufferData(gl.PIXEL_UNPACK_BUFFER, data, gl.STATIC_DRAW)
}

tape('compressed uploads from a pixel unpack buffer uploads a 2D texture from a byte offset', function (t) {
  const gl = createGL()
  const ext = gl.getExtension('WEBGL_compressed_texture_s3tc')
  const data = new Uint8Array(16)
  data.set(dxt1Block(GREEN565), 8)
  unpackBuffer(gl, data)
  const texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, texture)
  nearest(gl, gl.TEXTURE_2D)
  gl.compressedTexImage2D(gl.TEXTURE_2D, 0, ext.COMPRESSED_RGB_S3TC_DXT1_EXT, 4, 4, 0, 8, 8)
  t.equal(gl.getError(), gl.NO_ERROR)
  gl.bindBuffer(gl.PIXEL_UNPACK_BUFFER, null)
  near(t, sample2D(gl), [0, 255, 0, 255])
  gl.getExtension('STACKGL_destroy_context').destroy()
  t.end()
})

tape('compressed uploads from a pixel unpack buffer updates a sub-region from a byte offset', function (t) {
  const gl = createGL()
  const ext = gl.getExtension('WEBGL_compressed_texture_s3tc')
  const base = new Uint8Array(16)
  base.set(dxt1Block(RED565), 0)
  base.set(dxt1Block(RED565), 8)
  upload(gl, ext.COMPRESSED_RGB_S3TC_DXT1_EXT, 8, 4, base)
  const source = new Uint8Array(16)
  source.set(dxt1Block(BLUE565), 8)
  unpackBuffer(gl, source)
  gl.compressedTexSubImage2D(gl.TEXTURE_2D, 0, 4, 0, 4, 4, ext.COMPRESSED_RGB_S3TC_DXT1_EXT, 8, 8)
  t.equal(gl.getError(), gl.NO_ERROR)
  gl.bindBuffer(gl.PIXEL_UNPACK_BUFFER, null)
  const program = sampler(gl, 'sampler2D', 'texture(tex, uv)')
  near(t, drawAndRead(gl, program, 1, 4), [255, 0, 0, 255])
  near(t, drawAndRead(gl, program, 6, 4), [0, 0, 255, 255])
  gl.getExtension('STACKGL_destroy_context').destroy()
  t.end()
})

tape('compressed uploads from a pixel unpack buffer uploads array layers from a byte offset', function (t) {
  const gl = createGL()
  const ext = gl.getExtension('WEBGL_compressed_texture_s3tc')
  const data = new Uint8Array(24)
  data.set(dxt1Block(RED565), 8)
  data.set(dxt1Block(GREEN565), 16)
  unpackBuffer(gl, data)
  const texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D_ARRAY, texture)
  nearest(gl, gl.TEXTURE_2D_ARRAY)
  gl.compressedTexImage3D(gl.TEXTURE_2D_ARRAY, 0, ext.COMPRESSED_RGB_S3TC_DXT1_EXT, 4, 4, 2, 0, 16, 8)
  t.equal(gl.getError(), gl.NO_ERROR)
  gl.bindBuffer(gl.PIXEL_UNPACK_BUFFER, null)
  near(t, drawAndRead(gl, sampler(gl, 'sampler2DArray', 'texture(tex, vec3(uv, 0.0))'), 4, 4), [255, 0, 0, 255])
  near(t, drawAndRead(gl, sampler(gl, 'sampler2DArray', 'texture(tex, vec3(uv, 1.0))'), 4, 4), [0, 255, 0, 255])
  gl.getExtension('STACKGL_destroy_context').destroy()
  t.end()
})

tape('compressed uploads from a pixel unpack buffer requires a bound unpack buffer for the offset form', function (t) {
  const gl = createGL()
  const ext = gl.getExtension('WEBGL_compressed_texture_s3tc')
  const texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.compressedTexImage2D(gl.TEXTURE_2D, 0, ext.COMPRESSED_RGB_S3TC_DXT1_EXT, 4, 4, 0, 8, 0)
  t.equal(gl.getError(), gl.INVALID_OPERATION)
  gl.getExtension('STACKGL_destroy_context').destroy()
  t.end()
})

tape('compressed 3D textures upload array layers with the WebGL2 signature', function (t) {
  const gl = createGL()
  const ext = gl.getExtension('WEBGL_compressed_texture_s3tc')
  const texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D_ARRAY, texture)
  nearest(gl, gl.TEXTURE_2D_ARRAY)
  const layers = new Uint8Array(16)
  layers.set(dxt1Block(RED565), 0)
  layers.set(dxt1Block(GREEN565), 8)
  gl.compressedTexImage3D(gl.TEXTURE_2D_ARRAY, 0, ext.COMPRESSED_RGB_S3TC_DXT1_EXT, 4, 4, 2, 0, layers)
  t.equal(gl.getError(), gl.NO_ERROR)
  near(t, drawAndRead(gl, sampler(gl, 'sampler2DArray', 'texture(tex, vec3(uv, 0.0))'), 4, 4), [255, 0, 0, 255])
  near(t, drawAndRead(gl, sampler(gl, 'sampler2DArray', 'texture(tex, vec3(uv, 1.0))'), 4, 4), [0, 255, 0, 255])
  gl.getExtension('STACKGL_destroy_context').destroy()
  t.end()
})

tape('compressed 3D textures update a single layer with compressedTexSubImage3D', function (t) {
  const gl = createGL()
  const ext = gl.getExtension('WEBGL_compressed_texture_s3tc')
  const texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D_ARRAY, texture)
  nearest(gl, gl.TEXTURE_2D_ARRAY)
  const layers = new Uint8Array(16)
  layers.set(dxt1Block(RED565), 0)
  layers.set(dxt1Block(RED565), 8)
  gl.compressedTexImage3D(gl.TEXTURE_2D_ARRAY, 0, ext.COMPRESSED_RGB_S3TC_DXT1_EXT, 4, 4, 2, 0, layers)
  gl.compressedTexSubImage3D(gl.TEXTURE_2D_ARRAY, 0, 0, 0, 1, 4, 4, 1, ext.COMPRESSED_RGB_S3TC_DXT1_EXT, dxt1Block(BLUE565))
  t.equal(gl.getError(), gl.NO_ERROR)
  near(t, drawAndRead(gl, sampler(gl, 'sampler2DArray', 'texture(tex, vec3(uv, 0.0))'), 4, 4), [255, 0, 0, 255])
  near(t, drawAndRead(gl, sampler(gl, 'sampler2DArray', 'texture(tex, vec3(uv, 1.0))'), 4, 4), [0, 0, 255, 255])
  gl.getExtension('STACKGL_destroy_context').destroy()
  t.end()
})

tape('compressed 3D textures honors srcOffset', function (t) {
  const gl = createGL()
  const ext = gl.getExtension('WEBGL_compressed_texture_s3tc')
  const texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D_ARRAY, texture)
  nearest(gl, gl.TEXTURE_2D_ARRAY)
  const data = new Uint8Array(16)
  data.set(dxt1Block(GREEN565), 8)
  gl.compressedTexImage3D(gl.TEXTURE_2D_ARRAY, 0, ext.COMPRESSED_RGB_S3TC_DXT1_EXT, 4, 4, 1, 0, data, 8, 8)
  t.equal(gl.getError(), gl.NO_ERROR)
  near(t, drawAndRead(gl, sampler(gl, 'sampler2DArray', 'texture(tex, vec3(uv, 0.0))'), 4, 4), [0, 255, 0, 255])
  gl.getExtension('STACKGL_destroy_context').destroy()
  t.end()
})

tape('compressed textures accept cube map faces and validate offsets', function (t) {
  const gl = createContext(8, 8)
  const ext = gl.getExtension('WEBGL_compressed_texture_s3tc')
  if (!ext) {
    t.skip('WEBGL_compressed_texture_s3tc not supported')
    gl.getExtension('STACKGL_destroy_context').destroy()
    t.end()
    return
  }
  const format = ext.COMPRESSED_RGB_S3TC_DXT1_EXT
  t.ok(Array.from(gl.getParameter(gl.COMPRESSED_TEXTURE_FORMATS)).includes(format))

  const faces = [
    gl.TEXTURE_CUBE_MAP_POSITIVE_X, gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
    gl.TEXTURE_CUBE_MAP_POSITIVE_Y, gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
    gl.TEXTURE_CUBE_MAP_POSITIVE_Z, gl.TEXTURE_CUBE_MAP_NEGATIVE_Z
  ]
  const cube = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, cube)
  for (const face of faces) {
    gl.compressedTexImage2D(face, 0, format, 4, 4, 0, new Uint8Array(8))
    t.equal(gl.getError(), gl.NO_ERROR, 'upload to face ' + face.toString(16))
    gl.compressedTexSubImage2D(face, 0, 0, 0, 4, 4, format, new Uint8Array(8))
    t.equal(gl.getError(), gl.NO_ERROR, 'sub-upload to face ' + face.toString(16))
  }

  const texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, texture)
  const data = new Uint8Array(16)
  gl.compressedTexImage2D(gl.TEXTURE_2D, 0, format, 4, 4, 0, data, 8)
  t.equal(gl.getError(), gl.NO_ERROR, 'srcOffset')
  gl.compressedTexImage2D(gl.TEXTURE_2D, 0, format, 4, 4, 0, data, 4, 8)
  t.equal(gl.getError(), gl.NO_ERROR, 'srcOffset and srcLengthOverride')
  gl.compressedTexImage2D(gl.TEXTURE_2D, 0, format, 4, 4, 0, new DataView(data.buffer), 8)
  t.equal(gl.getError(), gl.NO_ERROR, 'DataView')
  gl.compressedTexImage2D(gl.TEXTURE_2D, 0, format, 4, 4, 0, data, 20)
  t.equal(gl.getError(), gl.INVALID_VALUE, 'srcOffset past the end')
  gl.compressedTexImage2D(gl.TEXTURE_2D, 0, format, 4, 4, 0, new DataView(data.buffer), 20)
  t.equal(gl.getError(), gl.INVALID_VALUE, 'DataView srcOffset past the end')
  gl.compressedTexImage2D(gl.TEXTURE_2D, 0, format, 4, 4, 0, data, 12, 8)
  t.equal(gl.getError(), gl.INVALID_VALUE, 'srcLengthOverride past the end')

  gl.bindTexture(gl.TEXTURE_2D, null)
  gl.compressedTexImage2D(gl.TEXTURE_2D, 0, format, 4, 4, 0, new Uint8Array(8))
  t.equal(gl.getError(), gl.INVALID_OPERATION, 'no texture bound')
  t.throws(function () {
    gl.compressedTexImage2D(gl.TEXTURE_2D, 0, format, 4, 4, 0, 'data')
  }, TypeError)

  const gl2 = createContext(8, 8, { createWebGL2Context: true })
  const ext2 = gl2.getExtension('WEBGL_compressed_texture_s3tc')
  const array = gl2.createTexture()
  gl2.bindTexture(gl2.TEXTURE_2D_ARRAY, array)
  gl2.compressedTexImage3D(gl2.TEXTURE_2D_ARRAY, 0, ext2.COMPRESSED_RGB_S3TC_DXT1_EXT, 4, 4, 2, 0, new Uint8Array(16))
  t.equal(gl2.getError(), gl2.NO_ERROR, '2D array upload')
  gl2.compressedTexSubImage3D(gl2.TEXTURE_2D_ARRAY, 0, 0, 0, 1, 4, 4, 1, ext2.COMPRESSED_RGB_S3TC_DXT1_EXT, new Uint8Array(8))
  t.equal(gl2.getError(), gl2.NO_ERROR, '2D array sub-upload')
  gl2.compressedTexImage3D(gl2.TEXTURE_2D, 0, ext2.COMPRESSED_RGB_S3TC_DXT1_EXT, 4, 4, 2, 0, new Uint8Array(16))
  t.equal(gl2.getError(), gl2.INVALID_ENUM, '3D upload to a 2D target')
  gl2.bindTexture(gl2.TEXTURE_2D_ARRAY, null)
  gl2.compressedTexImage3D(gl2.TEXTURE_2D_ARRAY, 0, ext2.COMPRESSED_RGB_S3TC_DXT1_EXT, 4, 4, 2, 0, new Uint8Array(16))
  t.equal(gl2.getError(), gl2.INVALID_OPERATION, '3D upload without a texture')
  gl2.getExtension('STACKGL_destroy_context').destroy()

  gl.getExtension('STACKGL_destroy_context').destroy()
  t.end()
})

tape('compressed texture uploads validate their target and data', function (t) {
  const gl = createContext(8, 8)
  const ext = gl.getExtension('WEBGL_compressed_texture_s3tc')
  if (!ext) {
    t.skip('WEBGL_compressed_texture_s3tc not supported')
    gl.getExtension('STACKGL_destroy_context').destroy()
    t.end()
    return
  }
  const format = ext.COMPRESSED_RGB_S3TC_DXT1_EXT
  gl.compressedTexImage2D(gl.TEXTURE_CUBE_MAP, 0, format, 4, 4, 0, new Uint8Array(8))
  t.equal(gl.getError(), gl.INVALID_ENUM, 'TEXTURE_CUBE_MAP is not an image target')
  gl.compressedTexSubImage2D(gl.TEXTURE_CUBE_MAP, 0, 0, 0, 4, 4, format, new Uint8Array(8))
  t.equal(gl.getError(), gl.INVALID_ENUM, 'TEXTURE_CUBE_MAP is not an image target for sub-uploads')
  t.throws(function () {
    gl.compressedTexImage2D(gl.TEXTURE_2D, 0, format, 4, 4, 0, 8, 0)
  }, TypeError, 'WebGL 1 has no pixel unpack buffer overload')
  gl.getExtension('STACKGL_destroy_context').destroy()
  t.end()
})

tape('compressed uploads from an array view are refused while a pixel unpack buffer is bound', function (t) {
  const gl = createGL()
  const ext = gl.getExtension('WEBGL_compressed_texture_s3tc')
  gl.bindTexture(gl.TEXTURE_2D, gl.createTexture())
  gl.bindBuffer(gl.PIXEL_UNPACK_BUFFER, gl.createBuffer())
  gl.compressedTexImage2D(gl.TEXTURE_2D, 0, ext.COMPRESSED_RGB_S3TC_DXT1_EXT, 4, 4, 0, new Uint8Array(8))
  t.equal(gl.getError(), gl.INVALID_OPERATION)
  gl.getExtension('STACKGL_destroy_context').destroy()
  t.end()
})
