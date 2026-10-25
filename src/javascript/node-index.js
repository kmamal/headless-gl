const { WebGLContextAttributes } = require('./webgl-context-attributes')
const { WebGLRenderingContext, wrapContext } = require('./webgl-rendering-context')
const { WebGL2RenderingContext } = require('./webgl2-rendering-context')
const { initContext } = require('./webgl-context-init')

let CONTEXT_COUNTER = 0

function flag (options, name, dflt) {
  if (!options || !(typeof options === 'object') || !(name in options)) {
    return dflt
  }
  return !!options[name]
}

function createContext (width, height, options) {
  width = width | 0
  height = height | 0
  if (!(width > 0 && height > 0)) {
    return null
  }

  const contextAttributes = new WebGLContextAttributes(
    flag(options, 'alpha', true),
    flag(options, 'depth', true),
    flag(options, 'stencil', false),
    false, // flag(options, 'antialias', true),
    flag(options, 'premultipliedAlpha', true),
    flag(options, 'preserveDrawingBuffer', false),
    flag(options, 'preferLowPowerToHighPerformance', false),
    flag(options, 'failIfMajorPerformanceCaveat', false),
    flag(options, 'createWebGL2Context', false))

  // Can only use premultipliedAlpha if alpha is set
  contextAttributes.premultipliedAlpha =
    contextAttributes.premultipliedAlpha && contextAttributes.alpha

  let window = null
  let windowHandle = null
  if (options && options.window !== undefined) {
    window = options.window
    if (!window || typeof window !== 'object' || !('native' in window)) {
      throw new Error('window must be an @kmamal/sdl window')
    }
    if (window.destroyed) { throw new Error('window is destroyed') }
    windowHandle = window.native && window.native.gl
    if (!ArrayBuffer.isView(windowHandle)) {
      throw new Error('window has no OpenGL handle, create it with { opengl: true }')
    }
  }
  const hasWindow = window !== null

  const WebGLContext = contextAttributes.createWebGL2Context ? WebGL2RenderingContext : WebGLRenderingContext
  let ctx
  try {
    ctx = new WebGLContext(
      1,
      1,
      contextAttributes.alpha,
      contextAttributes.depth,
      contextAttributes.stencil,
      contextAttributes.antialias,
      contextAttributes.premultipliedAlpha,
      contextAttributes.preserveDrawingBuffer,
      contextAttributes.preferLowPowerToHighPerformance,
      contextAttributes.failIfMajorPerformanceCaveat,
      contextAttributes.createWebGL2Context,
      windowHandle)
  } catch (e) {
    if (hasWindow || e.code === 'ERR_GL_THREAD_CONFLICT') { throw e }
  }
  if (!ctx) {
    return null
  }

  ctx._window = window
  ctx.drawingBufferWidth = width
  ctx.drawingBufferHeight = height

  ctx._ = CONTEXT_COUNTER++

  ctx._contextAttributes = contextAttributes

  initContext(ctx, width, height, hasWindow)

  return wrapContext(ctx)
}

module.exports = createContext
