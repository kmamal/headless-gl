'use strict'

const tape = require('tape')
const createContext = require('../index')

tape('invalid arguments return null', function (t) {
  for (const gl of [createContext(4, 4), createContext(4, 4, { createWebGL2Context: true })]) {
    t.equal(gl.getShaderPrecisionFormat(0x1234, gl.HIGH_FLOAT), null, 'getShaderPrecisionFormat')
    t.equal(gl.getError(), gl.INVALID_ENUM)
    t.equal(gl.getUniformLocation(gl.createProgram(), 'a\u0001'), null, 'getUniformLocation')
    t.equal(gl.getError(), gl.INVALID_VALUE)
    gl.getExtension('STACKGL_destroy_context').destroy()
  }
  t.end()
})
