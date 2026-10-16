const bits = require('bit-twiddle')
const { WebGLTextureUnit } = require('./webgl-texture-unit')
const { WebGLTransformFeedback } = require('./webgl-transform-feedback')
const { WebGLVertexArrayObjectState, WebGLVertexArrayGlobalState } = require('./webgl-vertex-attribute')

function initContext (ctx, width, height) {
  ctx._extensions = {}
  ctx._programs = {}
  ctx._shaders = {}
  ctx._buffers = {}
  ctx._textures = {}
  ctx._framebuffers = {}
  ctx._renderbuffers = {}

  ctx._activeProgram = null
  ctx._activeFramebuffers = { read: null, draw: null }
  ctx._activeRenderbuffer = null
  ctx._checkStencil = false
  ctx._stencilState = true

  ctx._otherBufferBindings = {}
  ctx._indexedBufferBindings = {}

  if (ctx._isWebGL2()) {
    ctx._vaos = {}
    ctx._activeVertexArrayObject = null
    ctx._samplers = {}
    ctx._queries = {}
    ctx._activeQueries = {}
    ctx._syncs = {}
    ctx._transformFeedbacks = {}
    ctx._maxTransformFeedbackSeparateAttribs = ctx.getParameter(ctx.MAX_TRANSFORM_FEEDBACK_SEPARATE_ATTRIBS)
    ctx._defaultTransformFeedback = new WebGLTransformFeedback(0, ctx)
    ctx._activeTransformFeedback = ctx._defaultTransformFeedback

    ctx._indexedBufferBindings[ctx.UNIFORM_BUFFER] =
      new Array(ctx.getParameter(ctx.MAX_UNIFORM_BUFFER_BINDINGS)).fill(null)
    ctx._indexedBufferBindings[ctx.TRANSFORM_FEEDBACK_BUFFER] = ctx._defaultTransformFeedback._bindings
    ctx._uniformBufferOffsetAlignment = ctx.getParameter(ctx.UNIFORM_BUFFER_OFFSET_ALIGNMENT)
    ctx._maxDrawBuffers = ctx.getParameter(ctx.MAX_DRAW_BUFFERS)
    ctx._maxColorAttachments = ctx.getParameter(ctx.MAX_COLOR_ATTACHMENTS)
    ctx._defaultReadBuffer = ctx.BACK
    ctx._defaultDrawBuffer = ctx.BACK
  }

  // Initialize texture units
  const numTextures = ctx.getParameter(ctx.MAX_COMBINED_TEXTURE_IMAGE_UNITS)
  ctx._textureUnits = new Array(numTextures)
  for (let i = 0; i < numTextures; ++i) {
    ctx._textureUnits[i] = new WebGLTextureUnit(ctx, i)
  }
  ctx._activeTextureUnit = 0
  ctx.activeTexture(ctx.TEXTURE0)

  ctx._errorStack = []

  // Vertex array attributes that are in vertex array objects.
  ctx._defaultVertexObjectState = new WebGLVertexArrayObjectState(ctx)
  ctx._vertexObjectState = ctx._defaultVertexObjectState

  // Vertex array attibures that are not in vertex array objects.
  ctx._vertexGlobalState = new WebGLVertexArrayGlobalState(ctx)

  // Store limits
  ctx._maxTextureSize = ctx.getParameter(ctx.MAX_TEXTURE_SIZE)
  ctx._maxTextureLevel = bits.log2(bits.nextPow2(ctx._maxTextureSize))
  ctx._maxCubeMapSize = ctx.getParameter(ctx.MAX_CUBE_MAP_TEXTURE_SIZE)
  ctx._maxCubeMapLevel = bits.log2(bits.nextPow2(ctx._maxCubeMapSize))

  // Unpack alignment
  ctx._unpackAlignment = 4
  ctx._packAlignment = 4

  // Allocate framebuffer
  ctx._allocateDrawingBuffer(width, height)

  const attrib0Buffer = ctx.createBuffer()
  ctx._attrib0Buffer = attrib0Buffer

  // Initialize defaults
  ctx.bindBuffer(ctx.ARRAY_BUFFER, null)
  ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, null)
  ctx.bindFramebuffer(ctx.FRAMEBUFFER, null)
  ctx.bindRenderbuffer(ctx.RENDERBUFFER, null)

  // Set viewport and scissor
  ctx.viewport(0, 0, width, height)
  ctx.scissor(0, 0, width, height)

  // Clear buffers
  ctx.clearDepth(1)
  ctx.clearColor(0, 0, 0, 0)
  ctx.clearStencil(0)
  ctx.clear(ctx.COLOR_BUFFER_BIT | ctx.DEPTH_BUFFER_BIT | ctx.STENCIL_BUFFER_BIT)
}

module.exports = { initContext }
