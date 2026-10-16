const { Linkable } = require('./linkable')
const { gl } = require('./native-gl')

class WebGLSampler extends Linkable {
  constructor (_, ctx) {
    super(_)
    this._ctx = ctx
  }

  _performDelete () {
    const ctx = this._ctx
    delete ctx._samplers[this._ | 0]
    gl.deleteSampler.call(ctx, this._ | 0)
  }
}

module.exports = { WebGLSampler }
