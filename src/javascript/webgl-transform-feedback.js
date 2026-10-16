const { Linkable } = require('./linkable')
const { gl } = require('./native-gl')

class WebGLTransformFeedback extends Linkable {
  constructor (_, ctx) {
    super(_)
    this._ctx = ctx
    this._active = false
    this._paused = false
    this._program = null
    this._bindings = new Array(ctx._maxTransformFeedbackSeparateAttribs).fill(null)
  }

  _performDelete () {
    const ctx = this._ctx
    delete ctx._transformFeedbacks[this._ | 0]
    gl.deleteTransformFeedback.call(ctx, this._ | 0)
  }
}

module.exports = { WebGLTransformFeedback }
