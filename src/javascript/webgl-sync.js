const { Linkable } = require('./linkable')
const { gl } = require('./native-gl')

class WebGLSync extends Linkable {
  constructor (_, ctx) {
    super(_)
    this._ctx = ctx
    this._pending = true
  }

  _performDelete () {
    const ctx = this._ctx
    delete ctx._syncs[this._ | 0]
    gl.deleteSync.call(ctx, this._ | 0)
  }
}

module.exports = { WebGLSync }
