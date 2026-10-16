'use strict'

const tape = require('tape')
const createContext = require('../index')

tape('private methods are not exposed', function (t) {
  for (const gl of [createContext(4, 4), createContext(4, 4, { createWebGL2Context: true })]) {
    t.equal(gl.setError, undefined, 'setError')
    t.equal(gl.getUniformuiv, undefined, 'getUniformuiv')
    t.equal(typeof gl.resize, 'function', 'resize')
    gl.resize(6, 5)
    t.equal(gl.drawingBufferWidth, 6)
    t.equal(gl.drawingBufferHeight, 5)
    gl.destroy()
    t.throws(() => gl.clear(gl.COLOR_BUFFER_BIT), /Invalid GL context/, 'destroy releases the context')
  }
  t.end()
})
