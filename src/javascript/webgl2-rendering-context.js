const { WebGLRenderingContextHelper } = require('./webgl-rendering-context')
const { toIntPtr } = require('./utils')

class WebGL2RenderingContext extends WebGLRenderingContextHelper {
  readPixels (x, y, width, height, format, type, pixels, dstOffset) {
    if (ArrayBuffer.isView(pixels)) {
      if (arguments.length > 7) {
        pixels = this._sliceSource(pixels, dstOffset, 0, 'readPixels')
        if (!pixels) return
      }
    }
    return super.readPixels(x, y, width, height, format, type, pixels)
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
