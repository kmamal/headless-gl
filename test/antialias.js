'use strict'

const tape = require('tape')
const path = require('path')
const createContext = require('../index')
const makeProgram = require('./util/make-program')

const SIZE = 32

function loadSDL () {
  for (const name of ['@kmamal/sdl', path.join(__dirname, '../../sdl')]) {
    try {
      return require(name)
    } catch (error) {}
  }
  return null
}

const sdl = loadSDL()

function openWindow () {
  if (!sdl) { return null }
  try {
    return sdl.video.createWindow({ opengl: true, hidden: true, width: SIZE, height: SIZE })
  } catch (error) {
    return null
  }
}

const probeWindow = openWindow()
const hasWindow = probeWindow !== null
if (probeWindow) { probeWindow.destroy() }

const variants = [
  { name: 'WebGL 1', options: {} },
  { name: 'WebGL 2', options: { createWebGL2Context: true } }
]

function createHeadless (options) {
  const gl = createContext(SIZE, SIZE, options)
  return { gl, window: null }
}

function createWindowed (options) {
  const window = openWindow()
  const gl = createContext(SIZE, SIZE, { ...options, window })
  return { gl, window }
}

function destroy ({ gl, window }) {
  gl.getExtension('STACKGL_destroy_context').destroy()
  if (window) { window.destroy() }
}

function drawDiagonal (gl) {
  const program = makeProgram(gl,
    'attribute vec2 position; void main() { gl_Position = vec4(position, 0, 1); }',
    'precision mediump float; void main() { gl_FragColor = vec4(1, 1, 1, 1); }')
  gl.useProgram(program)
  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1.3]), gl.STATIC_DRAW)
  gl.enableVertexAttribArray(0)
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
  gl.viewport(0, 0, SIZE, SIZE)
  gl.clearColor(0, 0, 0, 1)
  gl.clear(gl.COLOR_BUFFER_BIT)
  gl.drawArrays(gl.TRIANGLES, 0, 3)
  gl.disableVertexAttribArray(0)
  gl.bindBuffer(gl.ARRAY_BUFFER, null)
  gl.deleteBuffer(buffer)
  gl.useProgram(null)
  gl.deleteProgram(program)
}

function readAll (gl) {
  const pixels = new Uint8Array(SIZE * SIZE * 4)
  gl.readPixels(0, 0, SIZE, SIZE, gl.RGBA, gl.UNSIGNED_BYTE, pixels)
  return pixels
}

function intermediateCount (pixels) {
  let count = 0
  for (let i = 0; i < pixels.length; i += 4) {
    if (pixels[i] > 0 && pixels[i] < 255) { ++count }
  }
  return count
}

function readTexture (gl, texture) {
  const framebuffer = gl.createFramebuffer()
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)
  const pixels = readAll(gl)
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  gl.deleteFramebuffer(framebuffer)
  return pixels
}

function createTexture (gl) {
  const texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, SIZE, SIZE, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
  return texture
}

function checkAntialiased (t, gl) {
  t.equal(gl.getContextAttributes().antialias, true, 'antialias is reported')
  t.ok(gl.getParameter(gl.SAMPLES) > 1, 'SAMPLES of the default framebuffer')
  t.equal(gl.getParameter(gl.SAMPLE_BUFFERS), 1, 'SAMPLE_BUFFERS of the default framebuffer')

  drawDiagonal(gl)
  const pixels = readAll(gl)
  t.equal(gl.getError(), gl.NO_ERROR, 'readPixels from the default framebuffer')
  t.ok(intermediateCount(pixels) > 0, 'the diagonal edge has intermediate values')

  const texture = createTexture(gl)
  gl.copyTexSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 0, 0, SIZE, SIZE)
  t.equal(gl.getError(), gl.NO_ERROR, 'copyTexSubImage2D from the default framebuffer')
  t.deepEqual(readTexture(gl, texture), pixels, 'copyTexSubImage2D copies the resolved pixels')

  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.copyTexImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 0, 0, SIZE, SIZE, 0)
  t.equal(gl.getError(), gl.NO_ERROR, 'copyTexImage2D from the default framebuffer')
  t.deepEqual(readTexture(gl, texture), pixels, 'copyTexImage2D copies the resolved pixels')
  t.equal(gl.getError(), gl.NO_ERROR, 'no errors')

  const framebuffer = gl.createFramebuffer()
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)
  t.equal(gl.getParameter(gl.SAMPLES), 0, 'SAMPLES of a single sampled framebuffer')
  t.equal(gl.getParameter(gl.SAMPLE_BUFFERS), 0, 'SAMPLE_BUFFERS of a single sampled framebuffer')
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  gl.deleteFramebuffer(framebuffer)
  gl.deleteTexture(texture)

  gl.enable(gl.SCISSOR_TEST)
  gl.scissor(0, 0, 1, 1)
  t.deepEqual(readAll(gl), pixels, 'the scissor test does not affect reads')
  gl.disable(gl.SCISSOR_TEST)
  gl.scissor(0, 0, SIZE, SIZE)

  const pixel = new Uint8Array(4)
  gl.readPixels(SIZE - 1, SIZE - 1, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel)
  t.deepEqual(Array.from(pixel), Array.from(pixels.subarray(pixels.length - 4)), 'partial reads')

  if (gl.drawBuffers) {
    gl.drawBuffers([gl.BACK])
    gl.readBuffer(gl.BACK)
    t.equal(gl.getError(), gl.NO_ERROR, 'drawBuffers and readBuffer on the default framebuffer')
  } else {
    const ext = gl.getExtension('WEBGL_draw_buffers')
    if (ext) {
      ext.drawBuffersWEBGL([gl.BACK])
      t.equal(gl.getError(), gl.NO_ERROR, 'drawBuffersWEBGL on the default framebuffer')
    }
  }
}

function checkAliased (t, gl) {
  t.equal(gl.getContextAttributes().antialias, false, 'antialias is reported')
  t.equal(gl.getParameter(gl.SAMPLES), 0, 'SAMPLES of the default framebuffer')
  t.equal(gl.getParameter(gl.SAMPLE_BUFFERS), 0, 'SAMPLE_BUFFERS of the default framebuffer')

  drawDiagonal(gl)
  const pixels = readAll(gl)
  t.equal(intermediateCount(pixels), 0, 'the diagonal edge has no intermediate values')

  const texture = createTexture(gl)
  gl.copyTexSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 0, 0, SIZE, SIZE)
  t.equal(gl.getError(), gl.NO_ERROR, 'copyTexSubImage2D from the default framebuffer')
  t.deepEqual(readTexture(gl, texture), pixels, 'copyTexSubImage2D copies the pixels')
  gl.deleteTexture(texture)
}

function checkResize (t, gl) {
  const resize = gl.getExtension('STACKGL_resize_drawingbuffer')
  resize.resize(SIZE * 2, SIZE + 3)
  t.equal(gl.getParameter(gl.SAMPLE_BUFFERS), 1, 'still multisampled after resize')
  gl.viewport(0, 0, SIZE * 2, SIZE + 3)
  gl.clearColor(1, 0, 0, 1)
  gl.clear(gl.COLOR_BUFFER_BIT)
  const pixel = new Uint8Array(4)
  gl.readPixels(SIZE * 2 - 1, SIZE + 2, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel)
  t.deepEqual(Array.from(pixel), [255, 0, 0, 255], 'the resized drawing buffer covers the new size')
  t.equal(gl.getError(), gl.NO_ERROR, 'no errors after resize')
  resize.resize(SIZE, SIZE)
}

for (const { name, options } of variants) {
  tape(`antialias ${name} headless`, function (t) {
    const context = createHeadless(options)
    checkAntialiased(t, context.gl)
    checkResize(t, context.gl)
    checkAntialiased(t, context.gl)
    destroy(context)
    t.end()
  })

  tape(`antialias ${name} headless without antialias`, function (t) {
    const context = createHeadless({ ...options, antialias: false })
    checkAliased(t, context.gl)
    destroy(context)
    t.end()
  })

  tape(`antialias ${name} headless depth and stencil`, function (t) {
    for (const attributes of [
      { alpha: false },
      { depth: false },
      { stencil: true },
      { depth: false, stencil: true }
    ]) {
      const context = createHeadless({ ...options, ...attributes })
      const { gl } = context
      t.equal(gl.getContextAttributes().antialias, true, `antialias with ${JSON.stringify(attributes)}`)
      t.equal(gl.checkFramebufferStatus(gl.FRAMEBUFFER), gl.FRAMEBUFFER_COMPLETE, 'complete')
      t.equal(gl.getParameter(gl.DEPTH_BITS) > 0, gl.getContextAttributes().depth, 'depth bits')
      t.equal(gl.getParameter(gl.STENCIL_BITS) > 0, gl.getContextAttributes().stencil, 'stencil bits')
      drawDiagonal(gl)
      const pixels = readAll(gl)
      t.ok(intermediateCount(pixels) > 0, 'intermediate values')
      if (attributes.alpha === false) {
        t.equal(pixels[3], 255, 'opaque without alpha')
      }
      destroy(context)
    }
    t.end()
  })

  tape(`antialias ${name} window`, { skip: !hasWindow }, function (t) {
    const context = createWindowed(options)
    const { gl } = context
    checkAntialiased(t, gl)
    gl.swap()
    t.equal(gl.getError(), gl.NO_ERROR, 'swap')
    t.deepEqual(Array.from(readAll(gl).subarray(0, 4)), [0, 0, 0, 0], 'the drawing buffer is cleared after swap')
    checkResize(t, gl)
    drawDiagonal(gl)
    gl.swap()
    t.equal(gl.getError(), gl.NO_ERROR, 'swap after resize')
    destroy(context)
    t.end()
  })

  tape(`antialias ${name} window preserveDrawingBuffer`, { skip: !hasWindow }, function (t) {
    const context = createWindowed({ ...options, preserveDrawingBuffer: true })
    const { gl } = context
    drawDiagonal(gl)
    const pixels = readAll(gl)
    gl.swap()
    t.equal(gl.getError(), gl.NO_ERROR, 'swap')
    t.deepEqual(readAll(gl), pixels, 'the drawing buffer is preserved after swap')
    destroy(context)
    t.end()
  })

  tape(`antialias ${name} window without antialias`, { skip: !hasWindow }, function (t) {
    const context = createWindowed({ ...options, antialias: false })
    const { gl } = context
    checkAliased(t, gl)
    gl.swap()
    t.equal(gl.getError(), gl.NO_ERROR, 'swap')
    destroy(context)
    t.end()
  })
}

for (const { name, options } of variants) {
  tape(`antialias ${name} keeps pending errors`, function (t) {
    const context = createHeadless(options)
    const { gl } = context
    const texture = createTexture(gl)
    const pendingErrors = function (message) {
      const errors = [gl.getError(), gl.getError(), gl.getError()]
      t.deepEqual(errors.sort(), [gl.INVALID_ENUM, gl.INVALID_VALUE, gl.NO_ERROR].sort(), message)
    }
    gl.bindFramebuffer(0x1234, null)
    gl.viewport(0, 0, -1, -1)
    readAll(gl)
    pendingErrors('both pending errors survive readPixels')
    gl.bindFramebuffer(0x1234, null)
    gl.viewport(0, 0, -1, -1)
    gl.copyTexSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 0, 0, SIZE, SIZE)
    pendingErrors('both pending errors survive copyTexSubImage2D')
    gl.deleteTexture(texture)
    destroy(context)
    t.end()
  })

  tape(`antialias ${name} window without alpha`, { skip: !hasWindow }, function (t) {
    for (const antialias of [true, false]) {
      const context = createWindowed({ ...options, antialias, alpha: false })
      const { gl } = context
      gl.clearColor(1, 0, 0, 0.5)
      gl.clear(gl.COLOR_BUFFER_BIT)
      const pixel = new Uint8Array(4)
      gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel)
      t.deepEqual(Array.from(pixel), [255, 0, 0, 255], `opaque with antialias: ${antialias}`)
      t.doesNotThrow(() => gl.swap(), `swap with antialias: ${antialias}`)
      t.equal(gl.getError(), gl.NO_ERROR, 'no errors')
      destroy(context)
    }
    t.end()
  })

  tape(`antialias ${name} window depth and stencil`, { skip: !hasWindow }, function (t) {
    for (const antialias of [true, false]) {
      const context = createWindowed({ ...options, antialias, stencil: true })
      const { gl } = context
      t.ok(gl.getParameter(gl.DEPTH_BITS) > 0, `depth bits with antialias: ${antialias}`)
      t.ok(gl.getParameter(gl.STENCIL_BITS) > 0, `stencil bits with antialias: ${antialias}`)
      destroy(context)
    }
    t.end()
  })
}

tape('antialias WebGL 2 window swap with NONE read and draw buffers', { skip: !hasWindow }, function (t) {
  const context = createWindowed({ createWebGL2Context: true })
  const { gl } = context
  drawDiagonal(gl)
  gl.readBuffer(gl.NONE)
  gl.drawBuffers([gl.NONE])
  gl.swap()
  t.equal(gl.getError(), gl.NO_ERROR, 'swap')
  t.equal(gl.getParameter(gl.READ_BUFFER), gl.NONE, 'read buffer restored')
  t.equal(gl.getParameter(gl.DRAW_BUFFER0), gl.NONE, 'draw buffer restored')
  gl.clearColor(1, 0, 0, 1)
  gl.clear(gl.COLOR_BUFFER_BIT)
  gl.drawBuffers([gl.BACK])
  gl.readBuffer(gl.BACK)
  t.deepEqual(Array.from(readAll(gl).subarray(0, 4)), [0, 0, 0, 0], 'the drawing buffer is cleared after swap and clear still draws nothing')
  gl.clear(gl.COLOR_BUFFER_BIT)
  gl.readBuffer(gl.NONE)
  gl.swap()

  const texture = createTexture(gl)
  const framebuffer = gl.createFramebuffer()
  gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, framebuffer)
  gl.framebufferTexture2D(gl.DRAW_FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)
  gl.clearColor(0, 1, 0, 1)
  gl.clear(gl.COLOR_BUFFER_BIT)
  gl.blitFramebuffer(0, 0, SIZE, SIZE, 0, 0, SIZE, SIZE, gl.COLOR_BUFFER_BIT, gl.NEAREST)
  t.equal(gl.getError(), gl.INVALID_OPERATION, 'blitFramebuffer still sees a NONE read buffer')
  t.deepEqual(Array.from(readTexture(gl, texture).subarray(0, 4)), [0, 255, 0, 255], 'blitFramebuffer copies nothing')
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  gl.deleteFramebuffer(framebuffer)
  gl.deleteTexture(texture)
  gl.readBuffer(gl.BACK)
  t.equal(gl.getError(), gl.NO_ERROR, 'no errors')
  destroy(context)
  t.end()
})

tape('antialias WebGL 1 window swap with a NONE draw buffer', { skip: !hasWindow }, function (t) {
  const context = createWindowed({})
  const { gl } = context
  const ext = gl.getExtension('WEBGL_draw_buffers')
  if (!ext) {
    destroy(context)
    t.end()
    return
  }
  drawDiagonal(gl)
  ext.drawBuffersWEBGL([gl.NONE])
  gl.swap()
  t.equal(gl.getError(), gl.NO_ERROR, 'swap')
  t.equal(gl.getParameter(ext.DRAW_BUFFER0_WEBGL), gl.NONE, 'draw buffer restored')
  gl.clearColor(1, 0, 0, 1)
  gl.clear(gl.COLOR_BUFFER_BIT)
  ext.drawBuffersWEBGL([gl.BACK])
  t.deepEqual(Array.from(readAll(gl).subarray(0, 4)), [0, 0, 0, 0], 'the drawing buffer is cleared after swap and clear still draws nothing')
  destroy(context)
  t.end()
})

tape('antialias WebGL 2 copyTexSubImage3D and blitFramebuffer', function (t) {
  const context = createHeadless({ createWebGL2Context: true })
  const { gl } = context
  drawDiagonal(gl)
  const pixels = readAll(gl)

  const array = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D_ARRAY, array)
  gl.texStorage3D(gl.TEXTURE_2D_ARRAY, 1, gl.RGBA8, SIZE, SIZE, 1)
  gl.copyTexSubImage3D(gl.TEXTURE_2D_ARRAY, 0, 0, 0, 0, 0, 0, SIZE, SIZE)
  t.equal(gl.getError(), gl.NO_ERROR, 'copyTexSubImage3D from the default framebuffer')
  const framebuffer = gl.createFramebuffer()
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
  gl.framebufferTextureLayer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, array, 0, 0)
  t.deepEqual(readAll(gl), pixels, 'copyTexSubImage3D copies the resolved pixels')

  const texture = createTexture(gl)
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)
  gl.bindFramebuffer(gl.READ_FRAMEBUFFER, null)
  gl.blitFramebuffer(0, 0, SIZE, SIZE, 0, 0, SIZE, SIZE, gl.COLOR_BUFFER_BIT, gl.NEAREST)
  t.equal(gl.getError(), gl.NO_ERROR, 'blitFramebuffer from the default framebuffer')
  t.deepEqual(readTexture(gl, texture), pixels, 'blitFramebuffer resolves the default framebuffer')

  gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, framebuffer)
  gl.blitFramebuffer(0, 0, SIZE, SIZE, 0, 0, SIZE / 2, SIZE / 2, gl.COLOR_BUFFER_BIT, gl.LINEAR)
  t.equal(gl.getError(), gl.NO_ERROR, 'scaled blitFramebuffer from the default framebuffer')

  gl.bindFramebuffer(gl.READ_FRAMEBUFFER, framebuffer)
  gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null)
  gl.blitFramebuffer(0, 0, SIZE, SIZE, 0, 0, SIZE, SIZE, gl.COLOR_BUFFER_BIT, gl.NEAREST)
  t.equal(gl.getError(), gl.INVALID_OPERATION, 'blitFramebuffer into the multisampled default framebuffer')

  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  t.equal(gl.getParameter(gl.READ_FRAMEBUFFER_BINDING), null, 'read binding restored')
  t.deepEqual(readAll(gl), pixels, 'the default framebuffer is untouched')
  t.equal(gl.getError(), gl.NO_ERROR, 'no errors')
  destroy(context)
  t.end()
})

tape('antialias WebGL 2 stretched LINEAR blit of part of the default framebuffer', function (t) {
  const results = []
  for (const antialias of [false, true]) {
    const context = createHeadless({ createWebGL2Context: true, antialias })
    const { gl } = context
    gl.clearColor(0, 1, 0, 1)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.enable(gl.SCISSOR_TEST)
    gl.scissor(0, 0, SIZE / 2, SIZE)
    gl.clearColor(1, 0, 0, 1)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.disable(gl.SCISSOR_TEST)
    const texture = createTexture(gl)
    const framebuffer = gl.createFramebuffer()
    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, framebuffer)
    gl.framebufferTexture2D(gl.DRAW_FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)
    gl.blitFramebuffer(SIZE / 4, 0, SIZE / 2, SIZE, 0, 0, SIZE, SIZE, gl.COLOR_BUFFER_BIT, gl.LINEAR)
    t.equal(gl.getError(), gl.NO_ERROR, `blitFramebuffer with antialias: ${antialias}`)
    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null)
    results.push(readTexture(gl, texture))
    gl.deleteFramebuffer(framebuffer)
    gl.deleteTexture(texture)
    destroy(context)
  }
  t.deepEqual(results[1], results[0], 'samples outside the source rectangle are resolved')
  t.end()
})

tape('antialias WebGL 1 does not expose WebGL 2 framebuffer enums', function (t) {
  const context = createHeadless({})
  const { gl } = context
  t.equal(gl.getContextAttributes().antialias, true, 'antialias is enabled')
  gl.bindFramebuffer(0x8CA8, null)
  t.equal(gl.getError(), gl.INVALID_ENUM, 'bindFramebuffer(READ_FRAMEBUFFER)')
  gl.checkFramebufferStatus(0x8CA9)
  t.equal(gl.getError(), gl.INVALID_ENUM, 'checkFramebufferStatus(DRAW_FRAMEBUFFER)')
  t.equal(gl.getParameter(0x8D57), null, 'getParameter(MAX_SAMPLES)')
  t.equal(gl.getError(), gl.INVALID_ENUM, 'MAX_SAMPLES is a WebGL 2 parameter')
  const renderbuffer = gl.createRenderbuffer()
  gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer)
  gl.renderbufferStorage(gl.RENDERBUFFER, 0x8058, 4, 4)
  t.equal(gl.getError(), gl.INVALID_ENUM, 'renderbufferStorage(RGBA8)')
  destroy(context)
  t.end()
})

tape('antialias lose and restore context', function (t) {
  const gl = createContext(SIZE, SIZE, { createWebGL2Context: true })
  const ext = gl.getExtension('WEBGL_lose_context')
  ext.loseContext()
  setImmediate(function () {
    ext.restoreContext()
    setTimeout(function () {
      t.equal(gl.isContextLost(), false, 'restored')
      t.equal(gl.getParameter(gl.SAMPLE_BUFFERS), 1, 'multisampled after restore')
      drawDiagonal(gl)
      t.ok(intermediateCount(readAll(gl)) > 0, 'intermediate values after restore')
      gl.getExtension('STACKGL_destroy_context').destroy()
      t.end()
    }, 10)
  })
})
