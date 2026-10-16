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
      contextAttributes.createWebGL2Context)
  } catch (e) {}
  if (!ctx) {
    return null
  }

  ctx.drawingBufferWidth = width
  ctx.drawingBufferHeight = height

  ctx._ = CONTEXT_COUNTER++

  ctx._contextAttributes = contextAttributes

  initContext(ctx, width, height)

  return wrapContext(ctx)
}

module.exports = createContext
