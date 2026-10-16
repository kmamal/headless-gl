'use strict'

const tape = require('tape')
const createContext = require('../index')
const makeProgram = require('./util/make-program')

tape('deleteBuffer detaches the buffer only from the bound OES vertex array object', function (t) {
  const gl = createContext(4, 4)
  const ext = gl.getExtension('OES_vertex_array_object')
  const program = makeProgram(gl, 'attribute vec4 p; void main() { gl_Position = p; }', 'void main() { gl_FragColor = vec4(1); }')
  gl.bindAttribLocation(program, 0, 'p')
  gl.linkProgram(program)
  gl.useProgram(program)

  const buffer = gl.createBuffer()
  const first = ext.createVertexArrayOES()
  const second = ext.createVertexArrayOES()
  for (const vao of [first, second]) {
    ext.bindVertexArrayOES(vao)
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, 64, gl.STATIC_DRAW)
    gl.enableVertexAttribArray(0)
    gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 0, 0)
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, null)
  gl.deleteBuffer(buffer)

  t.equal(gl.getVertexAttrib(0, gl.VERTEX_ATTRIB_ARRAY_BUFFER_BINDING), null)
  gl.drawArrays(gl.TRIANGLES, 0, 3)
  t.equal(gl.getError(), gl.INVALID_OPERATION, 'the bound vertex array object has no buffer left')

  ext.bindVertexArrayOES(first)
  t.equal(gl.getVertexAttrib(0, gl.VERTEX_ATTRIB_ARRAY_BUFFER_BINDING), buffer)
  gl.drawArrays(gl.TRIANGLES, 0, 3)
  t.equal(gl.getError(), gl.NO_ERROR, 'other vertex array objects keep the buffer')

  gl.getExtension('STACKGL_destroy_context').destroy()
  t.end()
})
