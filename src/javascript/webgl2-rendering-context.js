const { gl, NativeWebGL } = require('./native-gl')
const { WebGLRenderingContextHelper } = require('./webgl-rendering-context')
const { WebGLProgram } = require('./webgl-program')
const { WebGLBuffer } = require('./webgl-buffer')
const { WebGLSampler } = require('./webgl-sampler')
const { WebGLQuery } = require('./webgl-query')
const { WebGLSync } = require('./webgl-sync')
const { WebGLTransformFeedback } = require('./webgl-transform-feedback')
const { WebGLActiveInfo } = require('./webgl-active-info')
const { checkObject, isValidString, typeSize, toIntPtr } = require('./utils')

const MAX_IDENTIFIER_LENGTH = 1024

const MAX_CLIENT_WAIT_TIMEOUT = 1000000000

function isSequence (value) {
  return value !== null && typeof value === 'object' &&
    (Array.isArray(value) || ArrayBuffer.isView(value) || typeof value[Symbol.iterator] === 'function')
}

class WebGL2RenderingContext extends WebGLRenderingContextHelper {
  _uniformData (Type, value, srcOffset, srcLength, name) {
    if (typeof value !== 'object' || value === null || typeof value.length !== 'number') {
      throw new TypeError(name + '(WebGLUniformLocation, Array)')
    }
    srcOffset |= 0
    srcLength |= 0
    if (srcOffset < 0 || srcLength < 0 ||
      srcOffset > value.length ||
      srcOffset + srcLength > value.length) {
      this.setError(this.INVALID_VALUE)
      return null
    }
    const data = value instanceof Type ? value : Type.from(value)
    const end = srcLength ? srcOffset + srcLength : data.length
    if (srcOffset === 0 && end === data.length) {
      return data
    }
    return data.subarray(srcOffset, end)
  }

  _checkUniformMatrixValue (location, value, name, size) {
    if (!checkObject(location)) {
      throw new TypeError(name + '(WebGLUniformLocation, Boolean, Array)')
    }
    if (!location) {
      return false
    }
    if (!this._checkLocationActive(location)) {
      return false
    }
    if (value.length === size) {
      return true
    } else if (value.length === 0 || value.length % size !== 0) {
      this.setError(this.INVALID_VALUE)
      return false
    } else if (location._array) {
      return true
    }
    this.setError(this.INVALID_OPERATION)
    return false
  }

  _checkProgramIndex (program, index, pname, name) {
    if (!program || !checkObject(program)) {
      throw new TypeError(name + '(WebGLProgram, ...)')
    }
    if (!this._checkWrapper(program, WebGLProgram)) {
      return false
    }
    if (!program._linkStatus) {
      this.setError(this.INVALID_OPERATION)
      return false
    }
    if (index < 0 || index >= gl.getProgramParameter.call(this, program._ | 0, pname)) {
      this.setError(this.INVALID_VALUE)
      return false
    }
    return true
  }

  getAttachedShaders (program) {
    if (!program) {
      throw new TypeError('getAttachedShaders(WebGLProgram)')
    }
    return super.getAttachedShaders(program)
  }

  getUniformBlockIndex (program, uniformBlockName) {
    if (!program) {
      throw new TypeError('getUniformBlockIndex(WebGLProgram, String)')
    }
    return super.getUniformBlockIndex(program, uniformBlockName)
  }

  uniformBlockBinding (program, uniformBlockIndex, uniformBlockBinding) {
    if (!program) {
      throw new TypeError('uniformBlockBinding(WebGLProgram, GLuint, GLuint)')
    }
    return super.uniformBlockBinding(program, uniformBlockIndex, uniformBlockBinding)
  }

  getProgramParameter (program, pname) {
    pname |= 0
    if (pname === this.ACTIVE_UNIFORM_BLOCKS ||
      pname === this.TRANSFORM_FEEDBACK_BUFFER_MODE ||
      pname === this.TRANSFORM_FEEDBACK_VARYINGS) {
      if (!checkObject(program)) {
        throw new TypeError('getProgramParameter(WebGLProgram, GLenum)')
      } else if (this._checkWrapper(program, WebGLProgram)) {
        return gl.getProgramParameter.call(this, program._ | 0, pname)
      }
      return null
    }
    return super.getProgramParameter(program, pname)
  }

  uniform1ui (location, v0) {
    if (!this._checkUniformValid(location, v0, 'uniform1ui', 1, 'ui')) return
    super.uniform1ui(location._ | 0, v0 >>> 0)
  }

  uniform2ui (location, v0, v1) {
    if (!this._checkUniformValid(location, v0, 'uniform2ui', 2, 'ui')) return
    super.uniform2ui(location._ | 0, v0 >>> 0, v1 >>> 0)
  }

  uniform3ui (location, v0, v1, v2) {
    if (!this._checkUniformValid(location, v0, 'uniform3ui', 3, 'ui')) return
    super.uniform3ui(location._ | 0, v0 >>> 0, v1 >>> 0, v2 >>> 0)
  }

  uniform4ui (location, v0, v1, v2, v3) {
    if (!this._checkUniformValid(location, v0, 'uniform4ui', 4, 'ui')) return
    super.uniform4ui(location._ | 0, v0 >>> 0, v1 >>> 0, v2 >>> 0, v3 >>> 0)
  }

  uniform1uiv (location, value, srcOffset, srcLength) {
    value = this._uniformData(Uint32Array, value, srcOffset, srcLength, 'uniform1uiv')
    if (!value) return
    if (!this._checkUniformValueValid(location, value, 'uniform1uiv', 1, 'ui')) return
    super.uniform1uiv(location._ | 0, value)
  }

  uniform2uiv (location, value, srcOffset, srcLength) {
    value = this._uniformData(Uint32Array, value, srcOffset, srcLength, 'uniform2uiv')
    if (!value) return
    if (!this._checkUniformValueValid(location, value, 'uniform2uiv', 2, 'ui')) return
    super.uniform2uiv(location._ | 0, value)
  }

  uniform3uiv (location, value, srcOffset, srcLength) {
    value = this._uniformData(Uint32Array, value, srcOffset, srcLength, 'uniform3uiv')
    if (!value) return
    if (!this._checkUniformValueValid(location, value, 'uniform3uiv', 3, 'ui')) return
    super.uniform3uiv(location._ | 0, value)
  }

  uniform4uiv (location, value, srcOffset, srcLength) {
    value = this._uniformData(Uint32Array, value, srcOffset, srcLength, 'uniform4uiv')
    if (!value) return
    if (!this._checkUniformValueValid(location, value, 'uniform4uiv', 4, 'ui')) return
    super.uniform4uiv(location._ | 0, value)
  }

  uniform1fv (location, value, srcOffset, srcLength) {
    if (arguments.length > 2) {
      value = this._uniformData(Float32Array, value, srcOffset, srcLength, 'uniform1fv')
      if (!value) return
    }
    return super.uniform1fv(location, value)
  }

  uniform2fv (location, value, srcOffset, srcLength) {
    if (arguments.length > 2) {
      value = this._uniformData(Float32Array, value, srcOffset, srcLength, 'uniform2fv')
      if (!value) return
    }
    return super.uniform2fv(location, value)
  }

  uniform3fv (location, value, srcOffset, srcLength) {
    if (arguments.length > 2) {
      value = this._uniformData(Float32Array, value, srcOffset, srcLength, 'uniform3fv')
      if (!value) return
    }
    return super.uniform3fv(location, value)
  }

  uniform4fv (location, value, srcOffset, srcLength) {
    if (arguments.length > 2) {
      value = this._uniformData(Float32Array, value, srcOffset, srcLength, 'uniform4fv')
      if (!value) return
    }
    return super.uniform4fv(location, value)
  }

  uniform1iv (location, value, srcOffset, srcLength) {
    if (arguments.length > 2) {
      value = this._uniformData(Int32Array, value, srcOffset, srcLength, 'uniform1iv')
      if (!value) return
    }
    return super.uniform1iv(location, value)
  }

  uniform2iv (location, value, srcOffset, srcLength) {
    if (arguments.length > 2) {
      value = this._uniformData(Int32Array, value, srcOffset, srcLength, 'uniform2iv')
      if (!value) return
    }
    return super.uniform2iv(location, value)
  }

  uniform3iv (location, value, srcOffset, srcLength) {
    if (arguments.length > 2) {
      value = this._uniformData(Int32Array, value, srcOffset, srcLength, 'uniform3iv')
      if (!value) return
    }
    return super.uniform3iv(location, value)
  }

  uniform4iv (location, value, srcOffset, srcLength) {
    if (arguments.length > 2) {
      value = this._uniformData(Int32Array, value, srcOffset, srcLength, 'uniform4iv')
      if (!value) return
    }
    return super.uniform4iv(location, value)
  }

  uniformMatrix2fv (location, transpose, value, srcOffset, srcLength) {
    value = this._uniformData(Float32Array, value, srcOffset, srcLength, 'uniformMatrix2fv')
    if (!value) return
    if (!this._checkUniformMatrixValue(location, value, 'uniformMatrix2fv', 4)) return
    gl.uniformMatrix2fv.call(this, location._ | 0, !!transpose, value)
  }

  uniformMatrix3fv (location, transpose, value, srcOffset, srcLength) {
    value = this._uniformData(Float32Array, value, srcOffset, srcLength, 'uniformMatrix3fv')
    if (!value) return
    if (!this._checkUniformMatrixValue(location, value, 'uniformMatrix3fv', 9)) return
    gl.uniformMatrix3fv.call(this, location._ | 0, !!transpose, value)
  }

  uniformMatrix4fv (location, transpose, value, srcOffset, srcLength) {
    value = this._uniformData(Float32Array, value, srcOffset, srcLength, 'uniformMatrix4fv')
    if (!value) return
    if (!this._checkUniformMatrixValue(location, value, 'uniformMatrix4fv', 16)) return
    gl.uniformMatrix4fv.call(this, location._ | 0, !!transpose, value)
  }

  uniformMatrix2x3fv (location, transpose, value, srcOffset, srcLength) {
    value = this._uniformData(Float32Array, value, srcOffset, srcLength, 'uniformMatrix2x3fv')
    if (!value) return
    if (!this._checkUniformMatrixValue(location, value, 'uniformMatrix2x3fv', 6)) return
    super.uniformMatrix2x3fv(location._ | 0, !!transpose, value)
  }

  uniformMatrix3x2fv (location, transpose, value, srcOffset, srcLength) {
    value = this._uniformData(Float32Array, value, srcOffset, srcLength, 'uniformMatrix3x2fv')
    if (!value) return
    if (!this._checkUniformMatrixValue(location, value, 'uniformMatrix3x2fv', 6)) return
    super.uniformMatrix3x2fv(location._ | 0, !!transpose, value)
  }

  uniformMatrix2x4fv (location, transpose, value, srcOffset, srcLength) {
    value = this._uniformData(Float32Array, value, srcOffset, srcLength, 'uniformMatrix2x4fv')
    if (!value) return
    if (!this._checkUniformMatrixValue(location, value, 'uniformMatrix2x4fv', 8)) return
    super.uniformMatrix2x4fv(location._ | 0, !!transpose, value)
  }

  uniformMatrix4x2fv (location, transpose, value, srcOffset, srcLength) {
    value = this._uniformData(Float32Array, value, srcOffset, srcLength, 'uniformMatrix4x2fv')
    if (!value) return
    if (!this._checkUniformMatrixValue(location, value, 'uniformMatrix4x2fv', 8)) return
    super.uniformMatrix4x2fv(location._ | 0, !!transpose, value)
  }

  uniformMatrix3x4fv (location, transpose, value, srcOffset, srcLength) {
    value = this._uniformData(Float32Array, value, srcOffset, srcLength, 'uniformMatrix3x4fv')
    if (!value) return
    if (!this._checkUniformMatrixValue(location, value, 'uniformMatrix3x4fv', 12)) return
    super.uniformMatrix3x4fv(location._ | 0, !!transpose, value)
  }

  uniformMatrix4x3fv (location, transpose, value, srcOffset, srcLength) {
    value = this._uniformData(Float32Array, value, srcOffset, srcLength, 'uniformMatrix4x3fv')
    if (!value) return
    if (!this._checkUniformMatrixValue(location, value, 'uniformMatrix4x3fv', 12)) return
    super.uniformMatrix4x3fv(location._ | 0, !!transpose, value)
  }

  _setIntegerAttrib (index, data) {
    const attrib = this._vertexGlobalState._attribs[index]
    attrib._intData = data
    for (let i = 0; i < 4; ++i) {
      attrib._data[i] = data[i]
    }
  }

  _integerAttribValues (values, Type, name) {
    if (typeof values !== 'object' || values === null || typeof values.length !== 'number') {
      throw new TypeError(name + '(GLuint, Array)')
    }
    if (values.length < 4) {
      this.setError(this.INVALID_VALUE)
      return null
    }
    const data = new Type(4)
    for (let i = 0; i < 4; ++i) {
      data[i] = values[i]
    }
    return data
  }

  vertexAttribI4i (index, x, y, z, w) {
    index |= 0
    if (!this._checkVertexIndex(index)) return
    const data = new Int32Array([x, y, z, w])
    this._setIntegerAttrib(index, data)
    return super.vertexAttribI4i(index, data[0], data[1], data[2], data[3])
  }

  vertexAttribI4ui (index, x, y, z, w) {
    index |= 0
    if (!this._checkVertexIndex(index)) return
    const data = new Uint32Array([x, y, z, w])
    this._setIntegerAttrib(index, data)
    return super.vertexAttribI4ui(index, data[0], data[1], data[2], data[3])
  }

  vertexAttribI4iv (index, values) {
    index |= 0
    const data = this._integerAttribValues(values, Int32Array, 'vertexAttribI4iv')
    if (!data || !this._checkVertexIndex(index)) return
    this._setIntegerAttrib(index, data)
    return super.vertexAttribI4iv(index, data)
  }

  vertexAttribI4uiv (index, values) {
    index |= 0
    const data = this._integerAttribValues(values, Uint32Array, 'vertexAttribI4uiv')
    if (!data || !this._checkVertexIndex(index)) return
    this._setIntegerAttrib(index, data)
    return super.vertexAttribI4uiv(index, data)
  }

  vertexAttribPointer (
    index,
    size,
    type,
    normalized,
    stride,
    offset) {
    if (stride < 0 || offset < 0) {
      this.setError(this.INVALID_VALUE)
      return
    }

    index |= 0
    size |= 0
    type |= 0
    normalized = !!normalized
    stride |= 0
    offset = toIntPtr(offset)

    if (stride < 0 ||
      offset < 0 ||
      index < 0 || index >= this._vertexObjectState._attribs.length ||
      !(size === 1 || size === 2 || size === 3 || size === 4)) {
      this.setError(this.INVALID_VALUE)
      return
    }

    if (this._vertexGlobalState._arrayBufferBinding === null && offset !== 0) {
      this.setError(this.INVALID_OPERATION)
      return
    }

    const packed = type === this.INT_2_10_10_10_REV ||
      type === this.UNSIGNED_INT_2_10_10_10_REV
    let byteSize = typeSize(type)
    if (type === this.HALF_FLOAT) {
      byteSize = 2
    } else if (packed) {
      byteSize = 4
    }
    if (byteSize === 0) {
      this.setError(this.INVALID_ENUM)
      return
    }

    if (packed && size !== 4) {
      this.setError(this.INVALID_OPERATION)
      return
    }

    if (stride > 255 || stride < 0) {
      this.setError(this.INVALID_VALUE)
      return
    }

    if ((stride % byteSize) !== 0 ||
      (offset % byteSize) !== 0) {
      this.setError(this.INVALID_OPERATION)
      return
    }

    const pointerSize = packed ? 4 : size * byteSize

    gl.vertexAttribPointer.call(this, index, size, type, normalized, stride, offset)

    this._vertexObjectState.setVertexAttribPointer(
      this._vertexGlobalState._arrayBufferBinding,
      index,
      pointerSize,
      offset,
      stride || pointerSize,
      type,
      normalized,
      stride,
      size)
    this._vertexObjectState._attribs[index]._integer = false
  }

  vertexAttribIPointer (index, size, type, stride, offset) {
    if (stride < 0 || offset < 0) {
      this.setError(this.INVALID_VALUE)
      return
    }

    index |= 0
    size |= 0
    type |= 0
    stride |= 0
    offset = toIntPtr(offset)

    if (stride < 0 ||
      offset < 0 ||
      index < 0 || index >= this._vertexObjectState._attribs.length ||
      !(size === 1 || size === 2 || size === 3 || size === 4)) {
      this.setError(this.INVALID_VALUE)
      return
    }

    if (this._vertexGlobalState._arrayBufferBinding === null && offset !== 0) {
      this.setError(this.INVALID_OPERATION)
      return
    }

    const byteSize = typeSize(type)
    if (byteSize === 0 || type === this.FLOAT) {
      this.setError(this.INVALID_ENUM)
      return
    }

    if (stride > 255 || stride < 0) {
      this.setError(this.INVALID_VALUE)
      return
    }

    if ((stride % byteSize) !== 0 ||
      (offset % byteSize) !== 0) {
      this.setError(this.INVALID_OPERATION)
      return
    }

    super.vertexAttribIPointer(index, size, type, stride, offset)

    this._vertexObjectState.setVertexAttribPointer(
      this._vertexGlobalState._arrayBufferBinding,
      index,
      size * byteSize,
      offset,
      stride || (size * byteSize),
      type,
      false,
      stride,
      size)
    this._vertexObjectState._attribs[index]._integer = true
  }

  vertexAttribDivisor (index, divisor) {
    index |= 0
    divisor >>>= 0
    if (!this._checkVertexIndex(index)) return
    super.vertexAttribDivisor(index, divisor)
    this._vertexObjectState._attribs[index]._divisor = divisor
  }

  getVertexAttrib (index, pname) {
    index |= 0
    pname |= 0
    if (pname === this.VERTEX_ATTRIB_ARRAY_DIVISOR ||
      pname === this.VERTEX_ATTRIB_ARRAY_INTEGER) {
      if (!this._checkVertexIndex(index)) return null
      const attrib = this._vertexObjectState._attribs[index]
      if (pname === this.VERTEX_ATTRIB_ARRAY_DIVISOR) {
        return attrib._divisor
      }
      return attrib._integer
    }
    return super.getVertexAttrib(index, pname)
  }

  drawArraysInstanced (mode, first, count, instanceCount) {
    mode |= 0
    first |= 0
    count |= 0
    instanceCount |= 0

    return super.drawArraysInstanced(mode, first, count, instanceCount)
  }

  drawElementsInstanced (mode, count, type, offset, instanceCount) {
    mode |= 0
    count |= 0
    type |= 0
    offset = toIntPtr(offset)
    instanceCount |= 0

    return super.drawElementsInstanced(mode, count, type, offset, instanceCount)
  }

  drawRangeElements (mode, start, end, count, type, offset) {
    mode |= 0
    start |= 0
    end |= 0
    count |= 0
    type |= 0
    offset = toIntPtr(offset)

    if (end < start) {
      this.setError(this.INVALID_VALUE)
      return
    }

    return super.drawRangeElements(mode, start, end, count, type, offset)
  }

  _defaultFramebufferAttachment (attachment) {
    switch (attachment) {
      case this.BACK:
      case this.COLOR:
        return this.COLOR_ATTACHMENT0
      case this.DEPTH:
        return this.DEPTH_ATTACHMENT
      case this.STENCIL:
        return this.STENCIL_ATTACHMENT
    }
    return attachment
  }

  _colorAttachmentIndex (attachment) {
    const index = attachment - this.COLOR_ATTACHMENT0
    if (index >= 0 && index < 16) {
      return index
    }
    return -1
  }

  _checkAttachmentPoint (attachment) {
    const index = this._colorAttachmentIndex(attachment | 0)
    if (index >= this._maxColorAttachments) {
      this.setError(this.INVALID_ENUM)
      return false
    }
    return true
  }

  framebufferTexture2D (target, attachment, textarget, texture, level) {
    if (!this._checkAttachmentPoint(attachment)) return
    return super.framebufferTexture2D(target, attachment, textarget, texture, level)
  }

  framebufferRenderbuffer (target, attachment, renderbufferTarget, renderbuffer) {
    if (!this._checkAttachmentPoint(attachment)) return
    return super.framebufferRenderbuffer(target, attachment, renderbufferTarget, renderbuffer)
  }

  framebufferTextureLayer (target, attachment, texture, level, layer) {
    if (!this._checkAttachmentPoint(attachment)) return
    return super.framebufferTextureLayer(target, attachment, texture, level, layer)
  }

  _checkFramebufferTarget (target) {
    if (target !== this.FRAMEBUFFER &&
      target !== this.READ_FRAMEBUFFER &&
      target !== this.DRAW_FRAMEBUFFER) {
      this.setError(this.INVALID_ENUM)
      return false
    }
    return true
  }

  _clearBufferValues (Type, values, srcOffset, name) {
    if (typeof values !== 'object' || values === null || typeof values.length !== 'number') {
      throw new TypeError(name + '(GLenum, GLint, Array, GLuint)')
    }
    srcOffset |= 0
    if (srcOffset < 0 || srcOffset > values.length) {
      this.setError(this.INVALID_VALUE)
      return null
    }
    const data = values instanceof Type ? values : Type.from(values)
    return srcOffset ? data.subarray(srcOffset) : data
  }

  _checkClearBuffer (buffer, drawbuffer, allowed, data) {
    if (allowed.indexOf(buffer) < 0) {
      this.setError(this.INVALID_ENUM)
      return false
    }
    const max = buffer === this.COLOR ? this._maxDrawBuffers : 1
    if (drawbuffer < 0 || drawbuffer >= max) {
      this.setError(this.INVALID_VALUE)
      return false
    }
    if (data && data.length < (buffer === this.COLOR ? 4 : 1)) {
      this.setError(this.INVALID_VALUE)
      return false
    }
    return true
  }

  clearBufferfv (buffer, drawbuffer, values, srcOffset) {
    buffer |= 0
    drawbuffer |= 0
    const data = this._clearBufferValues(Float32Array, values, srcOffset, 'clearBufferfv')
    if (!data) return
    if (!this._checkClearBuffer(buffer, drawbuffer, [this.COLOR, this.DEPTH], data)) return
    super.clearBufferfv(buffer, drawbuffer, data)
  }

  clearBufferiv (buffer, drawbuffer, values, srcOffset) {
    buffer |= 0
    drawbuffer |= 0
    const data = this._clearBufferValues(Int32Array, values, srcOffset, 'clearBufferiv')
    if (!data) return
    if (!this._checkClearBuffer(buffer, drawbuffer, [this.COLOR, this.STENCIL], data)) return
    super.clearBufferiv(buffer, drawbuffer, data)
  }

  clearBufferuiv (buffer, drawbuffer, values, srcOffset) {
    buffer |= 0
    drawbuffer |= 0
    const data = this._clearBufferValues(Uint32Array, values, srcOffset, 'clearBufferuiv')
    if (!data) return
    if (!this._checkClearBuffer(buffer, drawbuffer, [this.COLOR], data)) return
    super.clearBufferuiv(buffer, drawbuffer, data)
  }

  clearBufferfi (buffer, drawbuffer, depth, stencil) {
    buffer |= 0
    drawbuffer |= 0
    if (!this._checkClearBuffer(buffer, drawbuffer, [this.DEPTH_STENCIL])) return
    super.clearBufferfi(buffer, drawbuffer, +depth, stencil | 0)
  }

  readBuffer (src) {
    src |= 0
    const index = this._colorAttachmentIndex(src)
    if (src !== this.NONE && src !== this.BACK && index < 0) {
      this.setError(this.INVALID_ENUM)
      return
    }
    const framebuffer = this._activeFramebuffers.read
    if (framebuffer) {
      if (src === this.BACK || index >= this._maxColorAttachments) {
        this.setError(this.INVALID_OPERATION)
        return
      }
      super.readBuffer(src)
      framebuffer._readBuffer = src
    } else {
      if (index >= 0) {
        this.setError(this.INVALID_OPERATION)
        return
      }
      super.readBuffer(this._defaultFramebufferAttachment(src))
      this._defaultReadBuffer = src
    }
  }

  drawBuffers (buffers) {
    if (!Array.isArray(buffers)) {
      throw new TypeError('drawBuffers(Array)')
    }
    const list = new Array(buffers.length)
    for (let i = 0; i < buffers.length; ++i) {
      list[i] = buffers[i] | 0
      if (list[i] !== this.NONE && list[i] !== this.BACK && this._colorAttachmentIndex(list[i]) < 0) {
        this.setError(this.INVALID_ENUM)
        return
      }
    }
    const framebuffer = this._activeFramebuffers.draw
    if (framebuffer) {
      if (list.length > this._maxDrawBuffers) {
        this.setError(this.INVALID_VALUE)
        return
      }
      for (let i = 0; i < list.length; ++i) {
        if (list[i] !== this.NONE && list[i] !== this.COLOR_ATTACHMENT0 + i) {
          this.setError(this.INVALID_OPERATION)
          return
        }
      }
      super.drawBuffers(list)
      framebuffer._drawBuffers = list
    } else {
      if (list.length !== 1 || (list[0] !== this.BACK && list[0] !== this.NONE)) {
        this.setError(this.INVALID_OPERATION)
        return
      }
      super.drawBuffers([this._defaultFramebufferAttachment(list[0])])
      this._defaultDrawBuffer = list[0]
    }
  }

  blitFramebuffer (srcX0, srcY0, srcX1, srcY1, dstX0, dstY0, dstX1, dstY1, mask, filter) {
    mask |= 0
    filter |= 0
    if (mask & ~(this.COLOR_BUFFER_BIT | this.DEPTH_BUFFER_BIT | this.STENCIL_BUFFER_BIT)) {
      this.setError(this.INVALID_VALUE)
      return
    }
    if (filter !== this.NEAREST && filter !== this.LINEAR) {
      this.setError(this.INVALID_ENUM)
      return
    }
    if (filter === this.LINEAR && (mask & (this.DEPTH_BUFFER_BIT | this.STENCIL_BUFFER_BIT))) {
      this.setError(this.INVALID_OPERATION)
      return
    }
    super.blitFramebuffer(
      srcX0 | 0, srcY0 | 0, srcX1 | 0, srcY1 | 0,
      dstX0 | 0, dstY0 | 0, dstX1 | 0, dstY1 | 0,
      mask, filter)
  }

  renderbufferStorageMultisample (target, samples, internalFormat, width, height) {
    target |= 0
    samples |= 0
    internalFormat |= 0
    width |= 0
    height |= 0

    if (target !== this.RENDERBUFFER) {
      this.setError(this.INVALID_ENUM)
      return
    }

    const renderbuffer = this._activeRenderbuffer
    if (!renderbuffer) {
      this.setError(this.INVALID_OPERATION)
      return
    }

    if (samples < 0 || width < 0 || height < 0) {
      this.setError(this.INVALID_VALUE)
      return
    }

    if (internalFormat === this.DEPTH_STENCIL && samples > 0) {
      this.setError(this.INVALID_OPERATION)
      return
    }

    const storage = internalFormat === this.DEPTH_STENCIL ? this.DEPTH24_STENCIL8 : internalFormat

    this._saveError()
    super.renderbufferStorageMultisample(target, samples, storage, width, height)
    const error = this.getError()
    this._restoreError(error)
    if (error !== this.NO_ERROR) {
      return
    }

    renderbuffer._width = width
    renderbuffer._height = height
    renderbuffer._format = internalFormat
    renderbuffer._samples = gl.getRenderbufferParameter.call(this, target, this.RENDERBUFFER_SAMPLES)
  }

  getRenderbufferParameter (target, pname) {
    if ((pname | 0) === this.RENDERBUFFER_SAMPLES) {
      if ((target | 0) !== this.RENDERBUFFER) {
        this.setError(this.INVALID_ENUM)
        return null
      }
      if (!this._activeRenderbuffer) {
        this.setError(this.INVALID_OPERATION)
        return null
      }
      return this._activeRenderbuffer._samples
    }
    return super.getRenderbufferParameter(target, pname)
  }

  _invalidateAttachments (target, attachments, name) {
    if (!Array.isArray(attachments)) {
      throw new TypeError(name + '(GLenum, Array)')
    }
    if (!this._checkFramebufferTarget(target)) {
      return null
    }
    const framebuffer = this._getActiveFramebuffer(target)
    const list = new Array(attachments.length)
    for (let i = 0; i < attachments.length; ++i) {
      const attachment = attachments[i] | 0
      if (framebuffer) {
        const index = this._colorAttachmentIndex(attachment)
        if (index >= 0) {
          if (index >= this._maxColorAttachments) {
            this.setError(this.INVALID_OPERATION)
            return null
          }
        } else if (attachment !== this.DEPTH_ATTACHMENT &&
          attachment !== this.STENCIL_ATTACHMENT &&
          attachment !== this.DEPTH_STENCIL_ATTACHMENT) {
          this.setError(this.INVALID_ENUM)
          return null
        }
        list[i] = attachment
      } else {
        if (attachment !== this.COLOR &&
          attachment !== this.DEPTH &&
          attachment !== this.STENCIL) {
          this.setError(this.INVALID_ENUM)
          return null
        }
        list[i] = this._defaultFramebufferAttachment(attachment)
      }
    }
    return list
  }

  invalidateFramebuffer (target, attachments) {
    target |= 0
    const list = this._invalidateAttachments(target, attachments, 'invalidateFramebuffer')
    if (!list) return
    super.invalidateFramebuffer(target, list)
  }

  invalidateSubFramebuffer (target, attachments, x, y, width, height) {
    target |= 0
    x |= 0
    y |= 0
    width |= 0
    height |= 0
    const list = this._invalidateAttachments(target, attachments, 'invalidateSubFramebuffer')
    if (!list) return
    if (width < 0 || height < 0) {
      this.setError(this.INVALID_VALUE)
      return
    }
    super.invalidateSubFramebuffer(target, list, x, y, width, height)
  }

  getFramebufferAttachmentParameter (target, attachment, pname) {
    target |= 0
    attachment |= 0
    pname |= 0

    if (!this._checkFramebufferTarget(target)) {
      return null
    }
    const framebuffer = this._getActiveFramebuffer(target)
    if (framebuffer) {
      if (attachment !== this.DEPTH_ATTACHMENT &&
        attachment !== this.STENCIL_ATTACHMENT &&
        attachment !== this.DEPTH_STENCIL_ATTACHMENT &&
        !(this._colorAttachmentIndex(attachment) >= 0 && this._colorAttachmentIndex(attachment) < this._maxColorAttachments)) {
        this.setError(this.INVALID_ENUM)
        return null
      }
      if (attachment === this.DEPTH_STENCIL_ATTACHMENT) {
        const depth = this._attachmentObject(target, this.DEPTH_ATTACHMENT)
        const stencil = this._attachmentObject(target, this.STENCIL_ATTACHMENT)
        if (depth.type !== stencil.type || depth.object !== stencil.object ||
          (depth.type !== this.NONE && pname === this.FRAMEBUFFER_ATTACHMENT_COMPONENT_TYPE)) {
          this.setError(this.INVALID_OPERATION)
          return null
        }
        attachment = this.DEPTH_ATTACHMENT
      }
      if (pname !== this.FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE &&
        pname !== this.FRAMEBUFFER_ATTACHMENT_OBJECT_NAME &&
        this._attachmentObject(target, attachment).type === this.NONE) {
        this.setError(this.INVALID_OPERATION)
        return null
      }
      if (!this._isAttachmentParameter(pname)) {
        this.setError(this.INVALID_ENUM)
        return null
      }
      return super.getFramebufferAttachmentParameter(target, attachment, pname)
    }

    if (attachment !== this.BACK &&
      attachment !== this.DEPTH &&
      attachment !== this.STENCIL) {
      this.setError(this.INVALID_ENUM)
      return null
    }

    switch (pname) {
      case this.FRAMEBUFFER_ATTACHMENT_OBJECT_NAME:
      case this.FRAMEBUFFER_ATTACHMENT_TEXTURE_LEVEL:
      case this.FRAMEBUFFER_ATTACHMENT_TEXTURE_CUBE_MAP_FACE:
      case this.FRAMEBUFFER_ATTACHMENT_TEXTURE_LAYER:
        this.setError(this.INVALID_ENUM)
        return null
    }

    const nativeAttachment = this._defaultFramebufferAttachment(attachment)
    this._saveError()
    const type = gl.getFramebufferAttachmentParameter.call(this, target, nativeAttachment, this.FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE)
    let result = type
    if (pname === this.FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE) {
      if (type !== this.NONE) {
        result = this.FRAMEBUFFER_DEFAULT
      }
    } else if (type === this.NONE) {
      result = null
      this.setError(this.INVALID_OPERATION)
    } else {
      result = gl.getFramebufferAttachmentParameter.call(this, target, nativeAttachment, pname)
    }
    const error = gl.getError.call(this)
    this._restoreError(error)
    return error ? null : result
  }

  _isRenderbufferFormat (internalFormat) {
    switch (internalFormat) {
      case this.R8:
      case this.R8UI:
      case this.R8I:
      case this.R16UI:
      case this.R16I:
      case this.R32UI:
      case this.R32I:
      case this.RG8:
      case this.RG8UI:
      case this.RG8I:
      case this.RG16UI:
      case this.RG16I:
      case this.RG32UI:
      case this.RG32I:
      case this.RGB8:
      case this.RGBA8:
      case this.SRGB8_ALPHA8:
      case this.RGB10_A2:
      case this.RGBA8UI:
      case this.RGBA8I:
      case this.RGB10_A2UI:
      case this.RGBA16UI:
      case this.RGBA16I:
      case this.RGBA32I:
      case this.RGBA32UI:
      case this.RGB565:
      case this.RGBA4:
      case this.RGB5_A1:
      case this.DEPTH_COMPONENT16:
      case this.DEPTH_COMPONENT24:
      case this.DEPTH_COMPONENT32F:
      case this.DEPTH24_STENCIL8:
      case this.DEPTH32F_STENCIL8:
      case this.STENCIL_INDEX8:
        return true
      case this.R16F:
      case this.RG16F:
      case this.RGBA16F:
      case this.R32F:
      case this.RG32F:
      case this.RGBA32F:
      case this.R11F_G11F_B10F:
        return Boolean(this._extensions.ext_color_buffer_float)
    }
    return false
  }

  _isAttachmentParameter (pname) {
    switch (pname) {
      case this.FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE:
      case this.FRAMEBUFFER_ATTACHMENT_OBJECT_NAME:
      case this.FRAMEBUFFER_ATTACHMENT_TEXTURE_LEVEL:
      case this.FRAMEBUFFER_ATTACHMENT_TEXTURE_CUBE_MAP_FACE:
      case this.FRAMEBUFFER_ATTACHMENT_TEXTURE_LAYER:
      case this.FRAMEBUFFER_ATTACHMENT_RED_SIZE:
      case this.FRAMEBUFFER_ATTACHMENT_GREEN_SIZE:
      case this.FRAMEBUFFER_ATTACHMENT_BLUE_SIZE:
      case this.FRAMEBUFFER_ATTACHMENT_ALPHA_SIZE:
      case this.FRAMEBUFFER_ATTACHMENT_DEPTH_SIZE:
      case this.FRAMEBUFFER_ATTACHMENT_STENCIL_SIZE:
      case this.FRAMEBUFFER_ATTACHMENT_COMPONENT_TYPE:
      case this.FRAMEBUFFER_ATTACHMENT_COLOR_ENCODING:
        return true
    }
    return false
  }

  _attachmentObject (target, attachment) {
    this._saveError()
    const type = gl.getFramebufferAttachmentParameter.call(this, target, attachment, this.FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE)
    this._restoreError(this.NO_ERROR)
    let object = null
    if (type === this.RENDERBUFFER || type === this.TEXTURE) {
      object = this._getActiveFramebuffer(target)._attachments[attachment] || null
    }
    return { type, object }
  }

  _checkPixelType (type, view) {
    if (!ArrayBuffer.isView(view)) {
      return true
    }
    let valid
    switch (type) {
      case this.UNSIGNED_BYTE:
        valid = view instanceof Uint8Array || view instanceof Uint8ClampedArray
        break
      case this.BYTE:
        valid = view instanceof Int8Array
        break
      case this.UNSIGNED_SHORT:
      case this.UNSIGNED_SHORT_5_6_5:
      case this.UNSIGNED_SHORT_4_4_4_4:
      case this.UNSIGNED_SHORT_5_5_5_1:
      case this.HALF_FLOAT:
        valid = view instanceof Uint16Array
        break
      case this.SHORT:
        valid = view instanceof Int16Array
        break
      case this.UNSIGNED_INT:
      case this.UNSIGNED_INT_2_10_10_10_REV:
      case this.UNSIGNED_INT_10F_11F_11F_REV:
      case this.UNSIGNED_INT_5_9_9_9_REV:
      case this.UNSIGNED_INT_24_8:
        valid = view instanceof Uint32Array
        break
      case this.INT:
        valid = view instanceof Int32Array
        break
      case this.FLOAT:
        valid = view instanceof Float32Array
        break
      case this.FLOAT_32_UNSIGNED_INT_24_8_REV:
        valid = false
        break
      default:
        return true
    }
    if (!valid) {
      this.setError(this.INVALID_OPERATION)
      return false
    }
    return true
  }

  readPixels (x, y, width, height, format, type, pixels, dstOffset) {
    if (ArrayBuffer.isView(pixels)) {
      if (!this._checkPixelType(type | 0, pixels)) return
      if (arguments.length > 7) {
        pixels = this._sliceSource(pixels, dstOffset, 0, 'readPixels')
        if (!pixels) return
      }
    }
    return super.readPixels(x, y, width, height, format, type, pixels)
  }

  getParameter (pname) {
    pname |= 0
    if (pname === this.VERTEX_ARRAY_BINDING) {
      return this._activeVertexArrayObject
    }
    if (pname === this.TEXTURE_BINDING_3D) {
      return this._getActiveTextureUnit()._bind3D
    }
    if (pname === this.TEXTURE_BINDING_2D_ARRAY) {
      return this._getActiveTextureUnit()._bind2DArray
    }
    if (pname === this.SAMPLER_BINDING) {
      return this._getActiveTextureUnit()._sampler
    }
    if (pname === this.MAX_CLIENT_WAIT_TIMEOUT_WEBGL) {
      return MAX_CLIENT_WAIT_TIMEOUT
    }
    if (pname === this.TRANSFORM_FEEDBACK_BINDING) {
      const tf = this._activeTransformFeedback
      return tf === this._defaultTransformFeedback ? null : tf
    }
    if (pname === this.TRANSFORM_FEEDBACK_ACTIVE) {
      return this._activeTransformFeedback._active
    }
    if (pname === this.TRANSFORM_FEEDBACK_PAUSED) {
      return this._activeTransformFeedback._paused
    }
    if (pname === this.READ_BUFFER) {
      const framebuffer = this._activeFramebuffers.read
      return framebuffer ? framebuffer._readBuffer : this._defaultReadBuffer
    }
    const drawBuffer = pname - this.DRAW_BUFFER0
    if (drawBuffer >= 0 && drawBuffer < 16) {
      if (drawBuffer >= this._maxDrawBuffers) {
        this.setError(this.INVALID_ENUM)
        return null
      }
      const framebuffer = this._activeFramebuffers.draw
      if (framebuffer) {
        return drawBuffer < framebuffer._drawBuffers.length ? framebuffer._drawBuffers[drawBuffer] : this.NONE
      }
      return drawBuffer === 0 ? this._defaultDrawBuffer : this.NONE
    }
    return super.getParameter(pname)
  }

  _isWebGL2TexParameter (pname) {
    return pname === this.TEXTURE_BASE_LEVEL ||
      pname === this.TEXTURE_COMPARE_FUNC ||
      pname === this.TEXTURE_COMPARE_MODE ||
      pname === this.TEXTURE_MAX_LEVEL ||
      pname === this.TEXTURE_MAX_LOD ||
      pname === this.TEXTURE_MIN_LOD ||
      pname === this.TEXTURE_WRAP_R
  }

  _unpackParametersUnsupported () {
    if (gl.getParameter.call(this, this.UNPACK_FLIP_Y_WEBGL) ||
      gl.getParameter.call(this, this.UNPACK_PREMULTIPLY_ALPHA_WEBGL)) {
      this.setError(this.INVALID_OPERATION)
      return true
    }
    return false
  }

  _checkTexStorage (target, levels, width, height, depth, allowed) {
    if (allowed.indexOf(target) < 0) {
      this.setError(this.INVALID_ENUM)
      return false
    }
    if (!this._getActiveTexture(target)) {
      this.setError(this.INVALID_OPERATION)
      return false
    }
    if (levels < 1 || width < 1 || height < 1 || depth < 1) {
      this.setError(this.INVALID_VALUE)
      return false
    }
    const maxLevels = Math.floor(Math.log2(Math.max(width, height, target === this.TEXTURE_3D ? depth : 1))) + 1
    if (levels > maxLevels) {
      this.setError(this.INVALID_OPERATION)
      return false
    }
    return true
  }

  texStorage2D (target, levels, internalFormat, width, height) {
    target |= 0
    levels |= 0
    internalFormat |= 0
    width |= 0
    height |= 0

    if (!this._checkTexStorage(target, levels, width, height, 1, [this.TEXTURE_2D, this.TEXTURE_CUBE_MAP])) {
      return
    }

    this._saveError()
    super.texStorage2D(target, levels, internalFormat, width, height)
    const error = this.getError()
    this._restoreError(error)
    if (error === this.NO_ERROR) {
      const texture = this._getActiveTexture(target)
      texture._format = internalFormat
      texture._type = 0
    }
  }

  texStorage3D (target, levels, internalFormat, width, height, depth) {
    target |= 0
    levels |= 0
    internalFormat |= 0
    width |= 0
    height |= 0
    depth |= 0

    if (!this._checkTexStorage(target, levels, width, height, depth, [this.TEXTURE_3D, this.TEXTURE_2D_ARRAY])) {
      return
    }

    this._saveError()
    super.texStorage3D(target, levels, internalFormat, width, height, depth)
    const error = this.getError()
    this._restoreError(error)
    if (error === this.NO_ERROR) {
      const texture = this._getActiveTexture(target)
      texture._format = internalFormat
      texture._type = 0
    }
  }

  texImage2D (target, level, internalFormat, width, height, border, format, type, source, srcOffset) {
    if (arguments.length >= 9 && !this._checkPixelType(type | 0, source)) return
    if (arguments.length === 10) {
      if (!ArrayBuffer.isView(source)) {
        throw new TypeError('texImage2D(GLenum, GLint, GLenum, GLint, GLint, GLint, GLenum, GLenum, ArrayBufferView, GLuint)')
      }
      source = this._sliceSource(source, srcOffset, 0, 'texImage2D', this.INVALID_OPERATION)
      if (!source) return
      return super.texImage2D(target, level, internalFormat, width, height, border, format, type, source)
    }
    return super.texImage2D.apply(this, arguments)
  }

  texSubImage2D (target, level, xoffset, yoffset, width, height, format, type, source, srcOffset) {
    if (arguments.length >= 9 && !this._checkPixelType(type | 0, source)) return
    if (arguments.length === 10) {
      if (!ArrayBuffer.isView(source)) {
        throw new TypeError('texSubImage2D(GLenum, GLint, GLint, GLint, GLint, GLint, GLenum, GLenum, ArrayBufferView, GLuint)')
      }
      source = this._sliceSource(source, srcOffset, 0, 'texSubImage2D', this.INVALID_OPERATION)
      if (!source) return
      return super.texSubImage2D(target, level, xoffset, yoffset, width, height, format, type, source)
    }
    return super.texSubImage2D.apply(this, arguments)
  }

  texImage3D (target, level, internalFormat, width, height, depth, border, format, type, source, srcOffset) {
    target |= 0
    level |= 0
    internalFormat |= 0
    width |= 0
    height |= 0
    depth |= 0
    border |= 0
    format |= 0
    type |= 0

    if (source !== null && source !== undefined && typeof source !== 'number' && (typeof source !== 'object' || source instanceof ArrayBuffer)) {
      throw new TypeError('texImage3D(GLenum, GLint, GLint, GLsizei, GLsizei, GLsizei, GLint, GLenum, GLenum, ArrayBufferView)')
    }
    if (!this._checkPixelBufferArgument(source, this.PIXEL_UNPACK_BUFFER)) return
    const image = this._imageSource(source, 'texImage3D')

    if (target !== this.TEXTURE_3D && target !== this.TEXTURE_2D_ARRAY) {
      this.setError(this.INVALID_ENUM)
      return
    }
    const texture = this._getActiveTexture(target)
    if (!texture) {
      this.setError(this.INVALID_OPERATION)
      return
    }

    if (image) {
      source = this._imageSourcePixels(image, format, type, width, height, depth, true)
      if (source === false) return
    } else if (ArrayBuffer.isView(source)) {
      if (!this._checkPixelType(type, source)) return
      if (this._unpackParametersUnsupported()) return
      if (arguments.length > 10) {
        source = this._sliceSource(source, srcOffset, 0, 'texImage3D', this.INVALID_OPERATION)
        if (!source) return
      }
    } else if (typeof source === 'number') {
      if (this._unpackParametersUnsupported()) return
    } else if (source === undefined) {
      source = null
    }

    this._saveError()
    this._withImageUnpack(image, () => super.texImage3D(target, level, internalFormat, width, height, depth, border, format, type, source))
    const error = this.getError()
    this._restoreError(error)
    if (error === this.NO_ERROR) {
      texture._format = format
      texture._type = type
    }
  }

  texSubImage3D (target, level, xoffset, yoffset, zoffset, width, height, depth, format, type, source, srcOffset) {
    if (source instanceof ArrayBuffer) {
      throw new TypeError('texSubImage3D(GLenum, GLint, GLint, GLint, GLint, GLsizei, GLsizei, GLsizei, GLenum, GLenum, ArrayBufferView)')
    }
    if (!this._checkPixelBufferArgument(source, this.PIXEL_UNPACK_BUFFER)) return
    const image = this._imageSource(source, 'texSubImage3D')
    if (image) {
      const pixels = this._imageSourcePixels(image, format | 0, type | 0, width | 0, height | 0, depth | 0, true)
      if (pixels === false) return
      this._withImageUnpack(image, () => gl.texSubImage3D.call(this, target | 0, level | 0, xoffset | 0, yoffset | 0,
        zoffset | 0, width | 0, height | 0, depth | 0, format | 0, type | 0, new Uint8Array(pixels.buffer)))
      return
    }
    if (typeof source === 'number') {
      if (this._unpackParametersUnsupported()) return
      gl.texSubImage3D.call(this, target | 0, level | 0, xoffset | 0, yoffset | 0, zoffset | 0,
        width | 0, height | 0, depth | 0, format | 0, type | 0, source)
      return
    }
    if (ArrayBuffer.isView(source)) {
      if (!this._checkPixelType(type | 0, source)) return
      if (this._unpackParametersUnsupported()) return
      if (arguments.length > 11) {
        source = this._sliceSource(source, srcOffset, 0, 'texSubImage3D', this.INVALID_OPERATION)
        if (!source) return
      }
    }
    return super.texSubImage3D(target, level, xoffset, yoffset, zoffset, width, height, depth, format, type, source)
  }

  copyTexSubImage3D (target, level, xoffset, yoffset, zoffset, x, y, width, height) {
    target |= 0
    if (target !== this.TEXTURE_3D && target !== this.TEXTURE_2D_ARRAY) {
      this.setError(this.INVALID_ENUM)
      return
    }
    if (!this._getActiveTexture(target)) {
      this.setError(this.INVALID_OPERATION)
      return
    }
    return super.copyTexSubImage3D(target, level | 0, xoffset | 0, yoffset | 0, zoffset | 0,
      x | 0, y | 0, width | 0, height | 0)
  }

  _isTexParameter (pname) {
    if (pname === this.TEXTURE_MAG_FILTER ||
      pname === this.TEXTURE_MIN_FILTER ||
      pname === this.TEXTURE_WRAP_S ||
      pname === this.TEXTURE_WRAP_T ||
      this._isWebGL2TexParameter(pname)) {
      return true
    }
    return Boolean(this._extensions.ext_texture_filter_anisotropic) &&
      pname === this._extensions.ext_texture_filter_anisotropic.TEXTURE_MAX_ANISOTROPY_EXT
  }

  texParameteri (target, pname, param) {
    if (!this._isTexParameter(pname | 0)) {
      this.setError(this.INVALID_ENUM)
      return
    }
    if (this._isWebGL2TexParameter(pname | 0)) {
      if (!this._checkTextureTarget(target | 0)) return
      return gl.texParameteri.call(this, target | 0, pname | 0, param | 0)
    }
    return super.texParameteri(target, pname, param)
  }

  texParameterf (target, pname, param) {
    if (!this._isTexParameter(pname | 0)) {
      this.setError(this.INVALID_ENUM)
      return
    }
    if (this._isWebGL2TexParameter(pname | 0)) {
      if (!this._checkTextureTarget(target | 0)) return
      return gl.texParameterf.call(this, target | 0, pname | 0, +param)
    }
    return super.texParameterf(target, pname, param)
  }

  getTexParameter (target, pname) {
    pname |= 0
    if (this._isWebGL2TexParameter(pname) ||
      pname === this.TEXTURE_IMMUTABLE_FORMAT ||
      pname === this.TEXTURE_IMMUTABLE_LEVELS) {
      if (!this._checkTextureTarget(target | 0)) return null
      const value = gl.getTexParameter.call(this, target | 0, pname)
      return pname === this.TEXTURE_IMMUTABLE_FORMAT ? value !== 0 : value
    }
    return super.getTexParameter(target, pname)
  }

  _isSamplerParameter (pname) {
    if (this._extensions.ext_texture_filter_anisotropic &&
      pname === this._extensions.ext_texture_filter_anisotropic.TEXTURE_MAX_ANISOTROPY_EXT) {
      return true
    }
    return pname === this.TEXTURE_MIN_FILTER ||
      pname === this.TEXTURE_MAG_FILTER ||
      pname === this.TEXTURE_WRAP_S ||
      pname === this.TEXTURE_WRAP_T ||
      pname === this.TEXTURE_WRAP_R ||
      pname === this.TEXTURE_MIN_LOD ||
      pname === this.TEXTURE_MAX_LOD ||
      pname === this.TEXTURE_COMPARE_MODE ||
      pname === this.TEXTURE_COMPARE_FUNC
  }

  createSampler () {
    const id = super.createSampler()
    if (id <= 0) return null
    const sampler = new WebGLSampler(id, this)
    this._samplers[id] = sampler
    return sampler
  }

  deleteSampler (sampler) {
    if (!checkObject(sampler)) {
      throw new TypeError('deleteSampler(WebGLSampler)')
    }

    if (!sampler) {
      return
    }

    if (!(sampler instanceof WebGLSampler &&
      this._checkOwns(sampler))) {
      this.setError(this.INVALID_OPERATION)
      return
    }

    if (sampler._pendingDelete) {
      return
    }

    for (let i = 0; i < this._textureUnits.length; ++i) {
      if (this._textureUnits[i]._sampler === sampler) {
        this.bindSampler(i, null)
      }
    }

    sampler._pendingDelete = true
    sampler._checkDelete()
  }

  isSampler (object) {
    if (!this._isObject(object, 'isSampler', WebGLSampler)) return false
    return super.isSampler(object._ | 0)
  }

  bindSampler (unit, sampler) {
    unit |= 0
    if (!checkObject(sampler)) {
      throw new TypeError('bindSampler(GLuint, WebGLSampler)')
    }

    if (unit < 0 || unit >= this._textureUnits.length) {
      this.setError(this.INVALID_VALUE)
      return
    }

    if (!sampler) {
      sampler = null
      super.bindSampler(unit, 0)
    } else if (sampler instanceof WebGLSampler && sampler._pendingDelete) {
      this.setError(this.INVALID_OPERATION)
      return
    } else if (this._checkWrapper(sampler, WebGLSampler)) {
      super.bindSampler(unit, sampler._ | 0)
    } else {
      return
    }

    const textureUnit = this._textureUnits[unit]
    const active = textureUnit._sampler
    if (active !== sampler) {
      if (active) {
        active._refCount -= 1
        active._checkDelete()
      }
      if (sampler) {
        sampler._refCount += 1
      }
    }
    textureUnit._sampler = sampler
  }

  samplerParameteri (sampler, pname, param) {
    pname |= 0
    param |= 0
    if (!sampler || !checkObject(sampler)) {
      throw new TypeError('samplerParameteri(WebGLSampler, GLenum, GLint)')
    }
    if (!this._checkWrapper(sampler, WebGLSampler)) {
      return
    }
    if (!this._isSamplerParameter(pname)) {
      this.setError(this.INVALID_ENUM)
      return
    }
    super.samplerParameteri(sampler._ | 0, pname, param)
  }

  samplerParameterf (sampler, pname, param) {
    pname |= 0
    param = +param
    if (!sampler || !checkObject(sampler)) {
      throw new TypeError('samplerParameterf(WebGLSampler, GLenum, GLfloat)')
    }
    if (!this._checkWrapper(sampler, WebGLSampler)) {
      return
    }
    if (!this._isSamplerParameter(pname)) {
      this.setError(this.INVALID_ENUM)
      return
    }
    super.samplerParameterf(sampler._ | 0, pname, param)
  }

  getSamplerParameter (sampler, pname) {
    pname |= 0
    if (!sampler || !checkObject(sampler)) {
      throw new TypeError('getSamplerParameter(WebGLSampler, GLenum)')
    }
    if (!this._checkWrapper(sampler, WebGLSampler)) {
      return null
    }
    if (!this._isSamplerParameter(pname)) {
      this.setError(this.INVALID_ENUM)
      return null
    }
    return super.getSamplerParameter(sampler._ | 0, pname)
  }

  _isQueryTarget (target) {
    return target === this.ANY_SAMPLES_PASSED ||
      target === this.ANY_SAMPLES_PASSED_CONSERVATIVE ||
      target === this.TRANSFORM_FEEDBACK_PRIMITIVES_WRITTEN
  }

  createQuery () {
    const id = super.createQuery()
    if (id <= 0) return null
    const query = new WebGLQuery(id, this)
    this._queries[id] = query
    return query
  }

  deleteQuery (query) {
    if (!checkObject(query)) {
      throw new TypeError('deleteQuery(WebGLQuery)')
    }

    if (!query) {
      return
    }

    if (!(query instanceof WebGLQuery &&
      this._checkOwns(query))) {
      this.setError(this.INVALID_OPERATION)
      return
    }

    if (query._pendingDelete) {
      return
    }

    if (query._active) {
      this.endQuery(query._target)
    }

    query._pendingDelete = true
    query._checkDelete()
  }

  isQuery (object) {
    if (!this._isObject(object, 'isQuery', WebGLQuery)) return false
    return super.isQuery(object._ | 0)
  }

  beginQuery (target, query) {
    target |= 0
    if (!query || !checkObject(query)) {
      throw new TypeError('beginQuery(GLenum, WebGLQuery)')
    }
    if (!this._isQueryTarget(target)) {
      this.setError(this.INVALID_ENUM)
      return
    }
    if (query instanceof WebGLQuery && query._pendingDelete) {
      this.setError(this.INVALID_OPERATION)
      return
    }
    if (!this._checkWrapper(query, WebGLQuery)) {
      return
    }
    const sibling = target === this.ANY_SAMPLES_PASSED
      ? this.ANY_SAMPLES_PASSED_CONSERVATIVE
      : this.ANY_SAMPLES_PASSED
    if (query._active ||
      this._activeQueries[target] ||
      (target !== this.TRANSFORM_FEEDBACK_PRIMITIVES_WRITTEN && this._activeQueries[sibling]) ||
      (query._target && query._target !== target)) {
      this.setError(this.INVALID_OPERATION)
      return
    }
    super.beginQuery(target, query._ | 0)
    query._target = target
    query._active = true
    query._refCount += 1
    this._activeQueries[target] = query
  }

  endQuery (target) {
    target |= 0
    if (!this._isQueryTarget(target)) {
      this.setError(this.INVALID_ENUM)
      return
    }
    const query = this._activeQueries[target]
    if (!query) {
      this.setError(this.INVALID_OPERATION)
      return
    }
    super.endQuery(target)
    query._active = false
    query._resultPending = true
    setImmediate(function () {
      query._resultPending = false
    })
    query._refCount -= 1
    query._checkDelete()
    this._activeQueries[target] = null
  }

  getQuery (target, pname) {
    target |= 0
    pname |= 0
    if (!this._isQueryTarget(target) || pname !== this.CURRENT_QUERY) {
      this.setError(this.INVALID_ENUM)
      return null
    }
    return this._activeQueries[target] || null
  }

  getQueryParameter (query, pname) {
    pname |= 0
    if (!query || !checkObject(query)) {
      throw new TypeError('getQueryParameter(WebGLQuery, GLenum)')
    }
    if (!this._checkWrapper(query, WebGLQuery)) {
      return null
    }
    if (pname !== this.QUERY_RESULT && pname !== this.QUERY_RESULT_AVAILABLE) {
      this.setError(this.INVALID_ENUM)
      return null
    }
    if (query._active || !query._target) {
      this.setError(this.INVALID_OPERATION)
      return null
    }
    if (pname === this.QUERY_RESULT_AVAILABLE) {
      if (query._resultPending) {
        return false
      }
      return super.getQueryParameter(query._ | 0, pname) !== 0
    }
    return super.getQueryParameter(query._ | 0, pname)
  }

  fenceSync (condition, flags) {
    condition |= 0
    flags |= 0
    if (condition !== this.SYNC_GPU_COMMANDS_COMPLETE) {
      this.setError(this.INVALID_ENUM)
      return null
    }
    if (flags !== 0) {
      this.setError(this.INVALID_VALUE)
      return null
    }
    const id = super.fenceSync(condition, flags)
    if (!id) return null
    const sync = new WebGLSync(id, this)
    this._syncs[id] = sync
    sync._pending = true
    setImmediate(function () {
      sync._pending = false
    })
    return sync
  }

  isSync (object) {
    if (!this._isObject(object, 'isSync', WebGLSync)) return false
    return super.isSync(object._ | 0)
  }

  deleteSync (sync) {
    if (!checkObject(sync)) {
      throw new TypeError('deleteSync(WebGLSync)')
    }

    if (!sync) {
      return
    }

    if (!(sync instanceof WebGLSync &&
      this._checkOwns(sync))) {
      this.setError(this.INVALID_OPERATION)
      return
    }

    if (sync._pendingDelete) {
      return
    }

    sync._pendingDelete = true
    sync._checkDelete()
  }

  clientWaitSync (sync, flags, timeout) {
    flags |= 0
    timeout = +timeout
    if (!sync || !checkObject(sync)) {
      throw new TypeError('clientWaitSync(WebGLSync, GLbitfield, GLuint64)')
    }
    if (!this._checkWrapper(sync, WebGLSync)) {
      return this.WAIT_FAILED
    }
    if (flags & ~this.SYNC_FLUSH_COMMANDS_BIT) {
      this.setError(this.INVALID_VALUE)
      return this.WAIT_FAILED
    }
    if (!(timeout >= 0) || timeout > MAX_CLIENT_WAIT_TIMEOUT) {
      this.setError(this.INVALID_OPERATION)
      return this.WAIT_FAILED
    }
    if (sync._pending) {
      if (flags & this.SYNC_FLUSH_COMMANDS_BIT) {
        this.flush()
      }
      return this.TIMEOUT_EXPIRED
    }
    return super.clientWaitSync(sync._ | 0, flags, timeout)
  }

  waitSync (sync, flags, timeout) {
    flags |= 0
    timeout = +timeout
    if (!sync || !checkObject(sync)) {
      throw new TypeError('waitSync(WebGLSync, GLbitfield, GLint64)')
    }
    if (!this._checkWrapper(sync, WebGLSync)) {
      return
    }
    if (flags !== 0 || timeout !== this.TIMEOUT_IGNORED) {
      this.setError(this.INVALID_VALUE)
      return
    }
    super.waitSync(sync._ | 0, flags, timeout)
  }

  getSyncParameter (sync, pname) {
    pname |= 0
    if (!sync || !checkObject(sync)) {
      throw new TypeError('getSyncParameter(WebGLSync, GLenum)')
    }
    if (!this._checkWrapper(sync, WebGLSync)) {
      return null
    }
    switch (pname) {
      case this.SYNC_STATUS:
        if (sync._pending) {
          return this.UNSIGNALED
        }
        return super.getSyncParameter(sync._ | 0, pname)
      case this.OBJECT_TYPE:
      case this.SYNC_CONDITION:
      case this.SYNC_FLAGS:
        return super.getSyncParameter(sync._ | 0, pname)
    }
    this.setError(this.INVALID_ENUM)
    return null
  }

  createTransformFeedback () {
    const id = super.createTransformFeedback()
    if (id <= 0) return null
    const tf = new WebGLTransformFeedback(id, this)
    this._transformFeedbacks[id] = tf
    return tf
  }

  deleteTransformFeedback (tf) {
    if (!checkObject(tf)) {
      throw new TypeError('deleteTransformFeedback(WebGLTransformFeedback)')
    }

    if (!tf) {
      return
    }

    if (!(tf instanceof WebGLTransformFeedback &&
      this._checkOwns(tf))) {
      this.setError(this.INVALID_OPERATION)
      return
    }

    if (tf._pendingDelete) {
      return
    }

    if (tf._active) {
      this.setError(this.INVALID_OPERATION)
      return
    }

    if (this._activeTransformFeedback === tf) {
      this.bindTransformFeedback(this.TRANSFORM_FEEDBACK, null)
    }

    tf._pendingDelete = true
    tf._checkDelete()
  }

  isTransformFeedback (object) {
    if (!this._isObject(object, 'isTransformFeedback', WebGLTransformFeedback)) return false
    return super.isTransformFeedback(object._ | 0)
  }

  bindTransformFeedback (target, tf) {
    target |= 0
    if (!checkObject(tf)) {
      throw new TypeError('bindTransformFeedback(GLenum, WebGLTransformFeedback)')
    }

    if (target !== this.TRANSFORM_FEEDBACK) {
      this.setError(this.INVALID_ENUM)
      return
    }

    const current = this._activeTransformFeedback
    if (current._active && !current._paused) {
      this.setError(this.INVALID_OPERATION)
      return
    }

    if (!tf) {
      tf = this._defaultTransformFeedback
      super.bindTransformFeedback(target, 0)
    } else if (tf._pendingDelete) {
      this.setError(this.INVALID_OPERATION)
      return
    } else if (this._checkWrapper(tf, WebGLTransformFeedback)) {
      super.bindTransformFeedback(target, tf._ | 0)
    } else {
      return
    }

    if (current !== tf) {
      if (current !== this._defaultTransformFeedback) {
        current._refCount -= 1
        current._checkDelete()
      }
      if (tf !== this._defaultTransformFeedback) {
        tf._refCount += 1
      }
    }
    this._activeTransformFeedback = tf
    this._indexedBufferBindings[this.TRANSFORM_FEEDBACK_BUFFER] = tf._bindings
  }

  beginTransformFeedback (primitiveMode) {
    primitiveMode |= 0
    if (primitiveMode !== this.POINTS &&
      primitiveMode !== this.LINES &&
      primitiveMode !== this.TRIANGLES) {
      this.setError(this.INVALID_ENUM)
      return
    }
    const tf = this._activeTransformFeedback
    const program = this._activeProgram
    if (tf._active ||
      !program ||
      !gl.getProgramParameter.call(this, program._ | 0, this.TRANSFORM_FEEDBACK_VARYINGS)) {
      this.setError(this.INVALID_OPERATION)
      return
    }

    this._saveError()
    super.beginTransformFeedback(primitiveMode)
    const error = this.getError()
    this._restoreError(error)
    if (error !== this.NO_ERROR) {
      return
    }

    tf._active = true
    tf._paused = false
    tf._program = program
    program._refCount += 1
  }

  endTransformFeedback () {
    const tf = this._activeTransformFeedback
    if (!tf._active) {
      this.setError(this.INVALID_OPERATION)
      return
    }
    super.endTransformFeedback()
    tf._active = false
    tf._paused = false
    const program = tf._program
    tf._program = null
    program._refCount -= 1
    program._checkDelete()
  }

  pauseTransformFeedback () {
    const tf = this._activeTransformFeedback
    if (!tf._active || tf._paused) {
      this.setError(this.INVALID_OPERATION)
      return
    }
    super.pauseTransformFeedback()
    tf._paused = true
  }

  resumeTransformFeedback () {
    const tf = this._activeTransformFeedback
    if (!tf._active || !tf._paused) {
      this.setError(this.INVALID_OPERATION)
      return
    }
    if (tf._program !== this._activeProgram) {
      this.setError(this.INVALID_OPERATION)
      return
    }
    super.resumeTransformFeedback()
    tf._paused = false
  }

  transformFeedbackVaryings (program, varyings, bufferMode) {
    bufferMode |= 0
    if (!program || !checkObject(program) || !isSequence(varyings)) {
      throw new TypeError('transformFeedbackVaryings(WebGLProgram, Array, GLenum)')
    }
    varyings = Array.from(varyings)
    if (!this._checkWrapper(program, WebGLProgram)) {
      return
    }
    if (bufferMode !== this.INTERLEAVED_ATTRIBS && bufferMode !== this.SEPARATE_ATTRIBS) {
      this.setError(this.INVALID_ENUM)
      return
    }
    if (bufferMode === this.SEPARATE_ATTRIBS &&
      varyings.length > this._maxTransformFeedbackSeparateAttribs) {
      this.setError(this.INVALID_VALUE)
      return
    }
    const names = new Array(varyings.length)
    for (let i = 0; i < varyings.length; ++i) {
      names[i] = varyings[i] + ''
      if (!isValidString(names[i]) || names[i].length > MAX_IDENTIFIER_LENGTH) {
        this.setError(this.INVALID_VALUE)
        return
      }
    }
    super.transformFeedbackVaryings(program._ | 0, names, bufferMode)
  }

  getTransformFeedbackVarying (program, index) {
    index |= 0
    if (!this._checkProgramIndex(program, index, this.TRANSFORM_FEEDBACK_VARYINGS, 'getTransformFeedbackVarying')) {
      return null
    }
    const info = super.getTransformFeedbackVarying(program._ | 0, index)
    if (!info) {
      return null
    }
    return new WebGLActiveInfo(info)
  }

  useProgram (program) {
    const tf = this._activeTransformFeedback
    if (tf._active && !tf._paused && program !== this._activeProgram) {
      this.setError(this.INVALID_OPERATION)
      return
    }
    return super.useProgram(program)
  }

  linkProgram (program) {
    if (program && this._allTransformFeedbacks().some((tf) => tf._active && tf._program === program)) {
      this.setError(this.INVALID_OPERATION)
      return
    }
    return super.linkProgram(program)
  }

  getUniformLocation (program, name) {
    if ((name + '').length > MAX_IDENTIFIER_LENGTH) {
      this.setError(this.INVALID_VALUE)
      return null
    }
    return super.getUniformLocation(program, name)
  }

  getUniformIndices (program, uniformNames) {
    if (!program || !checkObject(program) || !isSequence(uniformNames)) {
      throw new TypeError('getUniformIndices(WebGLProgram, Array)')
    }
    uniformNames = Array.from(uniformNames)
    if (!this._checkWrapper(program, WebGLProgram)) {
      return null
    }
    const names = new Array(uniformNames.length)
    for (let i = 0; i < uniformNames.length; ++i) {
      names[i] = uniformNames[i] + ''
      if (!isValidString(names[i]) || names[i].length > MAX_IDENTIFIER_LENGTH) {
        this.setError(this.INVALID_VALUE)
        return null
      }
    }
    return super.getUniformIndices(program._ | 0, names)
  }

  getActiveUniforms (program, uniformIndices, pname) {
    if (!program || !checkObject(program) || !isSequence(uniformIndices)) {
      throw new TypeError('getActiveUniforms(WebGLProgram, Array, GLenum)')
    }
    uniformIndices = Array.from(uniformIndices)
    pname |= 0
    if (!this._checkWrapper(program, WebGLProgram)) {
      return null
    }
    switch (pname) {
      case this.UNIFORM_TYPE:
      case this.UNIFORM_SIZE:
      case this.UNIFORM_BLOCK_INDEX:
      case this.UNIFORM_OFFSET:
      case this.UNIFORM_ARRAY_STRIDE:
      case this.UNIFORM_MATRIX_STRIDE:
      case this.UNIFORM_IS_ROW_MAJOR:
        break
      default:
        this.setError(this.INVALID_ENUM)
        return null
    }
    const count = gl.getProgramParameter.call(this, program._ | 0, this.ACTIVE_UNIFORMS)
    const indices = new Array(uniformIndices.length)
    for (let i = 0; i < uniformIndices.length; ++i) {
      indices[i] = uniformIndices[i] | 0
      if (indices[i] < 0 || indices[i] >= count) {
        this.setError(this.INVALID_VALUE)
        return null
      }
    }
    const result = super.getActiveUniforms(program._ | 0, indices, pname)
    if (pname === this.UNIFORM_IS_ROW_MAJOR) {
      for (let i = 0; i < result.length; ++i) {
        result[i] = result[i] !== 0
      }
    }
    return result
  }

  getActiveUniformBlockParameter (program, uniformBlockIndex, pname) {
    uniformBlockIndex |= 0
    pname |= 0
    if (!this._checkProgramIndex(program, uniformBlockIndex, this.ACTIVE_UNIFORM_BLOCKS, 'getActiveUniformBlockParameter')) {
      return null
    }
    switch (pname) {
      case this.UNIFORM_BLOCK_BINDING:
      case this.UNIFORM_BLOCK_DATA_SIZE:
      case this.UNIFORM_BLOCK_ACTIVE_UNIFORMS:
        return super.getActiveUniformBlockParameter(program._ | 0, uniformBlockIndex, pname)
      case this.UNIFORM_BLOCK_ACTIVE_UNIFORM_INDICES:
        return new Uint32Array(super.getActiveUniformBlockParameter(program._ | 0, uniformBlockIndex, pname))
      case this.UNIFORM_BLOCK_REFERENCED_BY_VERTEX_SHADER:
      case this.UNIFORM_BLOCK_REFERENCED_BY_FRAGMENT_SHADER:
        return super.getActiveUniformBlockParameter(program._ | 0, uniformBlockIndex, pname) !== 0
      default:
        this.setError(this.INVALID_ENUM)
        return null
    }
  }

  getActiveUniformBlockName (program, uniformBlockIndex) {
    uniformBlockIndex |= 0
    if (!this._checkProgramIndex(program, uniformBlockIndex, this.ACTIVE_UNIFORM_BLOCKS, 'getActiveUniformBlockName')) {
      return null
    }
    return super.getActiveUniformBlockName(program._ | 0, uniformBlockIndex)
  }

  getFragDataLocation (program, name) {
    if (!program || !checkObject(program)) {
      throw new TypeError('getFragDataLocation(WebGLProgram, String)')
    }
    name += ''
    if (!isValidString(name) || name.length > MAX_IDENTIFIER_LENGTH) {
      this.setError(this.INVALID_VALUE)
    } else if (this._checkWrapper(program, WebGLProgram)) {
      return super.getFragDataLocation(program._ | 0, name)
    }
    return -1
  }

  _sliceSource (data, srcOffset, length, name, overflowError) {
    if (!ArrayBuffer.isView(data)) {
      throw new TypeError(name + '(GLenum, ArrayBufferView, GLenum, GLuint, GLuint)')
    }
    srcOffset |= 0
    length |= 0
    const elementSize = data.BYTES_PER_ELEMENT || 1
    const elementCount = data.byteLength / elementSize
    if (srcOffset < 0 || length < 0 || srcOffset > elementCount) {
      this.setError(overflowError || this.INVALID_VALUE)
      return null
    }
    const count = length || elementCount - srcOffset
    if (srcOffset + count > elementCount) {
      this.setError(this.INVALID_VALUE)
      return null
    }
    return new Uint8Array(data.buffer, data.byteOffset + srcOffset * elementSize, count * elementSize)
  }

  _boundToActiveTransformFeedback (target) {
    return this._inActiveTransformFeedback(this._getActiveBuffer(target | 0))
  }

  _allTransformFeedbacks () {
    const feedbacks = [this._defaultTransformFeedback]
    for (const id in this._transformFeedbacks) {
      feedbacks.push(this._transformFeedbacks[id])
    }
    return feedbacks
  }

  _inActiveTransformFeedback (buffer) {
    if (!buffer) {
      return false
    }
    for (const tf of this._allTransformFeedbacks()) {
      if (!tf._active) {
        continue
      }
      for (let i = 0; i < tf._bindings.length; ++i) {
        if (tf._bindings[i] && tf._bindings[i].buffer === buffer) {
          this.setError(this.INVALID_OPERATION)
          return true
        }
      }
    }
    return false
  }

  bufferData (target, data, usage, srcOffset, length) {
    if (this._boundToActiveTransformFeedback(target)) {
      return
    }
    if (arguments.length > 3) {
      data = this._sliceSource(data, srcOffset, length, 'bufferData')
      if (!data) {
        return
      }
    }
    return super.bufferData(target, data, usage)
  }

  bufferSubData (target, offset, data, srcOffset, length) {
    if (this._boundToActiveTransformFeedback(target)) {
      return
    }
    if (arguments.length > 3) {
      data = this._sliceSource(data, srcOffset, length, 'bufferSubData')
      if (!data) {
        return
      }
    }
    return super.bufferSubData(target, offset, data)
  }

  copyBufferSubData (readTarget, writeTarget, readOffset, writeOffset, size) {
    readTarget |= 0
    writeTarget |= 0
    readOffset = toIntPtr(readOffset)
    writeOffset = toIntPtr(writeOffset)
    size = toIntPtr(size)

    if (!this._isBufferTarget(readTarget) || !this._isBufferTarget(writeTarget)) {
      this.setError(this.INVALID_ENUM)
      return
    }

    const readBuffer = this._getActiveBuffer(readTarget)
    const writeBuffer = this._getActiveBuffer(writeTarget)
    if (!readBuffer || !writeBuffer) {
      this.setError(this.INVALID_OPERATION)
      return
    }

    if (readOffset < 0 || writeOffset < 0 || size < 0 ||
      readOffset + size > readBuffer._size ||
      writeOffset + size > writeBuffer._size) {
      this.setError(this.INVALID_VALUE)
      return
    }

    if (readBuffer === writeBuffer &&
      readOffset < writeOffset + size &&
      writeOffset < readOffset + size) {
      this.setError(this.INVALID_VALUE)
      return
    }

    if ((readBuffer._binding === this.ELEMENT_ARRAY_BUFFER) !==
      (writeBuffer._binding === this.ELEMENT_ARRAY_BUFFER)) {
      this.setError(this.INVALID_OPERATION)
      return
    }

    if (this._inActiveTransformFeedback(readBuffer) || this._inActiveTransformFeedback(writeBuffer)) {
      return
    }

    super.copyBufferSubData(readTarget, writeTarget, readOffset, writeOffset, size)
  }

  getBufferSubData (target, srcByteOffset, dstBuffer, dstOffset, length) {
    target |= 0
    srcByteOffset = toIntPtr(srcByteOffset)
    dstOffset |= 0
    length |= 0

    if (!ArrayBuffer.isView(dstBuffer)) {
      throw new TypeError('getBufferSubData(GLenum, GLintptr, ArrayBufferView, GLuint, GLuint)')
    }

    if (!this._isBufferTarget(target)) {
      this.setError(this.INVALID_ENUM)
      return
    }

    const active = this._getActiveBuffer(target)
    if (!active) {
      this.setError(this.INVALID_OPERATION)
      return
    }

    const elementSize = dstBuffer.BYTES_PER_ELEMENT || 1
    const elementCount = dstBuffer.byteLength / elementSize
    if (dstOffset < 0 || length < 0 || dstOffset > elementCount) {
      this.setError(this.INVALID_VALUE)
      return
    }
    const count = length || elementCount - dstOffset
    if (dstOffset + count > elementCount) {
      this.setError(this.INVALID_VALUE)
      return
    }

    const view = new Uint8Array(dstBuffer.buffer, dstBuffer.byteOffset + dstOffset * elementSize, count * elementSize)
    if (srcByteOffset < 0) {
      this.setError(this.INVALID_VALUE)
      return
    }
    if (srcByteOffset + view.byteLength > active._size) {
      this.setError(this.INVALID_VALUE)
      return
    }
    if (view.byteLength === 0) {
      return
    }

    super.getBufferSubData(target, srcByteOffset, view)
  }

  getIndexedParameter (target, index) {
    target |= 0
    index |= 0

    let bindingTarget = 0
    switch (target) {
      case this.TRANSFORM_FEEDBACK_BUFFER_BINDING:
      case this.TRANSFORM_FEEDBACK_BUFFER_START:
      case this.TRANSFORM_FEEDBACK_BUFFER_SIZE:
        bindingTarget = this.TRANSFORM_FEEDBACK_BUFFER
        break
      case this.UNIFORM_BUFFER_BINDING:
      case this.UNIFORM_BUFFER_START:
      case this.UNIFORM_BUFFER_SIZE:
        bindingTarget = this.UNIFORM_BUFFER
        break
      default:
        this.setError(this.INVALID_ENUM)
        return null
    }

    const bindings = this._indexedBufferBindings[bindingTarget]
    if (index < 0 || index >= bindings.length) {
      this.setError(this.INVALID_VALUE)
      return null
    }

    if (target === this.TRANSFORM_FEEDBACK_BUFFER_BINDING ||
      target === this.UNIFORM_BUFFER_BINDING) {
      const binding = bindings[index]
      return binding ? binding.buffer : null
    }

    return super.getIndexedParameter(target, index)
  }
}

for (const [key, value] of Object.entries(gl)) {
  if (typeof value !== 'number') {
    continue
  }
  Object.assign(WebGL2RenderingContext, { [key]: value })
}

for (const [key, value] of Object.entries(NativeWebGL.WebGL2Constants)) {
  WebGL2RenderingContext.prototype[key] = value
  Object.assign(WebGL2RenderingContext, { [key]: value })
}

module.exports = { WebGL2RenderingContext }
