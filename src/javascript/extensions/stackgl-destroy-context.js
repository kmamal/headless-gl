export class STACKGLDestroyContext {
  constructor (ctx) {
    this.destroy = ctx.destroy.bind(ctx)
  }
}

export function getSTACKGLDestroyContext (ctx) {
  return new STACKGLDestroyContext(ctx)
}
