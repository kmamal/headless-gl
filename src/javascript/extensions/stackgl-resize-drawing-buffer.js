export class STACKGLResizeDrawingBuffer {
  constructor (ctx) {
    this.resize = ctx.resize.bind(ctx)
  }
}

export function getSTACKGLResizeDrawingBuffer (ctx) {
  return new STACKGLResizeDrawingBuffer(ctx)
}
