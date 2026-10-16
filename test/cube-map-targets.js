'use strict'

const tape = require('tape')
const createContext = require('../index')

tape('image uploads to cube map targets without a bound texture', function (t) {
  const gl = createContext(4, 4)
  gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
  t.equal(gl.getError(), gl.INVALID_OPERATION, 'texImage2D to a face')
  gl.copyTexImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGBA, 0, 0, 1, 1, 0)
  t.equal(gl.getError(), gl.INVALID_OPERATION, 'copyTexImage2D to a face')
  gl.copyTexSubImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, 0, 0, 0, 0, 1, 1)
  t.equal(gl.getError(), gl.INVALID_OPERATION, 'copyTexSubImage2D to a face')
  gl.copyTexSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 0, 0, 1, 1)
  t.equal(gl.getError(), gl.INVALID_OPERATION, 'copyTexSubImage2D to TEXTURE_2D')
  gl.texImage2D(gl.TEXTURE_CUBE_MAP, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
  t.equal(gl.getError(), gl.INVALID_ENUM, 'texImage2D to TEXTURE_CUBE_MAP')
  gl.copyTexImage2D(gl.TEXTURE_CUBE_MAP, 0, gl.RGBA, 0, 0, 1, 1, 0)
  t.equal(gl.getError(), gl.INVALID_ENUM, 'copyTexImage2D to TEXTURE_CUBE_MAP')
  gl.destroy()
  t.end()
})
