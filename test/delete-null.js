'use strict'

const tape = require('tape')
const createContext = require('../index')

tape('delete* ignores null and undefined', function (t) {
  for (const webgl2 of [false, true]) {
    const gl = createContext(4, 4, { createWebGL2Context: webgl2 })
    const names = ['deleteBuffer', 'deleteFramebuffer', 'deleteRenderbuffer', 'deleteProgram', 'deleteShader', 'deleteTexture']
    if (webgl2) {
      names.push('deleteVertexArray')
    }
    for (const name of names) {
      for (const value of [null, undefined]) {
        gl[name](value)
        t.equal(gl.getError(), gl.NO_ERROR, name + '(' + value + ')')
      }
    }
    const ext = gl.getExtension('OES_vertex_array_object')
    if (ext) {
      ext.deleteVertexArrayOES(null)
      ext.deleteVertexArrayOES(undefined)
      t.equal(gl.getError(), gl.NO_ERROR, 'deleteVertexArrayOES')
    }
    gl.getExtension('STACKGL_destroy_context').destroy()
  }
  t.end()
})
