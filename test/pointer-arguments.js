'use strict'

const tape = require('tape')
const createContext = require('../index')

tape('drawElementsInstancedANGLE keeps 64-bit offsets', function (t) {
  const gl = createContext(4, 4)
  const ext = gl.getExtension('ANGLE_instanced_arrays')
  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 0, 0]), gl.STATIC_DRAW)
  ext.drawElementsInstancedANGLE(gl.TRIANGLES, 3, gl.UNSIGNED_SHORT, 2 ** 32, 1)
  t.equal(gl.getError(), gl.INVALID_OPERATION)
  gl.getExtension('STACKGL_destroy_context').destroy()
  t.end()
})
