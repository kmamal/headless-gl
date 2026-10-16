const { gl } = require('./native-gl')

const { WebGLUniformLocation } = require('./webgl-uniform-location')

const UNSIGNED_INT_VEC2 = 0x8DC6
const UNSIGNED_INT_VEC3 = 0x8DC7
const UNSIGNED_INT_VEC4 = 0x8DC8
const SAMPLER_3D = 0x8B5F
const SAMPLER_2D_SHADOW = 0x8B62
const SAMPLER_2D_ARRAY = 0x8DC1
const SAMPLER_2D_ARRAY_SHADOW = 0x8DC4
const SAMPLER_CUBE_SHADOW = 0x8DC5
const INT_SAMPLER_2D = 0x8DCA
const INT_SAMPLER_3D = 0x8DCB
const INT_SAMPLER_CUBE = 0x8DCC
const INT_SAMPLER_2D_ARRAY = 0x8DCF
const UNSIGNED_INT_SAMPLER_2D = 0x8DD2
const UNSIGNED_INT_SAMPLER_3D = 0x8DD3
const UNSIGNED_INT_SAMPLER_CUBE = 0x8DD4
const UNSIGNED_INT_SAMPLER_2D_ARRAY = 0x8DD7

function bindPublics (props, wrapper, privateInstance, privateMethods) {
  for (let i = 0; i < props.length; i++) {
    const prop = props[i]
    const value = privateInstance[prop]
    if (typeof value === 'function') {
      if (privateMethods.indexOf(prop) === -1) {
        wrapper[prop] = value.bind(privateInstance)
      }
    } else {
      if (prop[0] === '_' ||
        prop[0] === '0' ||
        prop[0] === '1') {
        continue
      }
      wrapper[prop] = value
    }
  }
}

function checkObject (object) {
  return typeof object === 'object' ||
    (object === undefined)
}

// Works around the fact that "instanceof" doesn't work for polyfilled types
function isInstanceOfType (instance, type) {
  return Object.prototype.toString.call(instance) === `[object ${type}]`
}

function checkUniform (program, location) {
  return location instanceof WebGLUniformLocation &&
    location._program === program &&
    location._linkCount === program._linkCount
}

function isTypedArray (data) {
  return isInstanceOfType(data, 'Uint8Array') ||
    isInstanceOfType(data, 'Uint8ClampedArray') ||
    isInstanceOfType(data, 'Int8Array') ||
    isInstanceOfType(data, 'Uint16Array') ||
    isInstanceOfType(data, 'Int16Array') ||
    isInstanceOfType(data, 'Uint32Array') ||
    isInstanceOfType(data, 'Int32Array') ||
    isInstanceOfType(data, 'Float32Array') ||
    isInstanceOfType(data, 'Float64Array')
}

// Don't allow: ", $, `, @, \, ', \0
function isValidString (str) {
  // Remove comments first
  const c = str.replace(/(?:\/\*(?:[\s\S]*?)\*\/)|(?:([\s;])+\/\/(?:.*)$)/gm, '')
  return !(/["$`@\\'\0]/.test(c))
}

function vertexCount (primitive, count) {
  switch (primitive) {
    case gl.TRIANGLES:
      return count - (count % 3)
    case gl.LINES:
      return count - (count % 2)
    case gl.LINE_LOOP:
    case gl.POINTS:
      return count
    case gl.TRIANGLE_FAN:
    case gl.LINE_STRIP:
      if (count < 2) {
        return 0
      }
      return count
    case gl.TRIANGLE_STRIP:
      if (count < 3) {
        return 0
      }
      return count
    default:
      return -1
  }
}

function typeSize (type) {
  switch (type) {
    case gl.UNSIGNED_BYTE:
    case gl.BYTE:
      return 1
    case gl.UNSIGNED_SHORT:
    case gl.SHORT:
      return 2
    case gl.UNSIGNED_INT:
    case gl.INT:
    case gl.FLOAT:
      return 4
  }
  return 0
}

function uniformTypeSize (type) {
  switch (type) {
    case gl.BOOL_VEC4:
    case gl.INT_VEC4:
    case gl.FLOAT_VEC4:
    case UNSIGNED_INT_VEC4:
      return 4

    case gl.BOOL_VEC3:
    case gl.INT_VEC3:
    case gl.FLOAT_VEC3:
    case UNSIGNED_INT_VEC3:
      return 3

    case gl.BOOL_VEC2:
    case gl.INT_VEC2:
    case gl.FLOAT_VEC2:
    case UNSIGNED_INT_VEC2:
      return 2

    case gl.BOOL:
    case gl.INT:
    case gl.FLOAT:
    case gl.UNSIGNED_INT:
    case gl.SAMPLER_2D:
    case gl.SAMPLER_CUBE:
    case SAMPLER_3D:
    case SAMPLER_2D_SHADOW:
    case SAMPLER_2D_ARRAY:
    case SAMPLER_2D_ARRAY_SHADOW:
    case SAMPLER_CUBE_SHADOW:
    case INT_SAMPLER_2D:
    case INT_SAMPLER_3D:
    case INT_SAMPLER_CUBE:
    case INT_SAMPLER_2D_ARRAY:
    case UNSIGNED_INT_SAMPLER_2D:
    case UNSIGNED_INT_SAMPLER_3D:
    case UNSIGNED_INT_SAMPLER_CUBE:
    case UNSIGNED_INT_SAMPLER_2D_ARRAY:
      return 1

    default:
      return 0
  }
}

function unpackTypedArray (array) {
  return (new Uint8Array(array.buffer)).subarray(
    array.byteOffset,
    array.byteLength + array.byteOffset)
}

function extractImageData (pixels) {
  if (typeof pixels === 'object' && typeof pixels.width !== 'undefined' && typeof pixels.height !== 'undefined') {
    if (typeof pixels.data !== 'undefined') {
      return pixels
    }

    let context = null

    if (typeof pixels.getContext === 'function') {
      context = pixels.getContext('2d')
    } else if (typeof pixels.src !== 'undefined' && typeof document === 'object' && typeof document.createElement === 'function') {
      const canvas = document.createElement('canvas')

      if (typeof canvas === 'object' && typeof canvas.getContext === 'function') {
        canvas.width = pixels.width
        canvas.height = pixels.height
        context = canvas.getContext('2d')

        if (context !== null) {
          context.drawImage(pixels, 0, 0)
        }
      }
    }

    if (context !== null) {
      return context.getImageData(0, 0, pixels.width, pixels.height)
    }
  }

  return null
}

const IMAGE_CHANNELS = {
  [gl.RGBA]: [0, 1, 2, 3],
  [gl.RGB]: [0, 1, 2],
  [gl.LUMINANCE_ALPHA]: [0, 3],
  [gl.LUMINANCE]: [0],
  [gl.ALPHA]: [3],
  0x8227: [0, 1],
  0x1903: [0],
  0x8D99: [0, 1, 2, 3],
  0x8D98: [0, 1, 2],
  0x8228: [0, 1],
  0x8D94: [0],
  0x8C40: [0, 1, 2],
  0x8C42: [0, 1, 2, 3]
}

const INTEGER_FORMATS = [0x8D99, 0x8D98, 0x8228, 0x8D94]

const HALF_FLOAT = 0x140B
const HALF_FLOAT_OES = 0x8D61
const UNSIGNED_INT_10F_11F_11F_REV = 0x8C3B
const UNSIGNED_INT_2_10_10_10_REV = 0x8368

const float32 = new Float32Array(1)
const uint32 = new Uint32Array(float32.buffer)

function floatToHalf (value) {
  float32[0] = value
  const bits = uint32[0]
  const sign = (bits >>> 16) & 0x8000
  const magnitude = Math.abs(value)
  if (Number.isNaN(value)) return sign | 0x7e00
  if (magnitude >= 65520) return sign | 0x7c00
  if (magnitude < 2 ** -14) return sign | Math.round(magnitude * 2 ** 24)
  let exponent = Math.floor(Math.log2(magnitude))
  if (2 ** exponent > magnitude) exponent -= 1
  if (2 ** (exponent + 1) <= magnitude) exponent += 1
  let mantissa = Math.round((magnitude / 2 ** exponent - 1) * 1024)
  if (mantissa === 1024) {
    mantissa = 0
    exponent += 1
  }
  return sign | ((exponent + 15) << 10) | mantissa
}

function floatToUnsignedFloat (value, mantissaBits) {
  if (!(value > 0)) return 0
  const scale = 2 ** mantissaBits
  if (value < 2 ** -14) return Math.round(value * 2 ** 14 * scale)
  let exponent = Math.floor(Math.log2(value))
  if (2 ** exponent > value) exponent -= 1
  if (2 ** (exponent + 1) <= value) exponent += 1
  let mantissa = Math.round((value / 2 ** exponent - 1) * scale)
  if (mantissa === scale) {
    mantissa = 0
    exponent += 1
  }
  if (exponent + 15 >= 31) return (31 << mantissaBits) - 1
  return ((exponent + 15) << mantissaBits) | mantissa
}

function imagePixelEncoder (format, type) {
  const channels = IMAGE_CHANNELS[format]
  if (!channels) return null
  const count = channels.length
  if (INTEGER_FORMATS.includes(format)) {
    if (type !== gl.UNSIGNED_BYTE) return null
    return { Type: Uint8Array, size: count, write: (out, i, rgba) => { for (let c = 0; c < count; ++c) out[i + c] = Math.round(rgba[channels[c]] * 255) } }
  }
  switch (type) {
    case gl.UNSIGNED_BYTE:
      return { Type: Uint8Array, size: count, write: (out, i, rgba) => { for (let c = 0; c < count; ++c) out[i + c] = Math.round(rgba[channels[c]] * 255) } }
    case gl.FLOAT:
      return { Type: Float32Array, size: count, write: (out, i, rgba) => { for (let c = 0; c < count; ++c) out[i + c] = rgba[channels[c]] } }
    case HALF_FLOAT:
    case HALF_FLOAT_OES:
      return { Type: Uint16Array, size: count, write: (out, i, rgba) => { for (let c = 0; c < count; ++c) out[i + c] = floatToHalf(rgba[channels[c]]) } }
    case gl.UNSIGNED_SHORT_5_6_5:
      if (format !== gl.RGB) return null
      return {
        Type: Uint16Array,
        size: 1,
        write: (out, i, rgba) => {
          out[i] = (Math.round(rgba[0] * 31) << 11) | (Math.round(rgba[1] * 63) << 5) | Math.round(rgba[2] * 31)
        }
      }
    case gl.UNSIGNED_SHORT_4_4_4_4:
      if (format !== gl.RGBA) return null
      return {
        Type: Uint16Array,
        size: 1,
        write: (out, i, rgba) => {
          out[i] = (Math.round(rgba[0] * 15) << 12) | (Math.round(rgba[1] * 15) << 8) |
            (Math.round(rgba[2] * 15) << 4) | Math.round(rgba[3] * 15)
        }
      }
    case gl.UNSIGNED_SHORT_5_5_5_1:
      if (format !== gl.RGBA) return null
      return {
        Type: Uint16Array,
        size: 1,
        write: (out, i, rgba) => {
          out[i] = (Math.round(rgba[0] * 31) << 11) | (Math.round(rgba[1] * 31) << 6) |
            (Math.round(rgba[2] * 31) << 1) | Math.round(rgba[3])
        }
      }
    case UNSIGNED_INT_10F_11F_11F_REV:
      if (format !== gl.RGB) return null
      return {
        Type: Uint32Array,
        size: 1,
        write: (out, i, rgba) => {
          out[i] = ((floatToUnsignedFloat(rgba[2], 5) << 22) |
            (floatToUnsignedFloat(rgba[1], 6) << 11) |
            floatToUnsignedFloat(rgba[0], 6)) >>> 0
        }
      }
    case UNSIGNED_INT_2_10_10_10_REV:
      if (format !== gl.RGBA) return null
      return {
        Type: Uint32Array,
        size: 1,
        write: (out, i, rgba) => {
          out[i] = ((Math.round(rgba[3] * 3) << 30) |
            (Math.round(rgba[2] * 1023) << 20) |
            (Math.round(rgba[1] * 1023) << 10) |
            Math.round(rgba[0] * 1023)) >>> 0
        }
      }
    default:
      return null
  }
}

function packImageSource (image, region, format, type, flipY, premultiply) {
  const encoder = imagePixelEncoder(format, type)
  if (!encoder) return null
  const { x, y, width, height, depth, imageHeight } = region
  const out = new encoder.Type(width * height * depth * encoder.size)
  const data = image.data
  const rgba = new Float32Array(4)
  let i = 0
  for (let z = 0; z < depth; ++z) {
    for (let row = 0; row < height; ++row) {
      const offsetRow = y + z * imageHeight + row
      const sourceRow = flipY ? image.height - 1 - offsetRow : offsetRow
      for (let col = 0; col < width; ++col) {
        const s = (sourceRow * image.width + x + col) * 4
        const alpha = data[s + 3] / 255
        const scale = premultiply ? alpha : 1
        rgba[0] = data[s] / 255 * scale
        rgba[1] = data[s + 1] / 255 * scale
        rgba[2] = data[s + 2] / 255 * scale
        rgba[3] = alpha
        encoder.write(out, i, rgba)
        i += encoder.size
      }
    }
  }
  return out
}

function formatSize (internalFormat) {
  switch (internalFormat) {
    case gl.ALPHA:
    case gl.LUMINANCE:
      return 1
    case gl.LUMINANCE_ALPHA:
      return 2
    case gl.RGB:
      return 3
    case gl.RGBA:
      return 4
  }
  return 0
}

function convertPixels (pixels) {
  if (typeof pixels === 'object' && pixels !== null) {
    if (isInstanceOfType(pixels, 'ArrayBuffer')) {
      return new Uint8Array(pixels)
    } else if (ArrayBuffer.isView(pixels)) {
      return unpackTypedArray(pixels)
    } else if (isInstanceOfType(pixels, 'Buffer')) {
      return new Uint8Array(pixels)
    }
  }
  return null
}

function checkFormat (format) {
  return (
    format === gl.ALPHA ||
    format === gl.LUMINANCE_ALPHA ||
    format === gl.LUMINANCE ||
    format === gl.RGB ||
    format === gl.RGBA)
}

function validCubeTarget (target) {
  return target === gl.TEXTURE_CUBE_MAP_POSITIVE_X ||
    target === gl.TEXTURE_CUBE_MAP_NEGATIVE_X ||
    target === gl.TEXTURE_CUBE_MAP_POSITIVE_Y ||
    target === gl.TEXTURE_CUBE_MAP_NEGATIVE_Y ||
    target === gl.TEXTURE_CUBE_MAP_POSITIVE_Z ||
    target === gl.TEXTURE_CUBE_MAP_NEGATIVE_Z
}

function toIntPtr (value) {
  value = Math.trunc(+value)
  return Number.isFinite(value) ? value : 0
}

module.exports = {
  bindPublics,
  checkObject,
  isTypedArray,
  toIntPtr,
  isValidString,
  vertexCount,
  typeSize,
  uniformTypeSize,
  unpackTypedArray,
  extractImageData,
  packImageSource,
  formatSize,
  checkFormat,
  checkUniform,
  convertPixels,
  validCubeTarget
}
