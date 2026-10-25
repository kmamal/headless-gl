class WebGLDrawingBufferWrapper {
  constructor (framebuffer, color, depthStencil, samples = 0, resolveFramebuffer = 0, resolveColor = 0) {
    this._framebuffer = framebuffer
    this._color = color
    this._depthStencil = depthStencil
    this._samples = samples
    this._resolveFramebuffer = resolveFramebuffer
    this._resolveColor = resolveColor
    this._width = 0
    this._height = 0
    this._presentDirect = true
  }
}

module.exports = { WebGLDrawingBufferWrapper }
