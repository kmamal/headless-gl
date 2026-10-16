const { Linkable } = require('./linkable')
const { gl } = require('./native-gl')

class WebGLQuery extends Linkable {
  constructor (_, ctx) {
    super(_)
    this._ctx = ctx
    this._target = 0
    this._active = false
    this._resultPending = false
  }

  _performDelete () {
    const ctx = this._ctx
    delete ctx._queries[this._ | 0]
    gl.deleteQuery.call(ctx, this._ | 0)
  }
}

module.exports = { WebGLQuery }
