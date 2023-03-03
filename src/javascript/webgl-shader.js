import { gl } from './native-gl.js'
import { Linkable } from './linkable.js'

export class WebGLShader extends Linkable {
  constructor (_, ctx, type) {
    super(_)
    this._type = type
    this._ctx = ctx
    this._source = ''
    this._compileStatus = false
    this._compileInfo = ''
  }

  _performDelete () {
    const ctx = this._ctx
    delete ctx._shaders[this._ | 0]
    gl.deleteShader.call(ctx, this._ | 0)
  }
}
