const { gl } = require('../native-gl')
const { initContext } = require('../webgl-context-init')

const OBJECT_TABLES = [
  '_programs', '_shaders', '_buffers', '_textures', '_framebuffers', '_renderbuffers',
  '_vaos', '_samplers', '_queries', '_syncs', '_transformFeedbacks'
]

class WebGLLoseContext {
  constructor (ctx) {
    this._ctx = ctx
  }

  loseContext () {
    const ctx = this._ctx
    if (ctx._contextLost) {
      recordError(ctx, ctx.INVALID_OPERATION)
      return
    }
    drainErrors(ctx)
    markContextLost(ctx, true)
  }

  restoreContext () {
    const ctx = this._ctx
    if (!ctx._contextLost) {
      ctx.setError(ctx.INVALID_OPERATION)
      return
    }
    if (ctx._contextRestorePending) {
      return
    }
    if (!ctx._contextRestorable) {
      recordError(ctx, ctx.INVALID_OPERATION)
      return
    }
    ctx._contextRestorable = false
    ctx._contextRestorePending = true
    setImmediate(function () {
      ctx._contextRestorePending = false
      if (ctx._destroyed || !gl._restoreContext.call(ctx)) { return }
      ctx._contextLost = false
      ctx._contextLostError = ctx.NO_ERROR
      resetContext(ctx)
      drainErrors(ctx)
      dispatch(ctx, 'webglcontextrestored')
    })
  }
}

function invalidateObject (object) {
  object._ctx = null
}

function resetContext (ctx) {
  const extensions = ctx._extensions
  for (const name of OBJECT_TABLES) {
    if (ctx[name]) { Object.values(ctx[name]).forEach(invalidateObject) }
  }
  for (const ext of Object.values(extensions)) {
    if (ext && ext._vaos) { Object.values(ext._vaos).forEach(invalidateObject) }
  }
  initContext(ctx, ctx.drawingBufferWidth, ctx.drawingBufferHeight, ctx._hasWindow)
  if (extensions.webgl_lose_context) { ctx._extensions.webgl_lose_context = extensions.webgl_lose_context }
  ctx._compressedFormats = null
}

function recordError (ctx, error) {
  if (ctx._contextLostError === ctx.NO_ERROR) { ctx._contextLostError = error }
}

function drainErrors (ctx) {
  while (ctx.getError() !== ctx.NO_ERROR) { continue }
}

function markContextLost (ctx, restorable) {
  ctx._contextLost = true
  ctx._contextRestorable = false
  ctx._contextLostError = ctx.CONTEXT_LOST_WEBGL
  setImmediate(function () {
    if (ctx._destroyed) { return }
    const canceled = dispatch(ctx, 'webglcontextlost')
    ctx._contextRestorable = restorable && canceled
  })
}

function dispatch (ctx, type) {
  const canvas = ctx.canvas
  if (!canvas || typeof canvas.dispatchEvent !== 'function') { return true }
  return canvas.dispatchEvent(new Event(type, { cancelable: true })) !== true
}

function getWebGLLoseContext (ctx) {
  return new WebGLLoseContext(ctx)
}

module.exports = { getWebGLLoseContext, WebGLLoseContext, markContextLost }
