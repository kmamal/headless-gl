import bindings from "bindings"

export const NativeWebGL = bindings('webgl')
export const NativeWebGLRenderingContext = NativeWebGL.WebGLRenderingContext
process.on('exit', NativeWebGL.cleanup)

export const gl = NativeWebGLRenderingContext.prototype

// from binding.gyp
delete gl['1.0.0']

// from binding.gyp
delete NativeWebGLRenderingContext['1.0.0']
