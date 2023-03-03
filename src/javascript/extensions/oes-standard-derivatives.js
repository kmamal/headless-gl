export class OESStandardDerivatives {
  constructor () {
    this.FRAGMENT_SHADER_DERIVATIVE_HINT_OES = 0x8B8B
  }
}

export function getOESStandardDerivatives (context) {
  let result = null
  const exts = context.getSupportedExtensions()

  if (exts && exts.indexOf('OES_standard_derivatives') >= 0) {
    result = new OESStandardDerivatives()
  }

  return result
}
