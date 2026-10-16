'use strict'

const tape = require('tape')
const createContext = require('../index')

tape('WEBGL_lose_context', function (t) {
  const gl = createContext(8, 8)
  t.ok(gl.getSupportedExtensions().includes('WEBGL_lose_context'))
  const ext = gl.getExtension('WEBGL_lose_context')
  t.ok(ext)
  const events = []
  gl.canvas = new EventTarget()
  gl.canvas.addEventListener('webglcontextlost', (event) => { events.push(event.type); event.preventDefault() })
  gl.canvas.addEventListener('webglcontextrestored', (event) => { events.push(event.type) })

  ext.restoreContext()
  t.equal(gl.getError(), gl.INVALID_OPERATION, 'restoring a live context is an error')
  t.equal(gl.isContextLost(), false)

  ext.loseContext()
  t.equal(gl.isContextLost(), true)
  t.equal(gl.getError(), gl.CONTEXT_LOST_WEBGL, 'reported once')
  t.equal(gl.getError(), gl.NO_ERROR)
  ext.loseContext()
  t.equal(gl.getError(), gl.INVALID_OPERATION, 'losing a lost context is an error')
  ext.restoreContext()
  t.equal(gl.getError(), gl.INVALID_OPERATION, 'restoring before the lost event has fired is an error')
  t.equal(gl.createBuffer(), null, 'creation returns null while lost')
  t.equal(gl.getParameter(gl.VERSION), null)
  t.equal(gl.getExtension('OES_texture_float'), null)
  t.ok(gl.getExtension('STACKGL_destroy_context'), 'STACKGL extensions stay reachable')
  t.equal(gl.isBuffer(null), false)
  t.equal(gl.getAttribLocation(null, 'x'), -1)
  t.equal(gl.getVertexAttribOffset(0, gl.VERTEX_ATTRIB_ARRAY_POINTER), 0)
  t.equal(gl.checkFramebufferStatus(gl.FRAMEBUFFER), gl.FRAMEBUFFER_UNSUPPORTED)
  t.doesNotThrow(() => gl.clear(gl.COLOR_BUFFER_BIT))

  setImmediate(() => {
    t.deepEqual(events, ['webglcontextlost'])
    ext.restoreContext()
    t.equal(gl.getError(), gl.NO_ERROR)
    t.equal(gl.isContextLost(), true, 'restoration is asynchronous')
    setImmediate(() => {
      t.deepEqual(events, ['webglcontextlost', 'webglcontextrestored'])
      t.equal(gl.isContextLost(), false)
      t.notEqual(gl.createBuffer(), null, 'the context works again')
      t.equal(gl.getError(), gl.NO_ERROR)
      gl.getExtension('STACKGL_destroy_context').destroy()
      t.end()
    })
  })
})

tape('WEBGL_lose_context restores a fresh context', function (t) {
  const gl = createContext(8, 8)
  const ext = gl.getExtension('WEBGL_lose_context')
  const s3tc = gl.getExtension('WEBGL_compressed_texture_s3tc')
  const texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.clearColor(1, 0, 0, 1)
  ext.loseContext()
  setImmediate(() => {
    ext.restoreContext()
    setImmediate(() => {
      t.equal(gl.getError(), gl.NO_ERROR)
      t.equal(gl.isContextLost(), false)
      t.equal(gl.isTexture(texture), false, 'old objects are invalid')
      gl.bindTexture(gl.TEXTURE_2D, texture)
      t.equal(gl.getError(), gl.INVALID_OPERATION, 'old objects cannot be bound')
      gl.deleteTexture(texture)
      t.equal(gl.getError(), gl.INVALID_OPERATION, 'old objects cannot be deleted')
      t.equal(gl.getParameter(gl.TEXTURE_BINDING_2D), null, 'bindings are reset')
      t.deepEqual(Array.from(gl.getParameter(gl.COLOR_CLEAR_VALUE)), [0, 0, 0, 0], 'state is reset')
      const fresh = gl.createTexture()
      gl.bindTexture(gl.TEXTURE_2D, fresh)
      if (s3tc) {
        gl.compressedTexImage2D(gl.TEXTURE_2D, 0, s3tc.COMPRESSED_RGB_S3TC_DXT1_EXT, 4, 4, 0, new Uint8Array(8))
        t.equal(gl.getError(), gl.INVALID_ENUM, 'extensions are disabled')
      }
      gl.clearColor(0, 1, 0, 1)
      gl.clear(gl.COLOR_BUFFER_BIT)
      const pixel = new Uint8Array(4)
      gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel)
      t.deepEqual(Array.from(pixel), [0, 255, 0, 255], 'the drawing buffer works')
      gl.getExtension('STACKGL_destroy_context').destroy()
      t.end()
    })
  })
})

tape('WEBGL_lose_context destroyed while a restore is pending', function (t) {
  const gl = createContext(8, 8)
  const ext = gl.getExtension('WEBGL_lose_context')
  ext.loseContext()
  setImmediate(() => {
    ext.restoreContext()
    gl.getExtension('STACKGL_destroy_context').destroy()
    setImmediate(() => setImmediate(() => {
      t.pass('no exception from the pending restore')
      t.end()
    }))
  })
})

tape('WEBGL_lose_context without preventDefault', function (t) {
  const gl = createContext(8, 8)
  const ext = gl.getExtension('WEBGL_lose_context')
  gl.canvas = new EventTarget()
  ext.loseContext()
  t.equal(gl.getError(), gl.CONTEXT_LOST_WEBGL)
  setImmediate(() => {
    ext.restoreContext()
    t.equal(gl.getError(), gl.INVALID_OPERATION, 'not restorable unless the lost event was canceled')
    t.equal(gl.isContextLost(), true)
    gl.getExtension('STACKGL_destroy_context').destroy()
    t.end()
  })
})

tape('WEBGL_lose_context on a WebGL2 context', function (t) {
  const gl = createContext(8, 8, { createWebGL2Context: true })
  const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0)
  gl.getExtension('WEBGL_lose_context').loseContext()
  t.equal(gl.isContextLost(), true)
  t.equal(gl.clientWaitSync(sync, 0, 0), gl.WAIT_FAILED, 'clientWaitSync fails while lost')
  t.equal(gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0), null)
  t.equal(gl.getUniformBlockIndex(null, 'x'), gl.INVALID_INDEX, 'getUniformBlockIndex returns INVALID_INDEX while lost')
  t.equal(gl.getError(), gl.CONTEXT_LOST_WEBGL)
  gl.getExtension('STACKGL_destroy_context').destroy()
  t.end()
})

tape('canvas property can be assigned and read back', function (t) {
  const gl = createContext(8, 8, { createWebGL2Context: true })
  const canvas = { width: 8 }
  gl.canvas = canvas
  t.equal(gl.canvas, canvas)
  gl.getExtension('STACKGL_destroy_context').destroy()
  t.end()
})

tape('WEBGL_lose_context still destroys and resizes a lost context', function (t) {
  const gl = createContext(8, 8)
  const ext = gl.getExtension('WEBGL_lose_context')
  ext.loseContext()
  gl.resize(16, 4)
  t.equal(gl.drawingBufferWidth, 16)
  t.equal(gl.drawingBufferHeight, 4)
  setImmediate(() => {
    ext.restoreContext()
    setImmediate(() => {
      t.equal(gl.isContextLost(), false)
      t.deepEqual(Array.from(gl.getParameter(gl.VIEWPORT)), [0, 0, 16, 4], 'the restored context has the new size')
      ext.loseContext()
      gl.destroy()
      setImmediate(() => {
        ext.restoreContext()
        setImmediate(() => setImmediate(() => {
          t.equal(gl.isContextLost(), true, 'a destroyed context is not restored')
          t.end()
        }))
      })
    })
  })
})

tape('WEBGL_lose_context keeps ASTC profiles available', function (t) {
  const gl = createContext(8, 8)
  const astc = gl.getExtension('WEBGL_compressed_texture_astc')
  gl.getExtension('WEBGL_lose_context').loseContext()
  t.deepEqual(astc.getSupportedProfiles(), ['ldr'])
  gl.destroy()
  t.end()
})
