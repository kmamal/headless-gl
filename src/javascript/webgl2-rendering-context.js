const { gl } = require('./native-gl')
const { WebGLRenderingContextHelper } = require('./webgl-rendering-context')
const { WebGLProgram } = require('./webgl-program')
const { checkObject, isValidString, toIntPtr } = require('./utils')

const MAX_IDENTIFIER_LENGTH = 1024

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

  readPixels (x, y, width, height, format, type, pixels, dstOffset) {
    if (ArrayBuffer.isView(pixels)) {
      if (arguments.length > 7) {
        pixels = this._sliceSource(pixels, dstOffset, 0, 'readPixels')
        if (!pixels) return
      }
    }
    return super.readPixels(x, y, width, height, format, type, pixels)
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

  bufferData (target, data, usage, srcOffset, length) {
    if (arguments.length > 3) {
      data = this._sliceSource(data, srcOffset, length, 'bufferData')
      if (!data) {
        return
      }
    }
    return super.bufferData(target, data, usage)
  }

  bufferSubData (target, offset, data, srcOffset, length) {
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

module.exports = { WebGL2RenderingContext }
