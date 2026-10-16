const ASTC_BLOCKS = ['4x4', '5x4', '5x5', '6x5', '6x6', '8x5', '8x6', '8x8', '10x5', '10x6', '10x8', '10x10', '12x10', '12x12']

const astcConstants = () => {
  const constants = {}
  ASTC_BLOCKS.forEach((block, i) => {
    constants[`COMPRESSED_RGBA_ASTC_${block}_KHR`] = 0x93B0 + i
    constants[`COMPRESSED_SRGB8_ALPHA8_ASTC_${block}_KHR`] = 0x93D0 + i
  })
  return constants
}

const DEFINITIONS = {
  s3tc: {
    COMPRESSED_RGB_S3TC_DXT1_EXT: 0x83F0,
    COMPRESSED_RGBA_S3TC_DXT1_EXT: 0x83F1,
    COMPRESSED_RGBA_S3TC_DXT3_EXT: 0x83F2,
    COMPRESSED_RGBA_S3TC_DXT5_EXT: 0x83F3
  },
  s3tc_srgb: {
    COMPRESSED_SRGB_S3TC_DXT1_EXT: 0x8C4C,
    COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT: 0x8C4D,
    COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT: 0x8C4E,
    COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT: 0x8C4F
  },
  etc: {
    COMPRESSED_R11_EAC: 0x9270,
    COMPRESSED_SIGNED_R11_EAC: 0x9271,
    COMPRESSED_RG11_EAC: 0x9272,
    COMPRESSED_SIGNED_RG11_EAC: 0x9273,
    COMPRESSED_RGB8_ETC2: 0x9274,
    COMPRESSED_SRGB8_ETC2: 0x9275,
    COMPRESSED_RGB8_PUNCHTHROUGH_ALPHA1_ETC2: 0x9276,
    COMPRESSED_SRGB8_PUNCHTHROUGH_ALPHA1_ETC2: 0x9277,
    COMPRESSED_RGBA8_ETC2_EAC: 0x9278,
    COMPRESSED_SRGB8_ALPHA8_ETC2_EAC: 0x9279
  },
  astc: astcConstants(),
  bptc: {
    COMPRESSED_RGBA_BPTC_UNORM_EXT: 0x8E8C,
    COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT: 0x8E8D,
    COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT: 0x8E8E,
    COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT: 0x8E8F
  },
  rgtc: {
    COMPRESSED_RED_RGTC1_EXT: 0x8DBB,
    COMPRESSED_SIGNED_RED_RGTC1_EXT: 0x8DBC,
    COMPRESSED_RED_GREEN_RGTC2_EXT: 0x8DBD,
    COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT: 0x8DBE
  }
}

const EXTENSION_NAMES = {
  s3tc: 'WEBGL_compressed_texture_s3tc',
  s3tc_srgb: 'WEBGL_compressed_texture_s3tc_srgb',
  etc: 'WEBGL_compressed_texture_etc',
  astc: 'WEBGL_compressed_texture_astc',
  bptc: 'EXT_texture_compression_bptc',
  rgtc: 'EXT_texture_compression_rgtc'
}

function createFactory (name) {
  const constants = DEFINITIONS[name]
  return function (ctx) {
    const supported = ctx.getSupportedExtensions()
    if (!supported || supported.indexOf(EXTENSION_NAMES[name]) < 0) { return null }
    const extension = Object.assign({}, constants)
    if (name === 'astc') { extension.getSupportedProfiles = () => ['ldr'] }
    if (!ctx._compressedFormats) { ctx._compressedFormats = new Set() }
    for (const value of Object.values(constants)) {
      ctx._compressedFormats.add(value)
    }
    return extension
  }
}

module.exports = {
  getWebGLCompressedTextureS3TC: createFactory('s3tc'),
  getWebGLCompressedTextureS3TCSRGB: createFactory('s3tc_srgb'),
  getWebGLCompressedTextureETC: createFactory('etc'),
  getWebGLCompressedTextureASTC: createFactory('astc'),
  getEXTTextureCompressionBPTC: createFactory('bptc'),
  getEXTTextureCompressionRGTC: createFactory('rgtc')
}
