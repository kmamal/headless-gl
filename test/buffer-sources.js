'use strict'

const tape = require('tape')
const createContext = require('../index')

function check (t, name, source, size) {
  const gl = createContext(8, 8)
  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)

  gl.bufferData(gl.ARRAY_BUFFER, source, gl.STATIC_DRAW)
  t.equal(gl.getError(), gl.NO_ERROR, `bufferData accepts ${name}`)
  t.equal(gl.getBufferParameter(gl.ARRAY_BUFFER, gl.BUFFER_SIZE), size, `${name} size in bytes`)

  gl.bufferSubData(gl.ARRAY_BUFFER, 0, source)
  t.equal(gl.getError(), gl.NO_ERROR, `bufferSubData accepts ${name}`)

  gl.getExtension('STACKGL_destroy_context').destroy()
}

tape('bufferData accepts every AllowSharedBufferSource', function (t) {
  if (typeof Float16Array !== 'undefined') {
    check(t, 'a Float16Array', new Float16Array([1, 2, 3, 4]), 8)
  }
  check(t, 'a BigInt64Array', new BigInt64Array([1n, 2n]), 16)
  check(t, 'a BigUint64Array', new BigUint64Array([1n, 2n]), 16)
  check(t, 'a DataView', new DataView(new ArrayBuffer(12), 4), 8)
  check(t, 'a SharedArrayBuffer', new SharedArrayBuffer(12), 12)
  check(t, 'a view of a SharedArrayBuffer', new Float32Array(new SharedArrayBuffer(16)), 16)
  t.end()
})
