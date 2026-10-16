'use strict'

const tape = require('tape')
const createContext = require('../index')

tape('resize keeps separate read and draw framebuffer bindings', function (t) {
  const gl = createContext(4, 4, { createWebGL2Context: true })
  const read = gl.createFramebuffer()
  const draw = gl.createFramebuffer()
  gl.bindFramebuffer(gl.READ_FRAMEBUFFER, read)
  gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, draw)

  gl.resize(8, 8)
  t.equal(gl.getParameter(gl.READ_FRAMEBUFFER_BINDING), read, 'read binding')
  t.equal(gl.getParameter(gl.DRAW_FRAMEBUFFER_BINDING), draw, 'draw binding')
  t.equal(gl.getError(), gl.NO_ERROR)

  gl.getExtension('STACKGL_destroy_context').destroy()
  t.end()
})
